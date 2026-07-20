import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'swipex.settings')
django.setup()

from django.contrib.auth import get_user_model
from jobs.models import Company, Job
from profiles.models import Profile, Skill, Experience, Education, Resume

User = get_user_model()

def seed_database():
    print("Seeding SwipeX Database...")

    # 1. Create Recruiter User
    recruiter_email = "recruiter@example.com"
    recruiter, created = User.objects.get_or_create(
        email=recruiter_email,
        defaults={
            "role": "recruiter",
            "is_verified": True,
            "is_active": True
        }
    )
    if created:
        recruiter.set_password("Password123!")
        recruiter.save()
        print(f"Created recruiter user: {recruiter_email}")
    else:
        print(f"Recruiter user already exists: {recruiter_email}")

    # 2. Create Company
    company, company_created = Company.objects.get_or_create(
        name="Stark Industries",
        defaults={
            "website": "https://stark.industries",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Stark_Industries_logo.svg",
            "description": "Advanced tech development, arc reactors, and defense logistics.",
            "company_type": "mnc",
            "industry": "Defense & Technology Aerospace",
            "employee_count": 5000,
            "headquarters": "Los Angeles, CA",
            "founded_year": 1940
        }
    )
    if company_created:
        print("Created Stark Industries company profile.")

    # 3. Create Sample Job Listings
    job1, job1_created = Job.objects.get_or_create(
        title="Senior React Developer",
        recruiter=recruiter,
        company=company,
        defaults={
            "description": "Develop premium glassmorphic UI interfaces for suit controls and internal portals. Must have expertise in Framer Motion, Redux, and Tailwind.",
            "requirements": "3+ years of React development experience.\nProficient with state management.\nEye for micro-animations and CSS polish.",
            "salary_min": 110000,
            "salary_max": 140000,
            "location": "Remote, CA",
            "job_type": "remote",
            "employment_type": "full_time",
            "experience_level": "senior",
            "status": "published"
        }
    )
    if job1_created:
        # Add required skills
        react_skill, _ = Skill.objects.get_or_create(name="React")
        framer_skill, _ = Skill.objects.get_or_create(name="Framer Motion")
        tailwind_skill, _ = Skill.objects.get_or_create(name="Tailwind")
        job1.skills_required.add(react_skill, framer_skill, tailwind_skill)
        print("Posted Job: Senior React Developer")

    job2, job2_created = Job.objects.get_or_create(
        title="Django Backend Engineer",
        recruiter=recruiter,
        company=company,
        defaults={
            "description": "Scale core database APIs and real-time WebSocket messaging layer pipelines using Django REST framework and Channels.",
            "requirements": "Strong Python foundational skills.\nExperience with SQLite/Postgres and Django Channels.\nFamiliarity with FastAPI microservices.",
            "salary_min": 105000,
            "salary_max": 135000,
            "location": "Malibu, CA",
            "job_type": "hybrid",
            "employment_type": "full_time",
            "experience_level": "mid",
            "status": "published"
        }
    )
    if job2_created:
        django_skill, _ = Skill.objects.get_or_create(name="Django")
        python_skill, _ = Skill.objects.get_or_create(name="Python")
        websockets_skill, _ = Skill.objects.get_or_create(name="WebSockets")
        job2.skills_required.add(django_skill, python_skill, websockets_skill)
        print("Posted Job: Django Backend Engineer")

    # 4. Create Job Seeker User
    seeker_email = "seeker@example.com"
    seeker, seeker_created = User.objects.get_or_create(
        email=seeker_email,
        defaults={
            "role": "job_seeker",
            "is_verified": True,
            "is_active": True
        }
    )
    if seeker_created:
        seeker.set_password("Password123!")
        seeker.save()
        print(f"Created seeker user: {seeker_email}")
    else:
        print(f"Seeker user already exists: {seeker_email}")

    # 5. Populate Seeker Profile Details
    profile = seeker.profile
    profile.full_name = "Peter Parker"
    profile.phone = "+1-555-0199"
    profile.bio = "Energetic web developer with strong frontend skills and experience styling reactive interfaces. Passionate about spider-themed applications."
    profile.linkedin = "https://linkedin.com/in/peterparker"
    profile.github = "https://github.com/peterparker"
    profile.save()

    # Add seeker skills
    react_skill, _ = Skill.objects.get_or_create(name="React")
    python_skill, _ = Skill.objects.get_or_create(name="Python")
    django_skill, _ = Skill.objects.get_or_create(name="Django")
    profile.skills.add(react_skill, python_skill, django_skill)

    # Add experience
    Experience.objects.get_or_create(
        profile=profile,
        company="Daily Planet Newspaper",
        title="Frontend Web Intern",
        defaults={
            "description": "Styled web articles, optimized news loaders, and maintained layout responsiveness.",
            "start_date": "2024-06-01",
            "end_date": "2025-01-01",
            "is_current": False
        }
    )

    # Add education
    Education.objects.get_or_create(
        profile=profile,
        institution="Midtown High School",
        degree="High School Diploma",
        defaults={
            "field_of_study": "Science & Tech",
            "start_date": "2020-09-01",
            "end_date": "2024-06-01",
            "is_current": False
        }
    )

    # Create dummy Resume file
    resume, resume_created = Resume.objects.get_or_create(
        profile=profile,
        version=1,
        defaults={
            "file": "resumes/peter_parker_cv.pdf"
        }
    )
    if resume_created:
        print("Uploaded Peter Parker default resume profile.")

    print("\nDatabase Seeding Completed Successfully!")
    print("Demo Recruiter User: recruiter@example.com / Password123!")
    print("Demo Seeker User: seeker@example.com / Password123!")

if __name__ == "__main__":
    seed_database()
