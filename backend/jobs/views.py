from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q, Case, When
from drf_spectacular.utils import extend_schema

from .models import Company, Job, Application, SwipeHistory
from .serializers import JobSerializer, ApplicationSerializer, CompanySerializer
from .permissions import IsRecruiterOrAdmin, IsJobOwner
from profiles.utils import get_recommendation_text_for_candidate
from .recommendations import rank_jobs_for_candidate
from notifications.utils import (
    send_new_application_notification,
    send_interview_scheduled_notification,
    send_interview_response_notification
)

class JobCreateView(generics.CreateAPIView):
    serializer_class = JobSerializer
    permission_classes = (IsRecruiterOrAdmin,)

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.AllowAny(),)
        return (IsRecruiterOrAdmin(), IsJobOwner())

class RecruiterJobsListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = (IsRecruiterOrAdmin,)

    def get_queryset(self):
        # Admins can list all, recruiters only their own postings
        if self.request.user.role == 'admin':
            queryset = Job.objects.all()
        else:
            queryset = Job.objects.filter(recruiter=self.request.user)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

class CompanyDetailView(generics.RetrieveUpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.AllowAny(),)
        return (IsRecruiterOrAdmin(),)

class JobApplicantsListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = (IsRecruiterOrAdmin,)

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        job = get_object_or_404(Job, id=job_id)
        
        # Verify ownership
        if job.recruiter != self.request.user and self.request.user.role != 'admin':
            self.permission_denied(self.request, message="You are not authorized to view applicants for this job.")
            
        return Application.objects.filter(job=job)

class ApplicationStatusUpdateView(APIView):
    permission_classes = (IsRecruiterOrAdmin,)

    @extend_schema(
        request=None,
        responses={200: ApplicationSerializer}
    )
    def patch(self, request, pk):
        application = get_object_or_404(Application, id=pk)
        
        # Verify ownership (recruiter of the job)
        if application.job.recruiter != request.user and request.user.role != 'admin':
            return Response({"error": "You do not own the job listing associated with this application."}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        if new_status not in ['applied', 'under_review', 'shortlisted', 'interviewing', 'offered', 'accepted', 'rejected']:
            return Response({"error": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)
            
        application.status = new_status
        application.save()
        
        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RecruiterAnalyticsView(APIView):
    permission_classes = (IsRecruiterOrAdmin,)

    def get(self, request):
        user = request.user
        
        # Query stats filtered by recruiter postings
        jobs_query = Job.objects.filter(recruiter=user) if user.role != 'admin' else Job.objects.all()
        
        total_jobs = jobs_query.count()
        active_jobs = jobs_query.filter(is_active=True).count()
        
        applications_query = Application.objects.filter(job__recruiter=user) if user.role != 'admin' else Application.objects.all()
        total_applicants = applications_query.count()
        
        # Group calculations
        status_counts = applications_query.values('status').annotate(count=Count('id'))
        
        stats = {
            "applied": 0,
            "shortlisted": 0,
            "accepted": 0,
            "rejected": 0
        }
        for item in status_counts:
            stats[item['status']] = item['count']
            
        accepted_count = stats["accepted"]
        hire_rate = (accepted_count / total_applicants * 100) if total_applicants > 0 else 0.0
        
        return Response({
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applicants": total_applicants,
            "status_breakdown": stats,
            "hire_rate": round(hire_rate, 2)
        }, status=status.HTTP_200_OK)

class JobDeckView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        
        # Swiped jobs
        swiped_ids = SwipeHistory.objects.filter(user=user).values_list('job_id', flat=True)
        
        # Filter active jobs not swiped
        jobs = Job.objects.filter(is_active=True, status='published').exclude(id__in=swiped_ids)
        
        # Attempt AI Ranking recommendation if user seeker has a profile
        if hasattr(user, 'profile') and jobs.exists():
            candidate_text = get_recommendation_text_for_candidate(user)
            ranked_ids = rank_jobs_for_candidate(candidate_text, list(jobs))
            
            if ranked_ids:
                preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(ranked_ids)])
                return jobs.filter(id__in=ranked_ids).order_by(preserved)

        # FALLBACK: Apply matching skills ordering if seeker profile has skills
        if hasattr(user, 'profile'):
            user_skills = user.profile.skills.all()
            if user_skills.exists():
                jobs = jobs.annotate(
                    match_count=Count('skills_required', filter=Q(skills_required__in=user_skills))
                ).order_by('-match_count', '-created_at')
            else:
                jobs = jobs.order_by('-created_at')
        else:
            jobs = jobs.order_by('-created_at')
            
        return jobs

class SwipeActionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        request=None,
        responses={201: dict}
    )
    def post(self, request):
        job_id = request.data.get('job_id')
        action = request.data.get('action') # 'like', 'dislike', 'save'

        if not job_id or not action:
            return Response({"error": "job_id and action are required"}, status=status.HTTP_400_BAD_REQUEST)

        if action not in ['like', 'dislike', 'save']:
            return Response({"error": "Invalid action value"}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, id=job_id)

        # Check if already swiped
        if SwipeHistory.objects.filter(user=request.user, job=job).exists():
            return Response({"error": "You have already swiped on this job listing."}, status=status.HTTP_400_BAD_REQUEST)

        applied = False
        application_id = None

        if action == 'like':
            if request.user.role != 'job_seeker':
                return Response({"error": "Only job seekers can swipe right (apply) on jobs."}, status=status.HTTP_400_BAD_REQUEST)

            profile = request.user.profile
            latest_resume = profile.resumes.first()
            if not latest_resume:
                return Response(
                    {"error": "Please upload a resume in your profile before swiping right/applying to jobs."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create application
            app, created = Application.objects.get_or_create(
                job=job,
                applicant=request.user,
                defaults={
                    'resume': latest_resume,
                    'status': 'applied',
                    'cover_letter': request.data.get('cover_letter')
                }
            )
            applied = True
            application_id = app.id
            if created:
                try:
                    send_new_application_notification(app)
                except Exception as e:
                    import logging
                    logging.getLogger("jobs.views").warning(f"Failed to send application notification: {e}")

        # Save Swipe history
        SwipeHistory.objects.create(
            user=request.user,
            job=job,
            action=action
        )

        return Response({
            "message": f"Successfully registered swipe: {action}",
            "applied": applied,
            "application_id": application_id
        }, status=status.HTTP_201_CREATED)

class SwipeUndoView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        request=None,
        responses={200: dict}
    )
    def post(self, request):
        latest_swipe = SwipeHistory.objects.filter(user=request.user).order_by('-created_at').first()
        if not latest_swipe:
            return Response({"error": "No recent swipes found to undo."}, status=status.HTTP_400_BAD_REQUEST)
            
        job = latest_swipe.job
        if latest_swipe.action == 'like':
            Application.objects.filter(applicant=request.user, job=job).delete()
            
        latest_swipe.delete()
        serializer = JobSerializer(job)
        return Response({
            "message": "Successfully undid last swipe.",
            "job": serializer.data
        }, status=status.HTTP_200_OK)

class JobSearchView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True, status='published')

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(company__name__icontains=q) |
                Q(location__icontains=q)
            )

        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)

        salary_min = self.request.query_params.get('salary_min')
        if salary_min:
            try:
                queryset = queryset.filter(salary_max__gte=int(salary_min))
            except ValueError:
                pass

        job_types = self.request.query_params.get('job_type')
        if job_types:
            job_types_list = [jt.strip() for jt in job_types.split(',') if jt.strip()]
            if job_types_list:
                queryset = queryset.filter(job_type__in=job_types_list)

        employment_types = self.request.query_params.get('employment_type')
        if employment_types:
            employment_types_list = [et.strip() for et in employment_types.split(',') if et.strip()]
            if employment_types_list:
                queryset = queryset.filter(employment_type__in=employment_types_list)

        experience_levels = self.request.query_params.get('experience_level')
        if experience_levels:
            exp_levels_list = [el.strip() for el in experience_levels.split(',') if el.strip()]
            if exp_levels_list:
                queryset = queryset.filter(experience_level__in=exp_levels_list)

        company_type = self.request.query_params.get('company_type')
        if company_type:
            queryset = queryset.filter(company__company_type=company_type)

        skills = self.request.query_params.get('skills')
        if skills:
            skills_list = [s.strip() for s in skills.split(',') if s.strip()]
            if skills_list:
                queryset = queryset.filter(skills_required__name__in=skills_list).distinct()

        recently_posted = self.request.query_params.get('recently_posted')
        if recently_posted == 'true':
            seven_days_ago = timezone.now() - timedelta(days=7)
            queryset = queryset.filter(created_at__gte=seven_days_ago)

        low_competition = self.request.query_params.get('low_competition')
        if low_competition == 'true':
            queryset = queryset.annotate(app_count=Count('applications')).filter(app_count__lt=5)

        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)

        return queryset

class SeekerApplicationsListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.filter(applicant=user)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset


from .models import Interview
from .serializers import InterviewSerializer
from .calendar_utils import sync_event_to_google_calendar

