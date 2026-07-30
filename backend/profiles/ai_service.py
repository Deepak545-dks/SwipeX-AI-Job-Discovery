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
    def analyze_resume(profile, resume_text="", job=None):
        """
        Calculates a final ATS Score out of 100 using weighted scoring based on the
        uploaded resume text, profile details, and an optional selected Job object.
        - Formatting (15%)
        - Keyword Match (25%)
        - Skills Match (20%)
        - Experience (15%)
        - Projects (10%)
        - Education & Certs (5%)
        - Grammar & Readability (5%)
        - Contact & Links (5%)
        """
        import re
        user_skills = [s.name.lower() for s in profile.skills.all()]
        bio_text = (profile.bio or "").lower()
        resume_text_lower = (resume_text or "").lower()
        combined_text = f"{resume_text_lower} {bio_text} {' '.join(user_skills)}".strip()

        # 1. Formatting Score (15%)
        formatting_score = 50 if resume_text else 30
        if resume_text:
            headings = ["experience", "work", "education", "project", "skill", "contact", "summary", "achievements", "links"]
            found_headings = sum(1 for h in headings if h in resume_text_lower)
            formatting_score += int((found_headings / len(headings)) * 35)
            # Add points for readable layout (lack of double spacing issues)
            if "\n\n\n" not in resume_text:
                formatting_score += 15
        formatting_score = min(100, max(0, formatting_score))

        # 2. Keyword Match (25%)
        # Extracted required keywords from job details
        job_keywords = set()
        if job:
            # skills required M2M
            for skill in job.skills_required.all():
                job_keywords.add(skill.name.lower())
            
            # description + requirements keyword harvesting
            desc_words = re.findall(r'[a-zA-Z\+\#\-]+', (job.title + " " + job.description + " " + job.requirements).lower())
            common_tech = {
                "python", "javascript", "java", "sql", "react", "django", "docker", "aws", "git", "ci/cd", 
                "typescript", "node.js", "kubernetes", "postgresql", "rest apis", "graphql", "redux",
                "mongodb", "html", "css", "c++", "c#", "ruby", "rails", "php", "laravel", "go", "rust",
                "communication", "collaboration", "teamwork", "leadership", "agile", "scrum", "analytical",
                "problem-solving", "mentoring", "devops", "cloud", "testing", "jira", "linux"
            }
            for w in desc_words:
                if w in common_tech:
                    job_keywords.add(w)
        else:
            # Fallback when no job is selected
            job_keywords = {"python", "sql", "react", "django", "docker", "git", "ci/cd", "aws", "communication", "teamwork"}

        matched_keywords = []
        missing_keywords = []
        for kw in job_keywords:
            if kw in combined_text:
                matched_keywords.append(kw.capitalize() if kw not in ["ci/cd", "aws", "sql"] else kw.upper())
            else:
                missing_keywords.append(kw.capitalize() if kw not in ["ci/cd", "aws", "sql"] else kw.upper())

        total_kws = len(job_keywords)
        if total_kws > 0:
            keyword_score = int((len(matched_keywords) / total_kws) * 100)
        else:
            keyword_score = 75
        keyword_score = min(100, max(0, keyword_score))

        # 3. Skills Match (20%)
        skills_score = 40 if user_skills else 20
        skills_score += len(user_skills) * 10
        skills_found_in_text = sum(1 for s in user_skills if s in resume_text_lower)
        skills_score += skills_found_in_text * 5
        skills_score = min(100, max(0, skills_score))

        # 4. Experience Quality (15%)
        experience_score = 50
        exp_list = profile.experiences.all()
        if exp_list.exists():
            experience_score += 15 * exp_list.count()
            # quantified achievements search
            quantified = False
            for exp in exp_list:
                desc = (exp.description or "").lower()
                if re.search(r'\b\d+%\b|\$\d+|\b\d+\s*k\b|\b\d+\s*m\b|reduced|optimized|saved|managed|led|increased', desc):
                    quantified = True
                    break
            if quantified:
                experience_score += 20
            else:
                experience_score += 5
        else:
            if re.search(r'experience|worked|developer|engineer', resume_text_lower):
                experience_score = 70
        experience_score = min(100, max(0, experience_score))

        # 5. Projects (10%)
        projects_score = 40
        proj_list = profile.projects.all()
        if proj_list.exists():
            projects_score += 30 * proj_list.count()
            has_proj_links = any(p.project_url for p in proj_list)
            if has_proj_links or profile.github_url or profile.portfolio_url:
                projects_score += 20
        else:
            if re.search(r'project|portfolio|github', resume_text_lower):
                projects_score = 70
        projects_score = min(100, max(0, projects_score))

        # 6. Education & Certifications (5%)
        education_score = 50
        edu_list = profile.education.all()
        if edu_list.exists():
            education_score += 30
            # Certs check
            if re.search(r'certif|certified|scrum|aws|azure|course', (resume_text_lower + " " + " ".join([e.description for e in edu_list])).lower()):
                education_score += 20
        else:
            if re.search(r'education|degree|university|college|bsc|msc|b\.s|m\.s', resume_text_lower):
                education_score = 80
        education_score = min(100, max(0, education_score))

        # 7. Grammar & Readability (5%)
        grammar_score = 95
        if resume_text:
            if "  " in resume_text:
                grammar_score -= 10
            if len(resume_text.split()) < 120:
                grammar_score -= 15
        else:
            grammar_score = 50
        grammar_score = min(100, max(0, grammar_score))

        # 8. Contact & Links (5%)
        contact_score = 40
        if profile.user.email:
            contact_score += 15
        if profile.phone or re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', resume_text_lower):
            contact_score += 15
        if profile.linkedin_url:
            contact_score += 15
        if profile.github_url or profile.portfolio_url:
            contact_score += 15
        contact_score = min(100, max(0, contact_score))

        # Calculate final weighted total
        final_ats_score = int(
            (formatting_score * 0.15) +
            (keyword_score * 0.25) +
            (skills_score * 0.20) +
            (experience_score * 0.15) +
            (projects_score * 0.10) +
            (education_score * 0.05) +
            (grammar_score * 0.05) +
            (contact_score * 0.05)
        )

        if final_ats_score >= 90:
            score_grade = "Excellent"
        elif final_ats_score >= 80:
            score_grade = "Good"
        elif final_ats_score >= 70:
            score_grade = "Average"
        elif final_ats_score >= 60:
            score_grade = "Needs Improvement"
        else:
            score_grade = "Poor"

        # Generate custom actionable recommendations
        improvements = []
        if formatting_score < 80:
            improvements.append("Structure your resume with standard headings like 'Experience' and 'Education'.")
        if keyword_score < 75:
            improvements.append("Incorporate more technical keywords and soft skills from the job description.")
        if experience_score < 85:
            improvements.append("Quantify your achievements in experience descriptions (e.g. 'Improved performance by 25%').")
        if projects_score < 80:
            improvements.append("Add a technical project detail section including links to your GitHub code repositories.")
        if education_score < 80:
            improvements.append("Add relevant course work or professional certifications (e.g. AWS, Scrum Master).")
        if contact_score < 85:
            improvements.append("Ensure your phone number, LinkedIn, and GitHub profile URLs are fully complete.")
            
        if len(improvements) < 3:
            improvements.append("Ensure professional spelling and readability fonts are consistent.")
            improvements.append("Keep your profile bio concise and rich in keywords.")

        # Boost estimate
        expected_boost = min(98, final_ats_score + int((100 - final_ats_score) * 0.7))

        # Strengths
        strengths = []
        if len(user_skills) > 0:
            strengths.append(f"Strong technical foundations in {', '.join([s.capitalize() for s in user_skills[:3]])}.")
        if profile.experiences.exists():
            strengths.append(f"Demonstrated practical industry experience with {profile.experiences.count()} logged experience entry/entries.")
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

        # Recruiter telemetry
        profile_completeness = 0
        if profile.full_name: profile_completeness += 20
        if profile.bio: profile_completeness += 20
        if exp_list.exists(): profile_completeness += 20
        if proj_list.exists(): profile_completeness += 15
        if user_skills: profile_completeness += 15
        if edu_list.exists(): profile_completeness += 10

        recruiter_interest = "High" if final_ats_score >= 80 else ("Medium" if final_ats_score >= 70 else "Low")
        resume_strength = "Strong" if final_ats_score >= 85 else ("Good" if final_ats_score >= 75 else ("Fair" if final_ats_score >= 60 else "Needs Work"))

        return {
            "overall_score": final_ats_score,
            "score": final_ats_score,
            "ats_score": final_ats_score,
            "score_grade": score_grade,
            "formatting_score": formatting_score,
            "keyword_score": keyword_score,
            "skills_score": skills_score,
            "experience_score": experience_score,
            "projects_score": projects_score,
            "education_score": education_score,
            "grammar_score": grammar_score,
            "contact_score": contact_score,
            "matched_keywords": matched_keywords[:8],
            "missing_keywords": missing_keywords[:8],
            "missing_skills": missing_keywords[:8],
            "improvements": improvements[:5],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "ats_boost_estimate": {
                "current_score": final_ats_score,
                "expected_score": expected_boost
            },
            "recruiter_view": {
                "interview_probability": int(final_ats_score * 0.95),
                "recruiter_interest": recruiter_interest,
                "resume_strength": resume_strength,
                "profile_completeness": profile_completeness
            }
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
