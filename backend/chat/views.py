from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from chat.models import ChatRoom, Message
from chat.serializers import ChatRoomSerializer, MessageSerializer

class ChatRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        # Retrieve rooms where user is either the seeker or the recruiter
        return ChatRoom.objects.filter(Q(seeker=user) | Q(recruiter=user)).select_related(
            'seeker__profile',
            'recruiter__profile',
            'job__company',
            'job__recruiter'
        ).prefetch_related('messages')

    def create(self, request, *args, **kwargs):
        # Allow creating rooms
        seeker_id = request.data.get('seeker')
        recruiter_id = request.data.get('recruiter')
        job_id = request.data.get('job')

        if not seeker_id or not recruiter_id:
            return Response({"error": "seeker and recruiter IDs are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create the room (to prevent duplicate rooms for same parameters)
        room, created = ChatRoom.objects.get_or_create(
            seeker_id=seeker_id,
            recruiter_id=recruiter_id,
            job_id=job_id
        )

        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class MessageHistoryListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room_id = self.kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)

        # Enforce room membership
        if self.request.user != room.seeker and self.request.user != room.recruiter:
            self.permission_denied(self.request, message="You are not a member of this chat room.")

        return Message.objects.select_related('sender').filter(room=room)

class MarkRoomMessagesReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)

        # Enforce room membership
        if request.user != room.seeker and request.user != room.recruiter:
            return Response({"error": "You are not a member of this chat room."}, status=status.HTTP_403_FORBIDDEN)

        # Mark unread messages sent by others in this room as read
        Message.objects.filter(room=room, is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({"message": "Messages marked as read"}, status=status.HTTP_200_OK)
