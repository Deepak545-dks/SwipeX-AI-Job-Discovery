from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework import status
from rest_framework.test import APITestCase
from notifications.models import Notification, PushSubscription
from notifications.utils import (
    send_new_application_notification,
    send_interview_scheduled_notification
)
from jobs.models import Company, Job, Application, Interview
import datetime
from django.utils import timezone

User = get_user_model()

class NotificationTests(APITestCase):
    def setUp(self):
        # Create users
        self.recruiter = User.objects.create_user(
            email="recruiter_notif@example.com",
            password="SecurePassword123!",
            role="recruiter"
        )
        self.seeker = User.objects.create_user(
            email="seeker_notif@example.com",
            password="SecurePassword123!",
            role="job_seeker"
        )
        
        # Log in seeker
        resp = self.client.post(reverse('auth_login'), {
            "email": "seeker_notif@example.com",
            "password": "SecurePassword123!"
        })
        self.seeker_token = resp.data["access"]

        # Log in recruiter
        resp_rec = self.client.post(reverse('auth_login'), {
            "email": "recruiter_notif@example.com",
            "password": "SecurePassword123!"
        })
        self.recruiter_token = resp_rec.data["access"]

        # Setup basic company/job/application objects
        self.co = Company.objects.create(name="Stark Industries")
        self.job = Job.objects.create(
            recruiter=self.recruiter,
            company=self.co,
            title="Iron Man Assistant",
            description="Repair suits"
        )
        self.app = Application.objects.create(
            job=self.job,
            applicant=self.seeker,
            status='applied'
        )

        self.list_url = reverse('notification_list')

    def test_in_app_notification_lifecycle(self):
        # Create dummy notification
        notif = Notification.objects.create(
            recipient=self.seeker,
            title="Welcome",
            message="Welcome to SwipeX",
            notification_type="application"
        )

        # Retrieve notifications as seeker
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Welcome")
        self.assertFalse(response.data["results"][0]["is_read"])

        # Mark single notification as read
        read_url = reverse('mark_notification_read', kwargs={'pk': notif.id})
        response_read = self.client.post(read_url)
        self.assertEqual(response_read.status_code, status.HTTP_200_OK)
        self.assertTrue(response_read.data["is_read"])

        # Mark all notifications as read
        notif_2 = Notification.objects.create(
            recipient=self.seeker,
            title="Second Alert",
            message="Check applications",
            notification_type="application"
        )
        
        read_all_url = reverse('mark_all_notifications_read')
        response_read_all = self.client.post(read_all_url)
        self.assertEqual(response_read_all.status_code, status.HTTP_200_OK)
        
        notif_2.refresh_from_db()
        self.assertTrue(notif_2.is_read)

    def test_email_dispatch_and_inbox_counts(self):
        # Clear outbox
        mail.outbox = []

        # 1. Trigger New Candidate Application email notification
        send_new_application_notification(self.app)
        
        # Verify email added to Django's mock outbox
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("recruiter_notif@example.com", mail.outbox[0].to)
        self.assertIn("New Candidate Application for Iron Man Assistant", mail.outbox[0].subject)

        # Check in-app notification exists for recruiter
        recruiter_notifs = Notification.objects.filter(recipient=self.recruiter)
        self.assertEqual(recruiter_notifs.count(), 1)
        self.assertEqual(recruiter_notifs.first().notification_type, "application")

        # 2. Trigger Interview Scheduled email notification
        start = timezone.now() + datetime.timedelta(days=1)
        end = start + datetime.timedelta(hours=1)
        interview = Interview.objects.create(
            application=self.app,
            title="Screening Call",
            description="Fix Jarvis code",
            start_time=start,
            end_time=end
        )

        send_interview_scheduled_notification(interview)
        
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn("seeker_notif@example.com", mail.outbox[1].to)
        self.assertIn("Invitation: Interview for Iron Man Assistant", mail.outbox[1].subject)

        # Check in-app notification exists for candidate
        seeker_notifs = Notification.objects.filter(recipient=self.seeker)
        self.assertEqual(seeker_notifs.count(), 1)
        self.assertEqual(seeker_notifs.first().notification_type, "interview")

    def test_push_subscription_mock_registration(self):
        subscribe_url = reverse('push_subscribe')
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        response = self.client.post(subscribe_url, {
            "endpoint": "https://fcm.googleapis.com/fcm/send/mock_token",
            "p256dh": "key_p256dh",
            "auth": "auth_secret"
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PushSubscription.objects.filter(user=self.seeker).count(), 1)
