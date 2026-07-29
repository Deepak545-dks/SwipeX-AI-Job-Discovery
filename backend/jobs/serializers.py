from rest_framework import serializers
from .models import Company, Job, Application, Interview
from profiles.models import Skill, Resume
from profiles.serializers import SkillSlugRelatedField, ResumeSerializer, ProfileSerializer

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'website', 'logo_url', 'description', 'company_type', 'industry', 'employee_count', 'headquarters', 'founded_year', 'rating')

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True)
    company_type = serializers.ChoiceField(choices=Company.COMPANY_TYPE_CHOICES, write_only=True, required=False, default='mnc')
    company = CompanySerializer(read_only=True)
    skills_required = SkillSlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Skill.objects.all(),
        required=False
    )
    recruiter_email = serializers.EmailField(source='recruiter.email', read_only=True)
    ai_match_score = serializers.SerializerMethodField()
    similar_jobs = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            'id', 'company', 'company_name', 'company_type', 'title', 'description',
            'requirements', 'salary_min', 'salary_max', 'location',
            'country', 'state', 'city', 'apply_url', 'ai_match_score',
            'job_type', 'employment_type', 'experience_level',
            'skills_required', 'is_active', 'status', 'recruiter_email',
            'provider', 'original_url', 'expires_at', 'similar_jobs',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'company', 'recruiter_email', 'provider', 'original_url', 'expires_at', 'created_at', 'updated_at')

    def get_similar_jobs(self, obj):
        qs = Job.objects.filter(
            is_active=True, 
            status='published'
        ).exclude(id=obj.id).select_related('company')
        
        # Match by industry first
        similar = qs.filter(company__industry=obj.company.industry)[:3]
        if not similar.exists():
            # Fallback to similar job title names
            similar = qs.filter(title__icontains=obj.title.split()[0])[:3]
        
        return [{
            "id": s.id,
            "title": s.title,
            "company_name": s.company.name,
            "location": s.location,
            "salary_min": s.salary_min,
            "salary_max": s.salary_max
        } for s in similar]

    def get_ai_match_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return obj.ai_match_score or 75

        user = request.user
        if not hasattr(user, 'profile'):
            return obj.ai_match_score or 75

        # Real-time parsing: skills matching
        user_skills = set(user.profile.skills.values_list('name', flat=True))
        job_skills = set(obj.skills_required.values_list('name', flat=True))
        
        if not job_skills:
            return 80

        matching_skills = user_skills.intersection(job_skills)
        skill_score = (len(matching_skills) / len(job_skills)) * 50
        
        # Safely fetch experience level fallback
        user_exp = getattr(user.profile, 'experience_level', None)
        if not user_exp:
            exp_count = user.profile.experiences.count()
            if exp_count == 0:
                user_exp = 'junior'
            elif exp_count <= 2:
                user_exp = 'mid'
            else:
                user_exp = 'senior'

        experience_score = 30
        if user_exp == obj.experience_level:
            experience_score = 40

        # Safely fetch location fallback
        user_location = getattr(user.profile, 'location', None)
        if not user_location:
            last_exp = user.profile.experiences.first()
            if last_exp:
                user_location = last_exp.location

        location_score = 10
        if obj.job_type == 'remote' or (user_location and user_location.lower() in obj.location.lower()):
            location_score = 10

        final_score = int(skill_score + experience_score + location_score)
        return min(100, max(30, final_score))

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        company_type = validated_data.pop('company_type', 'mnc')
        skills_data = validated_data.pop('skills_required', [])
        
        # Get or create company
        company, created = Company.objects.get_or_create(
            name=company_name.strip(),
            defaults={'company_type': company_type}
        )
        if not created and company.company_type != company_type:
            company.company_type = company_type
            company.save()
        
        job = Job.objects.create(company=company, **validated_data)
        job.skills_required.set(skills_data)
        return job

    def update(self, instance, validated_data):
        company_name = validated_data.pop('company_name', None)
        company_type = validated_data.pop('company_type', None)
        skills_data = validated_data.pop('skills_required', None)

        if company_name is not None:
            defaults = {}
            if company_type is not None:
                defaults['company_type'] = company_type
            company, created = Company.objects.get_or_create(
                name=company_name.strip(),
                defaults=defaults
            )
            if not created and company_type is not None and company.company_type != company_type:
                company.company_type = company_type
                company.save()
            instance.company = company

        # Update remaining direct fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if skills_data is not None:
            instance.skills_required.set(skills_data)

        return instance

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    applicant_profile = ProfileSerializer(source='applicant.profile', read_only=True)
    resume_details = ResumeSerializer(source='resume', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'job', 'job_details', 'applicant', 'applicant_profile',
            'resume', 'resume_details', 'status', 'cover_letter', 'applied_at', 'updated_at'
        )
        read_only_fields = ('id', 'job_details', 'applicant_profile', 'resume_details', 'applied_at', 'updated_at')


class InterviewSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    company_name = serializers.CharField(source='application.job.company.name', read_only=True)
    seeker_name = serializers.CharField(source='application.applicant.profile.full_name', read_only=True)
    seeker_email = serializers.EmailField(source='application.applicant.email', read_only=True)
    recruiter_name = serializers.CharField(source='application.job.recruiter.profile.full_name', read_only=True)
    recruiter_email = serializers.EmailField(source='application.job.recruiter.email', read_only=True)

    class Meta:
        model = Interview
        fields = (
            'id', 'application', 'title', 'description', 'start_time', 'end_time',
            'status', 'google_calendar_event_id', 'job_title', 'company_name',
            'seeker_name', 'seeker_email', 'recruiter_name', 'recruiter_email',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'google_calendar_event_id', 'created_at', 'updated_at')

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be strictly after start time.")
        return data
