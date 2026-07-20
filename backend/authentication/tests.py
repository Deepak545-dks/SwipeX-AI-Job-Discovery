from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .tokens import generate_verification_token, generate_password_reset_token

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.logout_url = reverse('auth_logout')
        self.refresh_url = reverse('auth_token_refresh')
        self.verify_email_url = reverse('auth_verify_email')
        self.forgot_password_url = reverse('auth_forgot_password')
        self.reset_password_url = reverse('auth_reset_password')
        
        self.user_data = {
            "email": "seeker@example.com",
            "password": "SecurePassword123!",
            "role": "job_seeker"
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], self.user_data["email"])
        self.assertEqual(response.data["user"]["role"], self.user_data["role"])
        self.assertFalse(response.data["user"]["is_verified"])
        
        # Verify user is created in database
        self.assertTrue(User.objects.filter(email=self.user_data["email"]).exists())

    def test_duplicate_registration_fails(self):
        # Register once
        self.client.post(self.register_url, self.user_data)
        # Register again with same email
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_verification(self):
        # Register user
        register_resp = self.client.post(self.register_url, self.user_data)
        token = register_resp.data["verification_token_dev"]
        
        # Call verification endpoint
        verify_resp = self.client.post(self.verify_email_url, {"token": token})
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        
        # Check user is verified in DB
        user = User.objects.get(email=self.user_data["email"])
        self.assertTrue(user.is_verified)

    def test_invalid_email_verification_fails(self):
        response = self.client.post(self.verify_email_url, {"token": "invalidtoken123"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        # Create verified user
        user = User.objects.create_user(
            email=self.user_data["email"],
            password=self.user_data["password"],
            role=self.user_data["role"]
        )
        user.is_verified = True
        user.save()

        # Login
        response = self.client.post(self.login_url, {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], self.user_data["email"])

    def test_login_invalid_credentials_fails(self):
        response = self.client.post(self.login_url, {
            "email": self.user_data["email"],
            "password": "WrongPassword!"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        user = User.objects.create_user(
            email=self.user_data["email"],
            password=self.user_data["password"],
            role=self.user_data["role"]
        )
        # Login to get refresh token
        login_resp = self.client.post(self.login_url, {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
        refresh_token = login_resp.data["refresh"]

        # Call refresh endpoint
        refresh_resp = self.client.post(self.refresh_url, {"refresh": refresh_token})
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_resp.data)

    def test_logout(self):
        user = User.objects.create_user(
            email=self.user_data["email"],
            password=self.user_data["password"],
            role=self.user_data["role"]
        )
        login_resp = self.client.post(self.login_url, {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
        access_token = login_resp.data["access"]
        refresh_token = login_resp.data["refresh"]

        # Set auth header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Logout
        logout_resp = self.client.post(self.logout_url, {"refresh": refresh_token})
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)

        # Clear credentials and try to use blacklisted refresh token
        self.client.credentials()
        refresh_resp = self.client.post(self.refresh_url, {"refresh": refresh_token})
        self.assertEqual(refresh_resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_forgot_and_reset_password(self):
        user = User.objects.create_user(
            email=self.user_data["email"],
            password=self.user_data["password"],
            role=self.user_data["role"]
        )
        
        # Forgot password request
        forgot_resp = self.client.post(self.forgot_password_url, {"email": self.user_data["email"]})
        self.assertEqual(forgot_resp.status_code, status.HTTP_200_OK)
        token = forgot_resp.data["reset_token_dev"]

        # Reset password request
        new_password = "BrandNewPassword999!"
        reset_resp = self.client.post(self.reset_password_url, {
            "token": token,
            "password": new_password
        })
        self.assertEqual(reset_resp.status_code, status.HTTP_200_OK)

        # Verify password changed by logging in
        login_resp = self.client.post(self.login_url, {
            "email": self.user_data["email"],
            "password": new_password
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_security_headers_and_exception_handling(self):
        response = self.client.get(self.register_url)
        self.assertIn("X-Content-Type-Options", response)
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")
        self.assertIn("X-Frame-Options", response)
        self.assertEqual(response["X-Frame-Options"], "DENY")
        
        # Test custom exception handler structure on invalid POST
        invalid_resp = self.client.post(self.verify_email_url, {})
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", invalid_resp.data)
        self.assertIn("status_code", invalid_resp.data)

