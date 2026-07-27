# seeder.py
import logging
from django.contrib.auth import get_user_model
from django.db import transaction, connection
from profiles.models import Skill
from jobs.models import Company, Job
from jobs.seed_data import COMPANIES_SEED_INFO

logger = logging.getLogger(__name__)

def seed_db_if_empty():
    # 1. Double check that tables are migrated
    tables = connection.introspection.table_names()
    if "jobs_job" not in tables or "jobs_company" not in tables or "profiles_skill" not in tables:
        logger.info("Database tables not fully migrated yet. Skipping seed.")
        return

    # 2. Check if jobs are empty
    if Job.objects.count() > 0:
        logger.info("Database already contains job listings. Skipping auto-seed.")
        return

    logger.info("No job listings found in database. Starting automatic database seed...")
    User = get_user_model()

    try:
        with transaction.atomic():
            # 3. Create or fetch recruiter user
            recruiter, created = User.objects.get_or_create(
                email="recruiter@example.com",
                defaults={
                    "role": "recruiter",
                    "is_verified": True,
                    "is_active": True
                }
            )
            if created:
                recruiter.set_password("Password123!")
                recruiter.save()
                logger.info("Created default recruiter user recruiter@example.com")

            # 4. Iterate over companies seed info
            for comp_name, comp_data in COMPANIES_SEED_INFO.items():
                company, c_created = Company.objects.get_or_create(
                    name=comp_name,
                    defaults={
                        "website": comp_data.get("website", ""),
                        "logo_url": comp_data.get("logo_url", ""),
                        "description": comp_data.get("description", ""),
                        "company_type": comp_data.get("company_type", "mnc"),
                        "industry": comp_data.get("industry", ""),
                        "employee_count": comp_data.get("employee_count"),
                        "headquarters": comp_data.get("headquarters", ""),
                        "founded_year": comp_data.get("founded_year"),
                    }
                )
                if c_created:
                    logger.info(f"Created company profile for {comp_name}")

                # 5. Insert company jobs
                for job_data in comp_data.get("jobs", []):
                    job, j_created = Job.objects.get_or_create(
                        title=job_data["title"],
                        company=company,
                        recruiter=recruiter,
                        defaults={
                            "description": job_data["description"],
                            "requirements": job_data["requirements"],
                            "salary_min": job_data["salary_min"],
                            "salary_max": job_data["salary_max"],
                            "location": job_data["location"],
                            "job_type": job_data["job_type"],
                            "employment_type": job_data["employment_type"],
                            "experience_level": job_data["experience_level"],
                            "status": "published",
                            "is_active": True,
                        }
                    )
                    if j_created:
                        # 6. Add required skills
                        skills_to_add = []
                        for s_name in job_data.get("skills", []):
                            skill, _ = Skill.objects.get_or_create(name=s_name)
                            skills_to_add.append(skill)
                        job.skills_required.add(*skills_to_add)

            logger.info("Automatic database seeding completed successfully! Inserted 200+ jobs.")

    except Exception as e:
        logger.error(f"Failed to automatically seed database: {e}")