class InterviewListCreateView(generics.ListCreateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        app_id = self.request.query_params.get('application')
        if app_id:
            return Interview.objects.filter(application_id=app_id)
        return Interview.objects.none()

    def perform_create(self, serializer):
        application = serializer.validated_data.get('application')
        if application.job.recruiter != self.request.user:
            self.permission_denied(self.request, message="You are not the recruiter for this job.")
            
        interview = serializer.save()
        try:
            send_interview_scheduled_notification(interview)
        except Exception as e:
            import logging
            logging.getLogger("jobs.views").warning(f"Failed to send interview schedule notification: {e}")
        
        sync_calendar = self.request.data.get('sync_calendar', True)
        if sync_calendar:
            try:
                gcal_id = sync_event_to_google_calendar(interview)
                interview.google_calendar_event_id = gcal_id
                interview.save()
            except Exception as e:
                import logging
                logging.getLogger("jobs.views").warning(f"Google Calendar Sync failed: {e}")

class InterviewResponseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        interview = get_object_or_404(Interview, id=pk)
        
        if interview.application.applicant != request.user:
            return Response({"error": "You are not authorized to respond to this interview slot."}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        if new_status not in ['accepted', 'declined']:
            return Response({"error": "Invalid status value. Choose accepted or declined."}, status=status.HTTP_400_BAD_REQUEST)
            
        interview.status = new_status
        interview.save()
        
        if new_status == 'accepted':
            application = interview.application
            application.status = 'interviewing'
            application.save()
            
        try:
            send_interview_response_notification(interview)
        except Exception as e:
            import logging
            logging.getLogger("jobs.views").warning(f"Failed to send interview response notification: {e}")
            
        return Response(InterviewSerializer(interview).data, status=status.HTTP_200_OK)

class MyInterviewsListView(generics.ListAPIView):
    serializer_class = InterviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'job_seeker':
            return Interview.objects.filter(application__applicant=user)
        elif user.role == 'recruiter':
            return Interview.objects.filter(application__job__recruiter=user)
        return Interview.objects.none()

from profiles.models import Profile, Skill, Experience, Education, Resume, Project

class SeekerDashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: dict})
    def get(self, request):
        user = request.user
        if user.role != 'job_seeker':
            return Response({"error": "Only job seekers can access the seeker dashboard."}, status=status.HTTP_400_BAD_REQUEST)
            
        profile = getattr(user, 'profile', None)
        
        # 1. Total Applications
        total_apps = Application.objects.filter(applicant=user).count()
        
        # 2. Saved Jobs
        saved_jobs = SwipeHistory.objects.filter(user=user, action='save').count()
        
        # 3. Profile Completion %
        completion = 0
        if profile:
            if profile.full_name: completion += 15
            if profile.phone: completion += 10
            if profile.bio: completion += 15
            if profile.portfolio_url or profile.linkedin_url or profile.github_url:
                url_count = sum(1 for url in [profile.portfolio_url, profile.linkedin_url, profile.github_url] if url)
                completion += url_count * 5
            if profile.skills.exists(): completion += 15
            if Experience.objects.filter(profile=profile).exists(): completion += 15
            if Education.objects.filter(profile=profile).exists(): completion += 15
            if Resume.objects.filter(profile=profile).exists(): completion += 15
            
        completion = min(completion, 100)
        
        # 4. ATS Score
        has_resume = Resume.objects.filter(profile=profile).exists() if profile else False
        ats_score = 85 if has_resume else 0
        
        # 5. Recommendation Count
        swiped_ids = SwipeHistory.objects.filter(user=user).values_list('job_id', flat=True)
        recommended_count = Job.objects.filter(is_active=True, status='published').exclude(id__in=swiped_ids).count()
        
        # 6. Upcoming Interviews
        upcoming_interviews = Interview.objects.filter(
            application__applicant=user,
            start_time__gte=timezone.now(),
            status='accepted'
        ).count()
        
        return Response({
            "total_applications": total_apps,
            "saved_jobs": saved_jobs,
            "profile_completion": completion,
            "ats_score": ats_score,
            "recommendation_count": recommended_count,
            "upcoming_interviews": upcoming_interviews
        }, status=status.HTTP_200_OK)

class ResetSwipesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: dict})
    def post(self, request):
        user = request.user
        SwipeHistory.objects.filter(user=user).delete()
        Application.objects.filter(applicant=user).delete()
        return Response({"message": "Successfully reset all swipe history and applications."}, status=status.HTTP_200_OK)

from profiles.ai_service import AIService

class AICoverLetterGeneratorView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: dict})
    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, id=job_id)
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return Response({"error": "Profile required to generate cover letter"}, status=status.HTTP_400_BAD_REQUEST)

        res = AIService.generate_cover_letter(profile, job)
        return Response(res, status=status.HTTP_200_OK)

class AIInterviewQuestionsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: dict})
    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, id=job_id)
        res = AIService.generate_interview_questions(job)
        return Response(res, status=status.HTTP_200_OK)

class AISkillGapAnalysisView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(responses={200: dict})
    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, id=job_id)
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return Response({"error": "Profile required to analyze skill gap"}, status=status.HTTP_400_BAD_REQUEST)

        res = AIService.analyze_skill_gap(profile, job)
        return Response(res, status=status.HTTP_200_OK)




