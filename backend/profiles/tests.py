from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from profiles.models import Profile, Skill, Education, Experience, Resume
import datetime

User = get_user_model()

class ProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="seeker@example.com",
            password="SecurePassword123!",
            role="job_seeker"
        )
        # Profile is created automatically by post_save signal
        self.profile = self.user.profile
        
        self.profile_me_url = reverse('profile_me')
        self.exp_create_url = reverse('profile_experience_create')
        self.edu_create_url = reverse('profile_education_create')
        self.resume_upload_url = reverse('profile_resume_upload')
        
        # Login
        response = self.client.post(reverse('auth_login'), {
            "email": "seeker@example.com",
            "password": "SecurePassword123!"
        })
        self.access_token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_profile_auto_created(self):
        self.assertIsNotNone(self.profile)
        self.assertEqual(self.profile.user, self.user)

    def test_get_profile(self):
        response = self.client.get(self.profile_me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_update_profile_and_skills(self):
        update_data = {
            "full_name": "John Doe",
            "phone": "+1234567890",
            "bio": "Experienced Django Developer",
            "skills": ["Python", "Django", "React", "Docker"]
        }
        response = self.client.put(self.profile_me_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["full_name"], "John Doe")
        self.assertEqual(len(response.data["skills"]), 4)
        self.assertIn("Django", response.data["skills"])

        # Check DB changes
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.full_name, "John Doe")
        self.assertEqual(self.profile.skills.count(), 4)

    def test_add_experience(self):
        exp_data = {
            "company": "Google",
            "title": "Software Engineer",
            "location": "Mountain View, CA",
            "start_date": "2024-01-01",
            "is_current": True,
            "description": "Working on AI features"
        }
        response = self.client.post(self.exp_create_url, exp_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["company"], "Google")
        
        # Check DB
        self.assertEqual(Experience.objects.filter(profile=self.profile).count(), 1)

    def test_delete_experience(self):
        # Create experience
        exp = Experience.objects.create(
            profile=self.profile,
            company="Apple",
            title="iOS Engineer",
            start_date="2023-01-01",
            is_current=False
        )
        delete_url = reverse('profile_experience_detail', kwargs={'pk': exp.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Experience.objects.filter(profile=self.profile).count(), 0)

    def test_add_education(self):
        edu_data = {
            "institution": "Stanford University",
            "degree": "Master of Science",
            "field_of_study": "Computer Science",
            "start_date": "2022-09-01",
            "end_date": "2024-06-15",
            "is_current": False,
            "description": "Graduated with honors"
        }
        response = self.client.post(self.edu_create_url, edu_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["institution"], "Stanford University")
        
        # Check DB
        self.assertEqual(Education.objects.filter(profile=self.profile).count(), 1)

    def test_delete_education(self):
        edu = Education.objects.create(
            profile=self.profile,
            institution="MIT",
            degree="Bachelor of Science",
            field_of_study="Physics",
            start_date="2018-09-01",
            is_current=False
        )
        delete_url = reverse('profile_education_detail', kwargs={'pk': edu.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Education.objects.filter(profile=self.profile).count(), 0)

    def test_resume_upload_success(self):
        # Create a mock PDF file
        file_content = b"%PDF-1.4 mock pdf content"
        uploaded_file = SimpleUploadedFile("my_resume.pdf", file_content, content_type="application/pdf")

        response = self.client.post(self.resume_upload_url, {"file": uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["version"], 1)

        # Upload a second version
        uploaded_file_2 = SimpleUploadedFile("my_resume_updated.pdf", file_content, content_type="application/pdf")
        response_2 = self.client.post(self.resume_upload_url, {"file": uploaded_file_2}, format='multipart')
        self.assertEqual(response_2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_2.data["version"], 2)

        # Verify in DB
        resumes = Resume.objects.filter(profile=self.profile)
        self.assertEqual(resumes.count(), 2)

    def test_resume_upload_invalid_type_fails(self):
        file_content = b"fake text content"
        uploaded_file = SimpleUploadedFile("resume.txt", file_content, content_type="text/plain")
        
        response = self.client.post(self.resume_upload_url, {"file": uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_resume_upload_large_file_fails(self):
        # Create a mock file larger than 5MB
        file_content = b"0" * (5 * 1024 * 1024 + 100)
        uploaded_file = SimpleUploadedFile("huge_resume.pdf", file_content, content_type="application/pdf")
        
        response = self.client.post(self.resume_upload_url, {"file": uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_project_crud_lifecycle(self):
        # 1. Create Project
        proj_url = reverse('profile_project_create')
        proj_data = {
            "name": "SwipeX Job Board",
            "description": "Tinder-style recruitment SPA",
            "start_date": "2024-01-01",
            "is_current": True,
            "project_url": "https://github.com/seeker/swipex"
        }
        response = self.client.post(proj_url, proj_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "SwipeX Job Board")
        proj_id = response.data["id"]

        # 2. Get & Update Project
        detail_url = reverse('profile_project_detail', kwargs={'pk': proj_id})
        get_resp = self.client.get(detail_url)
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)

        update_data = {
            "name": "SwipeX Career App",
            "description": "Upgraded Tinder-style recruitment SPA",
            "start_date": "2024-01-01",
            "is_current": False,
            "end_date": "2024-06-01",
            "project_url": "https://github.com/seeker/swipex-upgraded"
        }
        put_resp = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(put_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(put_resp.data["name"], "SwipeX Career App")

        # 3. Delete Project
        del_resp = self.client.delete(detail_url)
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_edit_experience(self):
        exp = Experience.objects.create(
            profile=self.profile,
            company="Tesla",
            title="Firmware Specialist",
            start_date="2023-01-01",
            is_current=True
        )
        detail_url = reverse('profile_experience_detail', kwargs={'pk': exp.id})
        update_data = {
            "company": "Tesla Motors",
            "title": "Senior Firmware Specialist",
            "start_date": "2023-01-01",
            "is_current": False,
            "end_date": "2024-02-01",
            "description": "Improved autopilot pipelines"
        }
        response = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["company"], "Tesla Motors")
        self.assertEqual(response.data["title"], "Senior Firmware Specialist")

    def test_edit_education(self):
        edu = Education.objects.create(
            profile=self.profile,
            institution="UC Berkeley",
            degree="BS",
            field_of_study="EECS",
            start_date="2018-09-01",
            is_current=True
        )
        detail_url = reverse('profile_education_detail', kwargs={'pk': edu.id})
        update_data = {
            "institution": "UC Berkeley",
            "degree": "Bachelors of Science",
            "field_of_study": "EECS",
            "start_date": "2018-09-01",
            "is_current": False,
            "end_date": "2022-05-15",
            "description": "Dean's list honors"
        }
        response = self.client.put(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["degree"], "Bachelors of Science")

    def test_avatar_upload_lifecycle(self):
        avatar_upload_url = reverse('profile_avatar_upload')
        
        # Test image file upload
        img_content = b"fake JPEG image stream data"
        uploaded_file = SimpleUploadedFile("avatar.jpg", img_content, content_type="image/jpeg")
        
        response = self.client.post(avatar_upload_url, {"file": uploaded_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["profile_picture"])
        
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.profile_picture.name.startswith("profile_pictures/avatar"))

    def test_ai_resume_analyzer(self):
        ai_url = reverse('ai_analyze_resume')
        response = self.client.post(ai_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("overall_score", response.data)
        self.assertIn("strengths", response.data)
        self.assertIn("weaknesses", response.data)
        self.assertIn("missing_skills", response.data)
        self.assertIn("improvements", response.data)

