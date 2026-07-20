from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegisterView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    LogoutView,
    OAuthLoginView,
    CustomTokenObtainPairView
)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth_verify_email'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
    path('oauth/', OAuthLoginView.as_view(), name='auth_oauth'),
]
