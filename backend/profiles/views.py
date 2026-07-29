from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db.models import Max
from drf_spectacular.utils import extend_schema

from .models import Profile, Skill, Education, Experience, Resume, Project
from .serializers import (
    ProfileSerializer,
    EducationSerializer,
    ExperienceSerializer,
    ResumeSerializer,
    ProjectSerializer
)

class ProfileMeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: ProfileSerializer})
    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    @extend_schema(request=ProfileSerializer, responses={200: ProfileSerializer})
    def put(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class ExperienceCreateView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ExperienceSerializer

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(profile=self.request.user.profile)

class EducationCreateView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = EducationSerializer

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(profile=self.request.user.profile)

class ProjectCreateView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(profile=self.request.user.profile)

class ResumeUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {
                        'type': 'string',
                        'format': 'binary'
                    }
                }
            }
        },
        responses={201: ResumeSerializer}
    )
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # File Validation
        # 1. Size restriction: 5MB maximum
        if file_obj.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds the 5MB limit"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Extension restriction: pdf, doc, docx
        ext = file_obj.name.split('.')[-1].lower()
        if ext not in ['pdf', 'doc', 'docx']:
            return Response({"error": "Only PDF, DOC, and DOCX formats are supported"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        
        # Determine current version number
        max_version = Resume.objects.filter(profile=profile).aggregate(Max('version'))['version__max']
        next_version = (max_version or 0) + 1
        
        resume = Resume(
            profile=profile,
            file=file_obj,
            version=next_version
        )
        resume.save()
        
        serializer = ResumeSerializer(resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ResumeDetailView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(profile=self.request.user.profile)

class ProfilePictureUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {
                        'type': 'string',
                        'format': 'binary'
                    }
                }
            }
        },
        responses={200: ProfileSerializer}
    )
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        if file_obj.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds the 5MB limit"}, status=status.HTTP_400_BAD_REQUEST)
        
        ext = file_obj.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'gif']:
            return Response({"error": "Only image files (JPG, JPEG, PNG, GIF) are supported"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        profile.profile_picture = file_obj
        profile.save()
        
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

from .ai_service import AIService
from .utils import extract_text_from_pdf

class AIResumeAnalyzerView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: dict})
    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        resume_id = request.data.get('resume_id')
        latest_resume = None
        if resume_id:
            try:
                latest_resume = Resume.objects.get(id=resume_id, profile=profile)
            except Resume.DoesNotExist:
                return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            latest_resume = profile.resumes.first()

        resume_text = ""
        if latest_resume and latest_resume.file:
            try:
                with latest_resume.file.open('rb') as f:
                    resume_text = extract_text_from_pdf(f)
            except Exception as e:
                import logging
                logging.getLogger("profiles.views").warning(f"Failed to read resume file text: {e}")

        analysis = AIService.analyze_resume(profile, resume_text)
        return Response(analysis, status=status.HTTP_200_OK)

