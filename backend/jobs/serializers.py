from rest_framework import serializers
from .models import Company, Job, Application, Interview
from profiles.models import Skill, Resume
from profiles.serializers import SkillSlugRelatedField, ResumeSerializer, ProfileSerializer

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'website', 'logo_url', 'description', 'company_type', 'industry', 'employee_count', 'headquarters', 'founded_year')

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

    class Meta:
        model = Job
        fields = (
            'id', 'company', 'company_name', 'company_type', 'title', 'description',
            'requirements', 'salary_min', 'salary_max', 'location',
            'job_type', 'employment_type', 'experience_level',
            'skills_required', 'is_active', 'status', 'recruiter_email',
            'provider', 'original_url', 'expires_at',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'company', 'recruiter_email', 'provider', 'original_url', 'expires_at', 'created_at', 'updated_at')

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
