from django.urls import path
from .views import (
    ProfileMeView,
    ExperienceCreateView,
    ExperienceDetailView,
    EducationCreateView,
    EducationDetailView,
    ProjectCreateView,
    ProjectDetailView,
    ResumeUploadView,
    ProfilePictureUploadView,
    AIResumeAnalyzerView
)

urlpatterns = [
    path('me/', ProfileMeView.as_view(), name='profile_me'),
    path('me/experience/', ExperienceCreateView.as_view(), name='profile_experience_create'),
    path('me/experience/<uuid:pk>/', ExperienceDetailView.as_view(), name='profile_experience_detail'),
    path('me/education/', EducationCreateView.as_view(), name='profile_education_create'),
    path('me/education/<uuid:pk>/', EducationDetailView.as_view(), name='profile_education_detail'),
    path('me/project/', ProjectCreateView.as_view(), name='profile_project_create'),
    path('me/project/<uuid:pk>/', ProjectDetailView.as_view(), name='profile_project_detail'),
    path('me/resume/', ResumeUploadView.as_view(), name='profile_resume_upload'),
    path('me/avatar/', ProfilePictureUploadView.as_view(), name='profile_avatar_upload'),
    path('ai/analyze-resume/', AIResumeAnalyzerView.as_view(), name='ai_analyze_resume'),
]
