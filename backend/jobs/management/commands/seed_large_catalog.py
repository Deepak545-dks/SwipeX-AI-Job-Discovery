import random
import uuid
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from jobs.models import Job, Company
from profiles.models import Skill

User = get_user_model()

# Lists of mock metadata to construct realistic records
TECH_COMPANIES = [
    "Stripe", "Linear", "Notion", "Vercel", "OpenAI", "Airbnb", "Netflix", "Uber", "Spotify", 
    "Shopify", "Figma", "Retool", "Slack", "Zoom", "Pinterest", "Roblox", "Canva", "Atlassian", 
    "GitLab", "GitHub", "Datadog", "HashiCorp", "Auth0", "Sentry", "Postman", "Retool", "Supabase",
    "Prisma", "Clerk", "Chakra UI", "Svelte", "Tailwind Labs", "Render", "Railway", "Fly.io"
]

CITIES = [
    ("San Francisco", "CA", "United States"),
    ("New York", "NY", "United States"),
    ("Seattle", "WA", "United States"),
    ("Austin", "TX", "United States"),
    ("London", "ENG", "United Kingdom"),
    ("Manchester", "ENG", "United Kingdom"),
    ("Bangalore", "KA", "India"),
    ("Mumbai", "MH", "India"),
    ("Delhi", "DL", "India"),
    ("Toronto", "ON", "Canada"),
    ("Vancouver", "BC", "Canada"),
    ("Berlin", "BE", "Germany"),
    ("Munich", "BY", "Germany"),
    ("Sydney", "NSW", "Australia")
]

TITLES_WITH_SKILLS = [
    ("Frontend Architect", ["React", "TypeScript", "Tailwind CSS", "Git"]),
    ("Senior React Developer", ["React", "TypeScript", "Redux", "Unit Testing"]),
    ("Backend Engineer (Django)", ["Python", "Django", "PostgreSQL", "REST APIs"]),
    ("Node.js Systems Engineer", ["Node.js", "TypeScript", "PostgreSQL", "Docker"]),
    ("DevOps Platform Lead", ["Docker", "AWS", "CI/CD", "Kubernetes", "Git"]),
    ("Full Stack Product Developer", ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL"]),
    ("Data Infrastructure Architect", ["Python", "SQL", "Docker", "AWS", "PostgreSQL"]),
    ("QA Automation Engineer", ["TypeScript", "Unit Testing", "Git", "CI/CD"])
]

class Command(BaseCommand):
    help = "Seeds 10,000+ realistic job postings in the database for scalable discover testing"

    def handle(self, *args, **options):
        self.stdout.write("Initializing large-scale catalog seeding pipeline...")
        
        # 1. Fetch default recruiter/admin user
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.first()
        if not admin_user:
            self.stdout.write(self.style.ERROR("No users found. Please run seed.py or create a user first."))
            return

        # 2. Seed Skills cache
        self.stdout.write("Caching skills required...")
        all_skill_names = set()
        for title, skills in TITLES_WITH_SKILLS:
            all_skill_names.update(skills)
        
        skill_map = {}
        for name in all_skill_names:
            skill, _ = Skill.objects.get_or_create(name=name)
            skill_map[name] = skill

        # 3. Create Companies
        self.stdout.write("Creating target company entities...")
        companies = []
        for name in TECH_COMPANIES:
            company, _ = Company.objects.get_or_create(
                name=name,
                defaults={
                    "website": f"https://{name.lower().replace(' ', '')}.com",
                    "logo_url": f"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60",
                    "description": f"Innovative tech solutions at {name}.",
                    "company_type": random.choice(["startup", "mnc"]),
                    "industry": random.choice(["Fintech", "Developer Tools", "Cloud Infrastructure", "AI Research", "SaaS"]),
                    "employee_count": random.randint(20, 10000),
                    "headquarters": f"{random.choice(CITIES)[0]} Office",
                    "founded_year": random.randint(2005, 2023),
                    "rating": round(random.uniform(3.8, 5.0), 1)
                }
            )
            companies.append(company)

        # 4. Generate 10,100 jobs programmatically
        self.stdout.write("Generating 10,000+ job specifications...")
        jobs_to_create = []
        job_skills_mappings = [] # To bulk insert ManyToMany relationships
        now = timezone.now()

        # Pre-generate 10,100 jobs array
        for i in range(10100):
            company = random.choice(companies)
            city, state, country = random.choice(CITIES)
            title_base, skills_needed = random.choice(TITLES_WITH_SKILLS)
            
            title = f"{title_base} - #{i + 1000}"
            desc = f"Join our growing team at {company.name}! As a {title_base}, you will collaborate to build world-class products. We scale with robust tech and foster creative freedom."
            reqs = f"Experience with: {', '.join(skills_needed)}. Deep understanding of best practices, scalable architectures, and team coordination."
            
            salary_base = random.randint(70, 220) * 1000
            
            # Create a memory-only Job model instance with a pre-set UUID
            job_id = uuid.uuid4()
            job = Job(
                id=job_id,
                recruiter=admin_user,
                company=company,
                title=title,
                description=desc,
                requirements=reqs,
                salary_min=salary_base,
                salary_max=salary_base + random.randint(15, 50) * 1000,
                location=f"{city}, {state}, {country}",
                country=country,
                state=state,
                city=city,
                job_type=random.choice(["remote", "hybrid", "onsite"]),
                employment_type=random.choice(["full_time", "contract", "internship"]),
                experience_level=random.choice(["junior", "mid", "senior", "lead"]),
                apply_url=f"{company.website}/careers/apply-{i}",
                ai_match_score=random.randint(55, 98),
                provider="LinkedIn Jobs" if i % 2 == 0 else "Wellfound",
                provider_job_id=f"seed-{i}-{random.randint(10000, 99999)}",
                original_url=f"{company.website}/careers/job-{i}",
                expires_at=now + timedelta(days=random.randint(30, 90)),
                is_active=True,
                status="published"
            )
            jobs_to_create.append(job)
            
            # Map skills intermediate through model entries
            for skill_name in skills_needed:
                skill = skill_map[skill_name]
                job_skills_mappings.append(
                    Job.skills_required.through(job_id=job_id, skill_id=skill.id)
                )

        # 5. High-speed Bulk Insertion
        self.stdout.write("Executing bulk jobs insertion (10,000+ records)...")
        with transaction.atomic():
            Job.objects.bulk_create(jobs_to_create, batch_size=1000)
            self.stdout.write("Executing bulk skills mappings insertion...")
            Job.skills_required.through.objects.bulk_create(job_skills_mappings, batch_size=2000)

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(jobs_to_create)} job records in the database!"
            )
        )
