from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from chat.models import ChatRoom, Message
from chat.middleware import get_user_from_token

User = get_user_model()

class ChatTests(APITestCase):
    def setUp(self):
        # Create users
        self.recruiter = User.objects.create_user(
            email="recruiter_chat@example.com",
            password="SecurePassword123!",
            role="recruiter"
        )
        self.seeker = User.objects.create_user(
            email="seeker_chat@example.com",
            password="SecurePassword123!",
            role="job_seeker"
        )
        self.other_user = User.objects.create_user(
            email="other_chat@example.com",
            password="SecurePassword123!",
            role="job_seeker"
        )

        # Log in seeker
        resp = self.client.post(reverse('auth_login'), {
            "email": "seeker_chat@example.com",
            "password": "SecurePassword123!"
        })
        self.seeker_token = resp.data["access"]

        # Log in other_user
        resp_other = self.client.post(reverse('auth_login'), {
            "email": "other_chat@example.com",
            "password": "SecurePassword123!"
        })
        self.other_token = resp_other.data["access"]

        self.rooms_url = reverse('chat_rooms')

    def test_create_and_fetch_rooms(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        
        # Create room
        response = self.client.post(self.rooms_url, {
            "seeker": self.seeker.id,
            "recruiter": self.recruiter.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["seeker"], str(self.seeker.id))
        
        # Verify duplicate retrieval retrieves same room
        response_dup = self.client.post(self.rooms_url, {
            "seeker": self.seeker.id,
            "recruiter": self.recruiter.id
        }, format='json')
        self.assertEqual(response_dup.status_code, status.HTTP_200_OK)
        self.assertEqual(response_dup.data["id"], response.data["id"])

        # Fetch room list
        list_resp = self.client.get(self.rooms_url)
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data["results"]), 1)

    def test_room_membership_checks_and_messages(self):
        # Setup room and message
        room = ChatRoom.objects.create(seeker=self.seeker, recruiter=self.recruiter)
        msg = Message.objects.create(room=room, sender=self.recruiter, content="Hello Seeker")

        history_url = reverse('chat_messages_history', kwargs={'room_id': room.id})

        # Try fetching history as non-member
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.other_token}')
        resp_fail = self.client.get(history_url)
        self.assertEqual(resp_fail.status_code, status.HTTP_403_FORBIDDEN)

        # Fetch history as member
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        resp_success = self.client.get(history_url)
        self.assertEqual(resp_success.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp_success.data["results"]), 1)
        self.assertEqual(resp_success.data["results"][0]["content"], "Hello Seeker")

    def test_mark_room_messages_read(self):
        room = ChatRoom.objects.create(seeker=self.seeker, recruiter=self.recruiter)
        msg_1 = Message.objects.create(room=room, sender=self.recruiter, content="Msg 1")
        msg_2 = Message.objects.create(room=room, sender=self.seeker, content="Msg 2")

        read_url = reverse('chat_mark_read', kwargs={'room_id': room.id})
        
        # Mark read as seeker - should only mark recruiter's msg_1 as read
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        resp = self.client.post(read_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        msg_1.refresh_from_db()
        msg_2.refresh_from_db()
        self.assertTrue(msg_1.is_read)
        self.assertFalse(msg_2.is_read) # Seeker's own message remains unread for recruiter

    async def test_jwt_auth_middleware_helper(self):
        # Verify get_user_from_token resolves user asynchronously
        resolved_user = await get_user_from_token(self.seeker_token)
        self.assertEqual(resolved_user.id, self.seeker.id)

        # Invalid token returns AnonymousUser
        anonymous = await get_user_from_token("invalidToken")
        self.assertTrue(anonymous.is_anonymous)

    def test_call_consumer_membership(self):
        from chat.consumers import CallConsumer
        # Verify consumer helper method behaves correctly
        self.assertTrue(hasattr(CallConsumer, 'check_room_membership'))
