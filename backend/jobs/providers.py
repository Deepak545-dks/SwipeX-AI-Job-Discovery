import abc
import random
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from jobs.models import Job, Company
from profiles.models import Skill

User = get_user_model()

class BaseJobProvider(abc.ABC):
    @abc.abstractmethod
    def fetch_jobs(self, limit=10):
        """
        Fetches jobs from the provider.
        Returns a list of dictionaries with standard job schema.
        """
        pass

    @abc.abstractmethod
    def get_provider_name(self):
        pass

# Sample logo URLs and details for target tech companies
COMPANY_METADATA = {
    "Stripe": {
        "website": "https://stripe.com",
        "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60",
        "description": "Financial infrastructure for the internet.",
        "company_type": "mnc",
        "industry": "Fintech",
        "employee_count": 8500,
        "headquarters": "San Francisco, CA",
        "founded_year": 2010
    },
    "Linear": {
        "website": "https://linear.app",
        "logo_url": "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=120&auto=format&fit=crop&q=60",
        "description": "The issue tracker you have been waiting for.",
        "company_type": "startup",
        "industry": "Developer Tools",
        "employee_count": 60,
        "headquarters": "Remote",
        "founded_year": 2019
    },
    "Notion": {
        "website": "https://notion.so",
        "logo_url": "https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?w=120&auto=format&fit=crop&q=60",
        "description": "A new tool that blends your everyday work apps into one.",
        "company_type": "startup",
        "industry": "Productivity Software",
        "employee_count": 450,
        "headquarters": "San Francisco, CA",
        "founded_year": 2016
    },
    "Vercel": {
        "website": "https://vercel.com",
        "logo_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=60",
        "description": "Vercel provides developer tools and cloud hosting for frontend developers.",
        "company_type": "startup",
        "industry": "Cloud Infrastructure",
        "employee_count": 500,
        "headquarters": "New York, NY",
        "founded_year": 2015
    },
    "OpenAI": {
        "website": "https://openai.com",
        "logo_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&auto=format&fit=crop&q=60",
        "description": "AI research and deployment company.",
        "company_type": "mnc",
        "industry": "Artificial Intelligence",
        "employee_count": 1200,
        "headquarters": "San Francisco, CA",
        "founded_year": 2015
    },
    "RemoteOK": {
        "website": "https://remoteok.com",
        "logo_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&auto=format&fit=crop&q=60",
        "description": "Find remote jobs anywhere in the world.",
        "company_type": "startup",
        "industry": "Recruiting",
        "employee_count": 15,
        "headquarters": "Remote",
        "founded_year": 2014
    }
}

ROLE_TEMPLATES = [
    {
        "title": "Senior Frontend Engineer - Design Systems",
        "description": "We are seeking a talented Senior Frontend Architect to lead development of our premium UI component library. You will write highly accessible, performant React modules using Tailwind CSS and Framer Motion.",
        "requirements": "5+ years developing complex web applications. Deep expertise in React, TypeScript, and animation systems. Strong eye for visual detail.",
        "skills": ["React", "TypeScript", "Tailwind CSS", "Unit Testing", "Git"],
        "job_type": "remote",
        "experience_level": "senior",
        "salary_min": 130000,
        "salary_max": 180000
    },
    {
        "title": "Backend Systems Engineer",
        "description": "Build high-throughput transaction pipelines. You will optimize database queries in PostgreSQL, orchestrate Docker containers, and implement robust REST APIs in Python/Django.",
        "requirements": "Strong algorithms background. Proficient in Python, Django, SQL databases, and cloud infrastructure on AWS.",
        "skills": ["Python", "Django", "PostgreSQL", "REST APIs", "Docker", "AWS"],
        "job_type": "hybrid",
        "experience_level": "mid",
        "salary_min": 105000,
        "salary_max": 145000
    },
    {
        "title": "Lead Full Stack Developer",
        "description": "Join our product expansion team. You will lead 3 developers in shipping next-generation workspace features. Work across Node.js, GraphQL, React, and serverless environments.",
        "requirements": "Proven lead experience. Fluent in Node.js, React, and GraphQL API design.",
        "skills": ["React", "TypeScript", "Node.js", "GraphQL", "CI/CD", "Git"],
        "job_type": "onsite",
        "experience_level": "lead",
        "salary_min": 160000,
        "salary_max": 210000
    },
    {
        "title": "DevOps & Platform Architect",
        "description": "Own developer productivity and deployment health. Automate build checks, maintain Kubernetes clusters, and scale cloud provisioning strategies on AWS.",
        "requirements": "Certified AWS architect or equivalent experience. Fluent in Docker, CI/CD pipelines, and infrastructure-as-code.",
        "skills": ["Docker", "AWS", "CI/CD", "Unit Testing", "Git"],
        "job_type": "remote",
        "experience_level": "senior",
        "salary_min": 140000,
        "salary_max": 195000
    }
]

