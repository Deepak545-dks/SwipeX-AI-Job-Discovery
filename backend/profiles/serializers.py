import os
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Skill, Education, Experience, Resume, Project

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ('id', 'institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'is_current', 'description')

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ('id', 'company', 'title', 'location', 'start_date', 'end_date', 'is_current', 'description')

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'start_date', 'end_date', 'is_current', 'project_url')

class ResumeSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ('id', 'file', 'version', 'uploaded_at', 'filename')

    def get_filename(self, obj):
        if obj.file:
            return os.path.basename(obj.file.name)
        return ""

class SkillSlugRelatedField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        try:
            name = str(data).strip()
            if not name:
                self.fail('invalid')
            # Dynamically get or create skills
            obj, _ = Skill.objects.get_or_create(name=name)
            return obj
        except Exception:
            self.fail('invalid')

class ProfileSerializer(serializers.ModelSerializer):
    skills = SkillSlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Skill.objects.all(),
        required=False
    )
    education = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = Profile
        fields = (
            'id', 'email', 'role', 'full_name', 'phone', 'bio',
            'portfolio_url', 'github_url', 'linkedin_url', 'profile_picture',
            'skills', 'education', 'experiences', 'projects', 'resumes',
            'created_at', 'updated_at'
        )

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        
        # Update direct profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update skills association
        if skills_data is not None:
            instance.skills.set(skills_data)

        return instance
