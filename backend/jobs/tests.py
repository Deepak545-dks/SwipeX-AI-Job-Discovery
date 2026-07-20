from django.urls import reverse
from unittest.mock import patch
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from jobs.models import Company, Job, Application
from profiles.models import Profile, Skill, Resume

User = get_user_model()

class JobTests(APITestCase):
    def setUp(self):
        # Create recruiter and seeker accounts
        self.recruiter = User.objects.create_user(
            email="recruiter@example.com",
            password="SecurePassword123!",
            role="recruiter"
        )
        self.seeker = User.objects.create_user(
            email="seeker@example.com",
            password="SecurePassword123!",
            role="job_seeker"
        )
        
        # Setup URLs
        self.job_create_url = reverse('job_create')
        self.recruiter_jobs_url = reverse('recruiter_jobs_list')
        self.analytics_url = reverse('recruiter_analytics')

        # Log in recruiter and set header
        response = self.client.post(reverse('auth_login'), {
            "email": "recruiter@example.com",
            "password": "SecurePassword123!"
        })
        self.recruiter_token = response.data["access"]
        
        # Log in seeker
        response_seeker = self.client.post(reverse('auth_login'), {
            "email": "seeker@example.com",
            "password": "SecurePassword123!"
        })
        self.seeker_token = response_seeker.data["access"]

        # Default header as recruiter
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.recruiter_token}')

    def test_seeker_cannot_post_job(self):
        # Authenticate as seeker
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        job_data = {
            "company_name": "Acme Corp",
            "title": "Django Developer",
            "description": "Looking for DRF expert",
            "location": "Remote",
            "salary_min": 80000,
            "salary_max": 120000,
            "skills_required": ["Python", "Django"]
        }
        response = self.client.post(self.job_create_url, job_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_recruiter_can_post_job_and_creates_company(self):
        job_data = {
            "company_name": "Google",
            "title": "Senior Staff Architect",
            "description": "Oversee system integrations",
            "location": "On-site",
            "salary_min": 150000,
            "salary_max": 220000,
            "skills_required": ["Python", "System Design", "Kubernetes"]
        }
        response = self.client.post(self.job_create_url, job_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Senior Staff Architect")
        self.assertEqual(response.data["company"]["name"], "Google")
        
        # Verify Skill created automatically in profiles app
        self.assertTrue(Skill.objects.filter(name="System Design").exists())
        self.assertTrue(Company.objects.filter(name="Google").exists())
        self.assertEqual(Job.objects.filter(recruiter=self.recruiter).count(), 1)

    def test_recruiter_can_edit_job(self):
        # Post first
        company = Company.objects.create(name="Stripe")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="Frontend Developer",
            description="Vue.js Developer",
            location="Remote"
        )
        edit_url = reverse('job_detail', kwargs={'pk': job.id})
        
        response = self.client.put(edit_url, {
            "company_name": "Stripe",
            "title": "Senior React Architect",
            "description": "Expert in React and Framer Motion",
            "location": "Hybrid",
            "salary_min": 100000
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Senior React Architect")
        self.assertEqual(response.data["location"], "Hybrid")

    def test_recruiter_can_delete_job(self):
        company = Company.objects.create(name="Netflix")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="Senior QA Engineer",
            description="Testing microservices",
            location="Los Gatos, CA"
        )
        delete_url = reverse('job_detail', kwargs={'pk': job.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Job.objects.filter(id=job.id).count(), 0)

    def test_recruiter_view_applicants_and_update_status(self):
        company = Company.objects.create(name="Meta")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="ML Engineer",
            description="PyTorch experience preferred",
            location="Menlo Park, CA"
        )
        
        # Seeker applies to job
        app = Application.objects.create(
            job=job,
            applicant=self.seeker,
            status='applied'
        )

        applicants_url = reverse('job_applicants', kwargs={'job_id': job.id})
        response = self.client.get(applicants_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["applicant_profile"]["email"], self.seeker.email)

        # Update candidate status
        status_update_url = reverse('application_status_update', kwargs={'pk': app.id})
        status_resp = self.client.patch(status_update_url, {"status": "shortlisted"}, format='json')
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(status_resp.data["status"], "shortlisted")
        
        # Verify in DB
        app.refresh_from_db()
        self.assertEqual(app.status, "shortlisted")

    def test_recruiter_analytics(self):
        company = Company.objects.create(name="OpenAI")
        job_1 = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="AI Researcher",
            description="LLM details",
            location="San Francisco, CA",
            is_active=True
        )
        job_2 = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="Developer Relations",
            description="Community support",
            location="Remote",
            is_active=False
        )

        # Create applications
        app_1 = Application.objects.create(job=job_1, applicant=self.seeker, status='accepted')
        
        response = self.client.get(self.analytics_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_jobs"], 2)
        self.assertEqual(response.data["active_jobs"], 1)
        self.assertEqual(response.data["total_applicants"], 1)
        self.assertEqual(response.data["status_breakdown"]["accepted"], 1)
        self.assertEqual(response.data["hire_rate"], 100.0)

    def test_job_deck_retrieval_and_ordering(self):
        # Setup seeker skills profile
        seeker_profile = self.seeker.profile
        skill_python = Skill.objects.create(name="Python")
        skill_django = Skill.objects.create(name="Django")
        seeker_profile.skills.add(skill_python, skill_django)

        # Create two jobs. Job A has matching skills, Job B does not.
        company = Company.objects.create(name="Acme Inc")
        job_matching = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="Django Wizard",
            description="DRF focus",
            location="Remote"
        )
        job_matching.skills_required.add(skill_python, skill_django)

        job_other = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="Sales Rep",
            description="Cold calling",
            location="On-site"
        )

        # Retrieve deck as seeker
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        deck_url = reverse('job_deck')
        response = self.client.get(deck_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify paginated response results list has 2 jobs, with matching job first
        results = response.data["results"]
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["title"], "Django Wizard")

        # Seeker swipes dislike on job_matching
        swipe_url = reverse('job_swipe')
        swipe_resp = self.client.post(swipe_url, {
            "job_id": job_matching.id,
            "action": "dislike"
        }, format='json')
        self.assertEqual(swipe_resp.status_code, status.HTTP_201_CREATED)

        # Re-fetch deck - should now only show 1 job (job_other)
        response_refetch = self.client.get(deck_url)
        self.assertEqual(len(response_refetch.data["results"]), 1)
        self.assertEqual(response_refetch.data["results"][0]["title"], "Sales Rep")

    def test_swipe_right_apply_workflow(self):
        # Create a job
        company = Company.objects.create(name="Stark Industries")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=company,
            title="Iron Man Assistant",
            description="Help Tony Stark",
            location="Malibu, CA"
        )

        swipe_url = reverse('job_swipe')
        
        # Try to swipe right (like) as seeker BEFORE uploading resume - should fail
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        response_fail = self.client.post(swipe_url, {
            "job_id": job.id,
            "action": "like"
        }, format='json')
        self.assertEqual(response_fail.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response_fail.data)

        # Upload a resume
        seeker_profile = self.seeker.profile
        resume = Resume.objects.create(
            profile=seeker_profile,
            file="resumes/user_seeker/resume_v1.pdf",
            version=1
        )

        # Try again - should succeed and create application
        response_success = self.client.post(swipe_url, {
            "job_id": job.id,
            "action": "like"
        }, format='json')
        self.assertEqual(response_success.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response_success.data["applied"])
        
        # Verify in DB
        self.assertTrue(Application.objects.filter(job=job, applicant=self.seeker).exists())

    def test_job_search_and_filters(self):
        # Create Startup and MNC companies
        co_startup = Company.objects.create(name="Pixel Startup", company_type="startup")
        co_mnc = Company.objects.create(name="Mega MNC", company_type="mnc")

        # Job A: Startup, high salary, remote, Python
        job_a = Job.objects.create(
            recruiter=self.recruiter,
            company=co_startup,
            title="Python Developer",
            description="Django backend",
            location="Remote",
            salary_min=100000,
            salary_max=150000,
            job_type="remote"
        )
        
        # Job B: MNC, low salary, onsite
        job_b = Job.objects.create(
            recruiter=self.recruiter,
            company=co_mnc,
            title="System Operator",
            description="Mainframe helper",
            location="Chicago",
            salary_min=40000,
            salary_max=60000,
            job_type="onsite"
        )

        search_url = reverse('job_search')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')

        # 1. Search by text "Python"
        resp = self.client.get(search_url, {"q": "Python"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(resp.data["results"][0]["title"], "Python Developer")

        # 2. Filter by salary_min = 90000
        resp = self.client.get(search_url, {"salary_min": "90000"})
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(resp.data["results"][0]["title"], "Python Developer")

        # 3. Filter by company_type = "startup"
        resp = self.client.get(search_url, {"company_type": "startup"})
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(resp.data["results"][0]["company"]["name"], "Pixel Startup")

        # 4. Filter by job_type = "onsite"
        resp = self.client.get(search_url, {"job_type": "onsite"})
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(resp.data["results"][0]["title"], "System Operator")

        # 5. Low Competition check
        # Create applications for Job B (System Operator) to make it competitive (>= 5 applicants)
        other_users = [User.objects.create_user(email=f"user_search_{i}@example.com", password="Password123!", role="job_seeker") for i in range(5)]
        for u in other_users:
            Application.objects.create(job=job_b, applicant=u, status='applied')

        # Filter by low competition
        resp = self.client.get(search_url, {"low_competition": "true"})
        # Should now only return Job A (Python Developer), since Job B has 5 applications
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(resp.data["results"][0]["title"], "Python Developer")

    def test_application_tracking_and_cover_letter(self):
        # Create a job
        co = Company.objects.create(name="Wayne Enterprises")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Defense Analyst",
            description="Batcave tech",
            location="Gotham"
        )

        # Upload a resume
        seeker_profile = self.seeker.profile
        resume = Resume.objects.create(
            profile=seeker_profile,
            file="resumes/user_seeker/resume_wayne.pdf",
            version=2
        )

        # Swipe right with cover letter
        swipe_url = reverse('job_swipe')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        response_swipe = self.client.post(swipe_url, {
            "job_id": job.id,
            "action": "like",
            "cover_letter": "I want to help Batman."
        }, format='json')
        self.assertEqual(response_swipe.status_code, status.HTTP_201_CREATED)

        # Check applications endpoint
        tracking_url = reverse('my_applications')
        response_track = self.client.get(tracking_url)
        self.assertEqual(response_track.status_code, status.HTTP_200_OK)
        results = response_track.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["cover_letter"], "I want to help Batman.")
        self.assertEqual(results[0]["resume_details"]["version"], 2)

        # Update status as recruiter to interviewing
        app = Application.objects.get(id=results[0]["id"])
        status_update_url = reverse('application_status_update', kwargs={'pk': app.id})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.recruiter_token}')
        status_resp = self.client.patch(status_update_url, {"status": "interviewing"}, format='json')
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)

        # Verify filter by status on seeker side
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        resp_filtered = self.client.get(tracking_url, {"status": "interviewing"})
        self.assertEqual(len(resp_filtered.data["results"]), 1)
        self.assertEqual(resp_filtered.data["results"][0]["status"], "interviewing")

        resp_filtered_empty = self.client.get(tracking_url, {"status": "rejected"})
        self.assertEqual(len(resp_filtered_empty.data["results"]), 0)

    def test_ai_recommendation_utilities_and_fallback(self):
        from unittest.mock import patch
        from profiles.utils import compile_candidate_profile_text, get_recommendation_text_for_candidate
        
        # 1. Test profile text compiler
        seeker_profile = self.seeker.profile
        seeker_profile.bio = "Expert Django Backend Engineer"
        seeker_profile.save()
        
        compiled_text = compile_candidate_profile_text(seeker_profile)
        self.assertIn("Expert Django Backend Engineer", compiled_text)
        
        # 2. Test get recommendation text helper
        rec_text = get_recommendation_text_for_candidate(self.seeker)
        self.assertIn("Expert Django Backend Engineer", rec_text)

        # 3. Test fallback behavior in JobDeckView when recommendation service fails
        # Create a job
        co = Company.objects.create(name="Daily Planet")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Reporter",
            description="Write news",
            location="Metropolis"
        )
        
        # Mock requests.post to throw connection error, ensuring fallback triggers
        with patch('requests.post', side_effect=Exception("FastAPI Offline")):
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
            deck_url = reverse('job_deck')
            response = self.client.get(deck_url)
            # The API should complete successfully with HTTP 200, resolving the fallback skills deck instead of crashing!
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(len(response.data["results"]) >= 1)

    def test_calendar_scheduling_workflow(self):
        from django.utils import timezone
        from datetime import timedelta
        from jobs.models import Interview, Application
        
        # 1. Create a dummy application first so we can schedule an interview for it
        co = Company.objects.create(name="Wayne Corp")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Defense Specialist",
            description="Protect Gotham"
        )
        app = Application.objects.create(
            job=job,
            applicant=self.seeker,
            status='applied'
        )

        # 2. Recruiter schedules an interview
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.recruiter_token}')
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(hours=1)
        
        schedule_url = reverse('interview_list_create')
        response = self.client.post(schedule_url, {
            "application": app.id,
            "title": "Initial Tech Screening",
            "description": "Assess basic fighting skills",
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
            "sync_calendar": True
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data["google_calendar_event_id"])
        self.assertTrue(response.data["google_calendar_event_id"].startswith("mock_gcal_"))
        
        interview_id = response.data["id"]

        # 3. Seeker accepts the interview slot
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        respond_url = reverse('interview_respond', kwargs={'pk': interview_id})
        
        response_accept = self.client.post(respond_url, {"status": "accepted"}, format='json')
        self.assertEqual(response_accept.status_code, status.HTTP_200_OK)
        self.assertEqual(response_accept.data["status"], "accepted")
        
        # Verify that application status has automatically progressed to 'interviewing'!
        app.refresh_from_db()
        self.assertEqual(app.status, "interviewing")

        # 4. Fetch personal scheduled interviews
        my_interviews_url = reverse('my_interviews')
        response_my = self.client.get(my_interviews_url)
        self.assertEqual(response_my.status_code, status.HTTP_200_OK)
        # DRF generic ListAPIView wraps results in pagination envelope!
        self.assertEqual(len(response_my.data["results"]), 1)

    def test_job_status_and_company_profile(self):
        # 1. Recruiter creates a Draft job posting
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.recruiter_token}')
        create_url = reverse('job_create')
        
        response = self.client.post(create_url, {
            "title": "Quantum Physicist Draft",
            "description": "Research dark matter",
            "location": "Geneva",
            "company_name": "CERN Laboratory",
            "status": "draft"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        job_id = response.data["id"]
        company_id = response.data["company"]["id"]

        # 2. Verify seeker deck and search does NOT return draft job
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        deck_url = reverse('job_deck')
        
        # Mock requests.post just in case AI recommendations triggers
        with patch('requests.post', side_effect=Exception("FastAPI Offline")):
            deck_resp = self.client.get(deck_url)
            self.assertEqual(deck_resp.status_code, status.HTTP_200_OK)
            # Make sure draft job is excluded
            self.assertFalse(any(j["id"] == job_id for j in deck_resp.data["results"]))

            search_url = reverse('job_search') + "?q=Quantum"
            search_resp = self.client.get(search_url)
            self.assertEqual(search_resp.status_code, status.HTTP_200_OK)
            self.assertEqual(len(search_resp.data["results"]), 0)

        # 3. Recruiter updates status to Published
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.recruiter_token}')
        detail_url = reverse('job_detail', kwargs={'pk': job_id})
        update_resp = self.client.put(detail_url, {
            "title": "Quantum Physicist Published",
            "description": "Research dark matter",
            "location": "Geneva",
            "company_name": "CERN Laboratory",
            "status": "published"
        }, format='json')
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data["status"], "published")

        # 4. Verify seeker search returns the published job now
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        search_url = reverse('job_search') + "?q=Quantum"
        search_resp = self.client.get(search_url)
        self.assertEqual(search_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(search_resp.data["results"]), 1)
        self.assertEqual(search_resp.data["results"][0]["id"], job_id)

        # 5. Recruiter updates Company profile details
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.recruiter_token}')
        company_detail_url = reverse('company_detail', kwargs={'pk': company_id})
        
        comp_update_resp = self.client.put(company_detail_url, {
            "name": "CERN Laboratory",
            "website": "https://home.cern",
            "description": "European Organization for Nuclear Research",
            "company_type": "mnc",
            "industry": "Scientific Research",
            "employee_count": 2500,
            "headquarters": "Geneva, Switzerland",
            "founded_year": 1954
        }, format='json')
        
        self.assertEqual(comp_update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(comp_update_resp.data["industry"], "Scientific Research")
        self.assertEqual(comp_update_resp.data["employee_count"], 2500)
        self.assertEqual(comp_update_resp.data["founded_year"], 1954)

    def test_swipe_undo_workflow(self):
        from jobs.models import SwipeHistory, Application
        
        # 1. Setup seeker profile and resume for application swipe
        seeker_profile = self.seeker.profile
        latest_resume = Resume.objects.create(profile=seeker_profile, file="resumes/resume_v1.pdf", version=1)
        
        # Create a job
        co = Company.objects.create(name="Stark Industries")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Iron Man Assistant",
            description="Fix suit weapons",
            location="Malibu"
        )
        
        # 2. Swipe right (like)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        swipe_url = reverse('job_swipe')
        
        # Mock recommendation notifications
        with patch('requests.post', side_effect=Exception("FastAPI Offline")):
            swipe_resp = self.client.post(swipe_url, {
                "job_id": job.id,
                "action": "like"
            }, format='json')
            self.assertEqual(swipe_resp.status_code, status.HTTP_201_CREATED)
            self.assertTrue(swipe_resp.data["applied"])

        # Confirm history and application exist
        self.assertTrue(SwipeHistory.objects.filter(user=self.seeker, job=job, action='like').exists())
        self.assertTrue(Application.objects.filter(applicant=self.seeker, job=job).exists())

        # 3. Call undo
        undo_url = reverse('job_swipe_undo')
        undo_resp = self.client.post(undo_url, {}, format='json')
        self.assertEqual(undo_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(undo_resp.data["job"]["id"], str(job.id))

        # Confirm history and application are deleted!
        self.assertFalse(SwipeHistory.objects.filter(user=self.seeker, job=job).exists())
        self.assertFalse(Application.objects.filter(applicant=self.seeker, job=job).exists())

        # 4. Call undo again and verify error
        undo_resp_retry = self.client.post(undo_url, {}, format='json')
        self.assertEqual(undo_resp_retry.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(undo_resp_retry.data["error"], "No recent swipes found to undo.")

    def test_ai_cover_letter_generator(self):
        co = Company.objects.create(name="Cyberdyne Systems")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Terminator Engineer",
            description="Build autonomous robotics",
            location="Los Angeles"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        url = reverse('ai_cover_letter')
        resp = self.client.post(url, {"job_id": job.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("cover_letter", resp.data)
        self.assertIn("Terminator Engineer", resp.data["cover_letter"])

    def test_ai_interview_questions(self):
        co = Company.objects.create(name="Cyberdyne Systems")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Terminator Engineer",
            description="Build autonomous robotics",
            location="Los Angeles"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        url = reverse('ai_interview_questions')
        resp = self.client.post(url, {"job_id": job.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("questions", resp.data)
        self.assertTrue(len(resp.data["questions"]) > 0)

    def test_ai_skill_gap_analysis(self):
        co = Company.objects.create(name="Cyberdyne Systems")
        job = Job.objects.create(
            recruiter=self.recruiter,
            company=co,
            title="Terminator Engineer",
            description="Build autonomous robotics",
            location="Los Angeles"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seeker_token}')
        url = reverse('ai_skill_gap')
        resp = self.client.post(url, {"job_id": job.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("match_percentage", resp.data)
        self.assertIn("matching_skills", resp.data)
        self.assertIn("missing_skills", resp.data)
        self.assertIn("suggestions", resp.data)