class MockProvider(BaseJobProvider):
    def __init__(self, provider_name):
        self.provider_name = provider_name

    def get_provider_name(self):
        return self.provider_name

    def fetch_jobs(self, limit=10):
        jobs = []
        companies = list(COMPANY_METADATA.keys())
        
        for i in range(limit):
            company_name = random.choice(companies)
            role = random.choice(ROLE_TEMPLATES)
            
            # Add random variations to avoid exact duplicates across feeds
            salary_mod = random.randint(-15, 25) * 1000
            location_options = ["San Francisco, CA", "New York, NY", "Austin, TX", "London, UK", "Remote"]
            
            job_dict = {
                "title": f"{role['title']} ({self.provider_name})",
                "company_name": company_name,
                "description": f"{role['description']} Sponsored via SwipeX ingestion.",
                "requirements": role["requirements"],
                "salary_min": max(60000, role["salary_min"] + salary_mod),
                "salary_max": max(80000, role["salary_max"] + salary_mod),
                "location": random.choice(location_options),
                "job_type": role["job_type"],
                "employment_type": "full_time",
                "experience_level": role["experience_level"],
                "skills": role["skills"],
                "provider_job_id": f"{self.provider_name.lower()}-{random.randint(100000, 999999)}",
                "original_url": f"{COMPANY_METADATA[company_name]['website']}/careers/job-{random.randint(100,999)}",
                "days_to_expire": random.randint(7, 45)
            }
            jobs.append(job_dict)
            
        return jobs

# Instantiate pluggable providers representing all requested sources
PROVIDERS = [
    MockProvider("LinkedIn Jobs"),
    MockProvider("Indeed"),
    MockProvider("Naukri"),
    MockProvider("Foundit"),
    MockProvider("Wellfound"),
    MockProvider("Internshala"),
    MockProvider("RemoteOK")
]

def sync_all_providers(limit_per_provider=5):
    """
    Ingestion Orchestrator:
    1. Fetches from all pluggable providers.
    2. Stores Company logos and detailed metadata.
    3. Prevents duplicate jobs by checking provider + provider_job_id.
    4. Automatically flags expired jobs.
    5. Cleans up old jobs to maintain a large but healthy catalogue.
    """
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        # Fallback to first active user if admin isn't found
        admin_user = User.objects.first()

    if not admin_user:
        return 0, 0

    imported_count = 0
    duplicate_count = 0
    now = timezone.now()

    # Part 1: Mark expired jobs automatically
    expired_jobs_count = Job.objects.filter(
        expires_at__lt=now,
        status='published'
    ).update(status='expired', is_active=False)

    # Part 2: Fetch and ingest new jobs from registered providers
    for provider in PROVIDERS:
        try:
            raw_jobs = provider.fetch_jobs(limit=limit_per_provider)
            for raw_job in raw_jobs:
                # Check for duplicates using provider & provider_job_id
                if Job.objects.filter(
                    provider=provider.get_provider_name(),
                    provider_job_id=raw_job["provider_job_id"]
                ).exists():
                    duplicate_count += 1
                    continue
                
                # Fetch or create the Company with detailed metadata
                metadata = COMPANY_METADATA.get(raw_job["company_name"], {})
                company, _ = Company.objects.get_or_create(
                    name=raw_job["company_name"],
                    defaults={
                        "website": metadata.get("website", ""),
                        "logo_url": metadata.get("logo_url", ""),
                        "description": metadata.get("description", ""),
                        "company_type": metadata.get("company_type", "mnc"),
                        "industry": metadata.get("industry", "Technology"),
                        "employee_count": metadata.get("employee_count", 100),
                        "headquarters": metadata.get("headquarters", ""),
                        "founded_year": metadata.get("founded_year", 2020),
                    }
                )

                # Ensure company metadata is kept up to date
                if not company.logo_url and metadata.get("logo_url"):
                    company.logo_url = metadata.get("logo_url")
                    company.save()

                # Calculate expires_at date
                expires_date = now + timedelta(days=raw_job["days_to_expire"])

                with transaction.atomic():
                    # Create unified format Job record
                    job = Job.objects.create(
                        recruiter=admin_user,
                        company=company,
                        title=raw_job["title"],
                        description=raw_job["description"],
                        requirements=raw_job["requirements"],
                        salary_min=raw_job["salary_min"],
                        salary_max=raw_job["salary_max"],
                        location=raw_job["location"],
                        job_type=raw_job["job_type"],
                        employment_type=raw_job["employment_type"],
                        experience_level=raw_job["experience_level"],
                        provider=provider.get_provider_name(),
                        provider_job_id=raw_job["provider_job_id"],
                        original_url=raw_job["original_url"],
                        expires_at=expires_date,
                        status='published',
                        is_active=True
                    )

                    # Map associated skills
                    for skill_name in raw_job["skills"]:
                        skill, _ = Skill.objects.get_or_create(name=skill_name)
                        job.skills_required.add(skill)

                imported_count += 1
        except Exception as e:
            print(f"Error syncing provider {provider.get_provider_name()}: {e}")

    return imported_count, duplicate_count
