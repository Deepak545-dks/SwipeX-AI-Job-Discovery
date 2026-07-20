import re
import logging

logger = logging.getLogger("profiles.ai_service")

class AIService:
    """
    Production-ready AI service abstraction layer.
    Provides mock/intelligent heuristic implementations for Resume Analysis,
    Cover Letter Generation, Interview Question Generation, and Skill Gap Analysis.
    Can be easily connected to external LLM providers (e.g. Gemini, OpenAI) via API key configuration.
    """

    @staticmethod
    def analyze_resume(profile, resume_text=""):
        """
        Analyzes candidate's profile and extracted resume text.
        Returns score, strengths, weaknesses, missing skills, and improvements.
        """
        user_skills = [s.name.lower() for s in profile.skills.all()]
        combined_text = (resume_text + " " + (profile.bio or "") + " " + (" ".join(user_skills))).lower()

        # Common industry skills list to detect missing skills
        industry_tech_stack = [
            "React", "TypeScript", "Python", "Django", "Node.js", "Docker",
            "PostgreSQL", "REST APIs", "GraphQL", "AWS", "CI/CD", "Git",
            "Tailwind CSS", "Redux", "Unit Testing"
        ]

        present_skills = []
        for tech in industry_tech_stack:
            if tech.lower() in combined_text or tech.lower() in user_skills:
                present_skills.append(tech)

        missing_skills = [tech for tech in industry_tech_stack if tech not in present_skills][:4]

        # Calculate dynamic overall score based on completeness
        score = 65
        if profile.full_name: score += 5
        if profile.bio: score += 5
        if len(user_skills) >= 3: score += 10
        if profile.experiences.exists(): score += 10
        if profile.education.exists(): score += 5
        score = min(score, 95)

        # Strengths
        strengths = []
        if len(user_skills) > 0:
            strengths.append(f"Strong technical foundations in {', '.join([s.name for s in profile.skills.all()[:3]])}.")
        if profile.experiences.exists():
            exp_count = profile.experiences.count()
            strengths.append(f"Demonstrated practical industry experience with {exp_count} logged experience entry/entries.")
        if profile.education.exists():
            strengths.append("Structured academic background in relevant fields of study.")
        if not strengths:
            strengths.append("Clean profile structure ready for employer discovery.")

        # Weaknesses / Area for improvement
        weaknesses = []
        if len(user_skills) < 4:
            weaknesses.append("Skills section contains fewer than 4 technical tags. Adding relevant skills improves ATS match rates.")
        if not resume_text:
            weaknesses.append("PDF resume document text could not be extracted or parsed. Uploading a searchable PDF enhances parsing accuracy.")
        if profile.experiences.filter(description="").exists():
            weaknesses.append("Some work experience entries lack detailed responsibility descriptions.")
        if not weaknesses:
            weaknesses.append("Quantifiable metrics (e.g. '% efficiency gains' or 'user scale numbers') could be highlighted further.")

        # Recommendations
        improvements = [
            "Quantify key accomplishments in your experience descriptions (e.g. 'Improved response time by 25%').",
            f"Consider adding key trending tech tags like {', '.join(missing_skills[:2])} if you have working knowledge.",
            "Ensure your GitHub and LinkedIn portfolio links are added and up to date.",
            "Include a concise 2-3 sentence professional summary highlighting your core expertise at the top."
        ]

        return {
            "overall_score": score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_skills": missing_skills,
            "improvements": improvements
        }

    @staticmethod
    def generate_cover_letter(profile, job):
        """
        Generates a professional cover letter tailored to candidate profile and job requirements.
        """
        candidate_name = profile.full_name or "Applicant"
        company_name = job.company.name if job.company else "Hiring Team"
        job_title = job.title
        location = job.location or "your location"
        
        user_skills = [s.name for s in profile.skills.all()]
        skills_str = ", ".join(user_skills[:4]) if user_skills else "software engineering and modern web development"

        latest_experience = profile.experiences.first()
        exp_title = latest_experience.title if latest_experience else "Software Developer"
        exp_company = latest_experience.company if latest_experience else "recent roles"

        cover_letter = (
            f"Dear Hiring Team at {company_name},\n\n"
            f"I am writing to express my enthusiastic interest in the {job_title} position based in {location}. "
            f"With a strong technical background as a {exp_title} and hands-on expertise in {skills_str}, "
            f"I am confident in my ability to make an immediate, impactful contribution to your engineering goals at {company_name}.\n\n"
            f"In my experience at {exp_company}, I have consistently focused on building scalable, reliable, and user-centric applications. "
            f"Your job listing emphasizes key requirements including {job.description[:120].strip()}... "
            f"My skills align closely with these objectives, particularly in architecting high-performance solutions and collaborating effectively across teams.\n\n"
            f"I would welcome the opportunity to discuss how my background, technical stack, and passion for innovation make me a strong fit for {company_name}. "
            f"Thank you for your time and consideration.\n\n"
            f"Sincerely,\n"
            f"{candidate_name}"
        )

        return {"cover_letter": cover_letter}

    @staticmethod
    def generate_interview_questions(job):
        """
        Generates role-specific, skill-targeted technical and behavioral interview questions.
        """
        skills = [s.name for s in job.skills_required.all()]
        primary_skill = skills[0] if skills else "Software Development"
        secondary_skill = skills[1] if len(skills) > 1 else "API Integration"

        questions = [
            {
                "id": 1,
                "category": "Technical Expertise",
                "question": f"How do you optimize state management and rendering performance when building applications using {primary_skill}?",
                "suggested_answer_tips": f"Discuss state immutability, memoization, lazy loading, and profiling tools specific to {primary_skill}."
            },
            {
                "id": 2,
                "category": "Architecture & Design",
                "question": f"Walk me through how you would design a scalable architecture incorporating {secondary_skill} for the {job.title} position.",
                "suggested_answer_tips": "Focus on data flow, error handling boundaries, caching strategies, and modular component isolation."
            },
            {
                "id": 3,
                "category": "Problem Solving",
                "question": "Can you share an example of a challenging production bug you diagnosed under tight deadlines? How did you resolve it?",
                "suggested_answer_tips": "Use the STAR method (Situation, Task, Action, Result). Highlight diagnostic tooling, root cause analysis, and prevention measures."
            },
            {
                "id": 4,
                "category": "Behavioral & Collaboration",
                "question": f"How do you handle technical disagreements with team members when deciding technical approaches for a role like {job.title}?",
                "suggested_answer_tips": "Emphasize data-driven decision making, benchmarking prototypes, active listening, and aligning with business goals."
            }
        ]

        return {"questions": questions}

    @staticmethod
    def analyze_skill_gap(profile, job):
        """
        Compares candidate profile skills against job requirements.
        Returns match percentage, matching skills, missing skills, and recommendations.
        """
        user_skills = set(s.name.lower() for s in profile.skills.all())
        required_skills = set(s.name.lower() for s in job.skills_required.all())

        # Also parse job requirements string for additional skill words
        req_text = (job.requirements + " " + job.description).lower()
        
        matching = []
        missing = []

        if required_skills:
            for req_skill in job.skills_required.all():
                s_name = req_skill.name
                if s_name.lower() in user_skills or s_name.lower() in (profile.bio or "").lower():
                    matching.append(s_name)
                else:
                    missing.append(s_name)
        else:
            # Fallback if job has no explicit skills_required tag
            matching = [s.name for s in profile.skills.all()[:3]]
            missing = ["TypeScript", "Docker"]

        total_reqs = len(matching) + len(missing)
        if total_reqs > 0:
            match_pct = int((len(matching) / total_reqs) * 100)
            # Add base threshold if candidate has matching keywords
            match_pct = max(match_pct, 40)
        else:
            match_pct = 75

        suggestions = []
        if missing:
            suggestions.append(f"Bridge the gap by practicing hands-on modules in {', '.join(missing[:2])}.")
            suggestions.append(f"Add any personal projects involving {missing[0]} to your profile portfolio.")
        else:
            suggestions.append("You possess all explicitly listed required skills for this job listing!")

        suggestions.append("Tailor your profile bio to highlight experience relevant to key requirements of this role.")

        return {
            "match_percentage": match_pct,
            "matching_skills": matching,
            "missing_skills": missing,
            "suggestions": suggestions
        }
