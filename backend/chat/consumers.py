import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"

        # Reject anonymous/unauthenticated connections
        if not self.user or self.user.is_anonymous:
            await self.close(code=4003) # Forbidden
            return

        # Check membership in the ChatRoom
        is_member = await self.check_room_membership()
        if not is_member:
            await self.close(code=4003)
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        action_type = data.get("type")

        if action_type == "chat_message":
            content = data.get("content")
            if not content or not content.strip():
                return
            
            # Save message in database
            msg = await self.save_message(content)
            
            # Broadcast message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_chat_message",
                    "id": str(msg.id),
                    "sender_id": str(self.user.id),
                    "sender_email": self.user.email,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                    "is_read": msg.is_read
                }
            )

        elif action_type == "typing_status":
            is_typing = bool(data.get("is_typing", False))
            
            # Broadcast typing status to room group (excluding the sender in client logic)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_typing_status",
                    "sender_email": self.user.email,
                    "is_typing": is_typing
                }
            )

        elif action_type == "read_receipt":
            # Mark all unread messages sent by others in this room as read
            await self.mark_messages_as_read()
            
            # Broadcast read notification to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_read_receipt",
                    "reader_email": self.user.email
                }
            )

    # Receiver handlers for group broadcasts
    async def broadcast_chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "id": event["id"],
            "sender_id": event["sender_id"],
            "sender_email": event["sender_email"],
            "content": event["content"],
            "created_at": event["created_at"],
            "is_read": event["is_read"]
        }))

    async def broadcast_typing_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing_status",
            "sender_email": event["sender_email"],
            "is_typing": event["is_typing"]
        }))

    async def broadcast_read_receipt(self, event):
        await self.send(text_data=json.dumps({
            "type": "read_receipt",
            "reader_email": event["reader_email"]
        }))

    # Database operations using database_sync_to_async
    @database_sync_to_async
    def check_room_membership(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return self.user == room.seeker or self.user == room.recruiter
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(
            room=room,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def mark_messages_as_read(self):
        room = ChatRoom.objects.get(id=self.room_id)
        # Update messages not sent by self
        Message.objects.filter(room=room, is_read=False).exclude(sender=self.user).update(is_read=True)


class CallConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer handling signaling and coordination for WebRTC video interviews
    and real-time shared drawing whiteboards.
    """
    async def connect(self):
        self.user = self.scope.get("user")
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"call_{self.room_id}"

        if not self.user or self.user.is_anonymous:
            await self.close(code=4003)
            return

        is_member = await self.check_room_membership()
        if not is_member:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        # Broadcast WebRTC offer/answer, ICE candidates, drawing inputs, or call signals to all members
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "broadcast_call_data",
                "sender_email": self.user.email,
                "payload": data
            }
        )

    async def broadcast_call_data(self, event):
        await self.send(text_data=json.dumps({
            "sender_email": event["sender_email"],
            "payload": event["payload"]
        }))

    @database_sync_to_async
    def check_room_membership(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return self.user == room.seeker or self.user == room.recruiter
        except ChatRoom.DoesNotExist:
            return False
