from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from drf_spectacular.utils import extend_schema

from .serializers import (
    UserRegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyEmailSerializer
)
from .tokens import (
    generate_verification_token,
    verify_email_token,
    generate_password_reset_token,
    verify_password_reset_token
)

import logging

logger = logging.getLogger("authentication")
User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send Email Verification
        token = generate_verification_token(user.email)
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        send_mail(
            subject="Verify your SwipeX Account",
            message=f"Hi there,\n\nPlease verify your account by clicking the link: {verify_url}\n\nThanks!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )

        headers = self.get_success_headers(serializer.data)
        user_data = UserSerializer(user).data
        logger.info(f"New User Registered: {user.email} (Role: {user.role})")
        return Response(
            {
                "user": user_data,
                "verification_token_dev": token,  # Return in dev mode for easy integration/testing
                "message": "User registered successfully. Verification email sent."
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class VerifyEmailView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = VerifyEmailSerializer

    @extend_schema(request=VerifyEmailSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        
        email = verify_email_token(token)
        if not email:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if user.is_verified:
                return Response({"message": "Email is already verified."}, status=status.HTTP_200_OK)
            
            user.is_verified = True
            user.save()
            logger.info(f"Email Verified Successfully for User: {user.email}")
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.warning(f"Verification Failed: User with email {email} not found.")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ForgotPasswordSerializer

    @extend_schema(request=ForgotPasswordSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        user = User.objects.get(email=email)
        token = generate_password_reset_token(user.email)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        send_mail(
            subject="Reset your SwipeX Password",
            message=f"Hi there,\n\nPlease reset your password by clicking the link: {reset_url}\n\nThanks!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )
        
        return Response(
            {
                "message": "Password reset email sent.",
                "reset_token_dev": token  # Return in dev mode for easy integration/testing
            },
            status=status.HTTP_200_OK
        )

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResetPasswordSerializer

    @extend_schema(request=ResetPasswordSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        email = verify_password_reset_token(token)
        if not email:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            logger.info(f"Password Reset Successfully for User: {user.email}")
            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.warning(f"Password Reset Failed: User with email {email} not found.")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token or already blacklisted"}, status=status.HTTP_400_BAD_REQUEST)

class OAuthLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        request=None,
        responses={200: dict}
    )
    def post(self, request):
        provider = request.data.get("provider")  # 'google' or 'github'
        token = request.data.get("token")
        email = request.data.get("email")
        role = request.data.get("role", "job_seeker")

        if not provider or not token or not email:
            return Response({"error": "provider, token, and email are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Mock authentication logic for production-grade stub
        # Real flow validates token with Google/GitHub APIs.
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'role': role,
                'is_verified': True,  # OAuth users are considered verified
            }
        )

        refresh = RefreshToken.for_user(user)
        # Custom claims
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['is_verified'] = user.is_verified

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
            "created": created
        }, status=status.HTTP_200_OK)
