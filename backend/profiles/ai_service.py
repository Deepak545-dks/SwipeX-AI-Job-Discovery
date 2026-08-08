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
        - Formatting & Parsing (15%)
        - Keyword Match (25%)
        - Skills Match (20%)
        - Experience/Relevance (15%)
        - Education (5%)
        - Projects (10%)
        - Certifications (5%)
        - Grammar & Readability (5%)
        """
        import re
        import logging
        
        logger = logging.getLogger("profiles.ai_service")
        
        # 1. Normalize helper
        def normalize_str(t):
            t = (t or "").lower()
            t = re.sub(r'[\.\-\(\)\/]', ' ', t)
            t = " ".join(t.split())
            # Map equivalent forms
            t = t.replace("react js", "react").replace("reactjs", "react")
            t = t.replace("node js", "node").replace("nodejs", "node")
            t = t.replace("javascript", "js")
            t = t.replace("typescript", "ts")
            t = t.replace("tailwind css", "tailwind").replace("tailwindcss", "tailwind")
            t = t.replace("ci cd", "cicd").replace("cicd", "cicd")
            t = t.replace("next js", "next").replace("nextjs", "next")
            return t

        user_skills_raw = [s.name.lower() for s in profile.skills.all()]
        user_skills = []
        for s in user_skills_raw:
            if ',' in s:
                parts = [p.strip() for p in s.split(',')]
            else:
                parts = [p.strip() for p in s.split()]
            for p in parts:
                if p and p not in user_skills:
                    user_skills.append(p)
        bio_text = (profile.bio or "").lower()
        resume_text_lower = (resume_text or "").lower()
        
        # Combine text for matching
        combined_text = f"{resume_text_lower} {bio_text} {' '.join(user_skills)}".strip()
        normalized_combined = normalize_str(combined_text)
        
        # Log extracted text details
        logger.info(f"[ATS Parser] Extracted resume text length: {len(resume_text)} characters.")
        
        # Identify sections present in resume text
        headings = ["experience", "work", "education", "project", "skill", "contact", "summary", "achievements", "links", "certification"]
        found_sections = [h for h in headings if h in resume_text_lower]
        logger.info(f"[ATS Parser] Parsed sections detected: {found_sections}")

        # --- SCORE 1: Formatting & Parsing (15%) ---
        if resume_text:
            formatting_score = 70
            # Add points based on section headings found (each adds 4.5 points, cap at 30)
            heading_points = min(30, len(found_sections) * 4.5)
            formatting_score += int(heading_points)
            
            # Deduct points if layout issues (e.g. extremely short or missing standard margins indicator like spacing)
            if "\n\n\n" in resume_text:
                formatting_score -= 10
            if len(resume_text.split()) < 80:
                formatting_score -= 15
        else:
            # Fallback if no resume uploaded but profile is filled
            profile_items = 0
            if profile.full_name: profile_items += 1
            if profile.bio: profile_items += 1
            if profile.experiences.exists(): profile_items += 2
            if profile.education.exists(): profile_items += 1
            if profile.projects.exists(): profile_items += 1
            formatting_score = 30 + (profile_items * 10)
            
        formatting_score = min(100, max(0, formatting_score))

        # --- SCORE 2: Keyword Match (25%) ---
        expected_keywords = set()
        is_job_match = False
        job_title = ""
        
        if job:
            is_job_match = True
            job_title = job.title
            # Add skills from job
            for skill in job.skills_required.all():
                expected_keywords.add(normalize_str(skill.name))
            # Extract words from description
            desc_words = re.findall(r'[a-zA-Z\+\#\-]+', (job.title + " " + job.description + " " + job.requirements).lower())
            common_tech = {
                "python", "javascript", "js", "typescript", "ts", "java", "sql", "react", "django", "docker", "aws", "git", 
                "cicd", "ci/cd", "kubernetes", "postgresql", "graphql", "redux", "mongodb", "html", "css", "c#", "go", "rust",
                "communication", "collaboration", "teamwork", "leadership", "agile", "scrum", "analytics", "testing", "linux"
            }
            for w in desc_words:
                norm_w = normalize_str(w)
                if norm_w in common_tech or w in common_tech:
                    expected_keywords.add(norm_w)
        else:
            # General ATS Mode: Choose appropriate general keyword domain
            # Define domain keywords
            domain_map = {
                "Frontend & UI Engineering": ["react", "js", "ts", "html", "css", "vite", "tailwind", "next", "redux", "graphql", "figma"],
                "Backend & Systems Engineering": ["python", "django", "fastapi", "flask", "java", "spring", "node", "express", "sql", "postgresql", "mongodb", "rest", "api"],
                "DevOps & Infrastructure": ["aws", "docker", "kubernetes", "cicd", "git", "terraform", "jenkins", "cloud", "linux", "bash"],
                "Management & Strategy": ["agile", "scrum", "jira", "management", "roadmap", "product", "strategy", "analytics", "kpi"],
                "Quality Assurance & Test Automation": ["testing", "selenium", "cypress", "jest", "automation", "qa", "test", "mocha"],
                "Data Science & AI Studio": ["pytorch", "tensorflow", "numpy", "pandas", "scikit", "ml", "machine learning", "data", "ai", "deep learning"]
            }
            
            # Count domain hits in candidate's text
            domain_scores = {}
            for dom, kw_list in domain_map.items():
                hits = sum(1 for kw in kw_list if kw in normalized_combined)
                domain_scores[dom] = hits
                
            # Select domain with highest overlap
            best_domain = max(domain_scores, key=domain_scores.get)
            domain_hits = domain_scores[best_domain]
            
            # Expected keywords: best domain keywords + user profile skills
            for kw in domain_map[best_domain]:
                expected_keywords.add(normalize_str(kw))
            for s in user_skills:
                expected_keywords.add(normalize_str(s))
                
            # Fallback expected keywords if profile + resume is completely blank
            if not expected_keywords:
                expected_keywords = {"git", "sql", "api", "agile", "communication", "teamwork", "aws", "docker", "cicd"}

        # Calculate keyword score
        matched_kws = []
        missing_kws = []
        
        for kw in expected_keywords:
            if kw in normalized_combined:
                matched_kws.append(kw)
            else:
                missing_kws.append(kw)
                
        if expected_keywords:
            keyword_score = int((len(matched_kws) / len(expected_keywords)) * 100)
            # Add reasonable minimum threshold if they have some general overlap
            if len(matched_kws) >= 3:
                keyword_score = max(keyword_score, 45)
        else:
            keyword_score = 75
            
        keyword_score = min(100, max(0, keyword_score))

        # --- SCORE 3: Skills Match (20%) ---
        skills_score = 50 if user_skills else 30
        skills_score += len(user_skills) * 6
        
        # Check how many profile skills are explicitly mentioned in the resume text
        skills_found_in_text = sum(1 for s in user_skills if normalize_str(s) in normalized_combined)
        skills_score += skills_found_in_text * 8
        skills_score = min(100, max(0, skills_score))

        # --- SCORE 4: Experience/Relevance (15%) ---
        experience_score = 45
        exp_list = profile.experiences.all()
        if exp_list.exists():
            experience_score += 15 * exp_list.count()
            # check for quantified metrics
            quantified = False
            for exp in exp_list:
                desc = (exp.description or "").lower()
                if re.search(r'\b\d+%\b|\$\d+|\b\d+\s*k\b|\b\d+\s*m\b|reduced|optimized|saved|managed|led|increased|improved', desc):
                    quantified = True
                    break
            if quantified:
                experience_score += 20
            else:
                experience_score += 5
        else:
            # Try to find experience indicators in resume text
            if re.search(r'experience|worked|developer|engineer|manager|lead|architect', resume_text_lower):
                experience_score = 75
                if re.search(r'\b\d+%\b|\$\d+|\b\d+\s*k\b|improved|optimized|reduced', resume_text_lower):
                    experience_score += 15
                    
        experience_score = min(100, max(0, experience_score))

        # --- SCORE 5: Education (5%) ---
        education_score = 50
        edu_list = profile.education.all()
        if edu_list.exists():
            education_score += 35
            # degree check
            degrees_str = " ".join([e.degree for e in edu_list]).lower()
            if re.search(r'bachelor|master|phd|bsc|msc|b\.s|m\.s|engineering|computer|science|mba', degrees_str):
                education_score += 15
        else:
            if re.search(r'education|degree|university|college|bsc|msc|b\.s|m\.s|bachelor|master', resume_text_lower):
                education_score = 80
                if re.search(r'computer science|engineering|information technology', resume_text_lower):
                    education_score += 15
                    
        education_score = min(100, max(0, education_score))

        # --- SCORE 6: Projects (10%) ---
        projects_score = 45
        proj_list = profile.projects.all()
        if proj_list.exists():
            projects_score += 25 * proj_list.count()
            has_proj_links = any(p.project_url for p in proj_list)
            if has_proj_links or profile.github_url or profile.portfolio_url:
                projects_score += 15
        else:
            if re.search(r'project|portfolio|github|github\.com|hackathon', resume_text_lower):
                projects_score = 75
                if "github.com" in resume_text_lower:
                    projects_score += 15
                    
        projects_score = min(100, max(0, projects_score))

        # --- SCORE 7: Certifications (5%) ---
        certification_score = 55
        # Search resume text + profiles for certifications keyword
        certs_match = re.findall(r'certif|certified|certification|aws certified|scrum master|pmp|csm|udemy|coursera|cert', resume_text_lower + " " + bio_text)
        if certs_match:
            certification_score += 25
            if len(certs_match) > 1:
                certification_score += 20
        else:
            # Base score if they have good keywords/skills indicating solid qualifications
            if skills_score >= 80 or experience_score >= 80:
                certification_score = 70
                
        certification_score = min(100, max(0, certification_score))

        # --- SCORE 8: Grammar/Readability (5%) ---
        grammar_score = 95
        if resume_text:
            if "  " in resume_text:
                grammar_score -= 10
            if len(resume_text.split()) < 100:
                grammar_score -= 15
        else:
            grammar_score = 75
            
        grammar_score = min(100, max(0, grammar_score))

        # Calculate final weighted score
        final_ats_score = int(
            (formatting_score * 0.15) +
            (keyword_score * 0.25) +
            (skills_score * 0.20) +
            (experience_score * 0.15) +
            (education_score * 0.05) +
            (projects_score * 0.10) +
            (certification_score * 0.05) +
            (grammar_score * 0.05)
        )
        
        # Guarantee reasonable values for complete profiles
        if len(resume_text) > 200 and final_ats_score < 60:
            final_ats_score = 65

        # Print / Log individual components for debugging
        logger.info(f"=== ATS Score Diagnostics for {profile.user.email} ===")
        logger.info(f"  Formatting & Parsing: {formatting_score}")
        logger.info(f"  Keyword Match: {keyword_score}")
        logger.info(f"  Skills Match: {skills_score}")
        logger.info(f"  Experience: {experience_score}")
        logger.info(f"  Education: {education_score}")
        logger.info(f"  Projects: {projects_score}")
        logger.info(f"  Certifications: {certification_score}")
        logger.info(f"  Grammar/Readability: {grammar_score}")
        logger.info(f"  Final Weighted ATS Score: {final_ats_score}")
        logger.info("=============================================")

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

        # Telemetry calculations
        if job:
            best_match = job.title
            highest_compatibility_domain = job.title
            career_path = "Staff Dev Track" if "senior" in job.title.lower() or "lead" in job.title.lower() else "Senior Dev Track"
            compatibility = "Excellent" if final_ats_score >= 80 else ("Good" if final_ats_score >= 65 else "Needs Review")
        else:
            best_match = best_domain if not user_skills else f"Senior {user_skills[0].capitalize()} Engineer"
            highest_compatibility_domain = best_domain
            career_path = "Staff Dev Track" if experience_score >= 85 else "Senior Dev Track"
            compatibility = "Excellent" if final_ats_score >= 80 else ("Good" if final_ats_score >= 65 else "Needs Review")

        # Actionable recommendations list
        improvements = []
        if formatting_score < 80:
            improvements.append("Structure your resume with standard headings like 'Experience' and 'Education'.")
        if keyword_score < 75:
            improvements.append("Incorporate more domain-relevant technical keywords and tools in your profile.")
        if experience_score < 85:
            improvements.append("Quantify your accomplishments (e.g. 'boosted performance by 25%') under Work Experience.")
        if projects_score < 80:
            improvements.append("List 2+ projects detailing technical stacks and links to your GitHub code repositories.")
        if certification_score < 80:
            improvements.append("Add relevant professional certificates (e.g., AWS Developer, Certified Scrum Master) to highlight credentials.")
        
        if len(improvements) < 3:
            improvements.append("Optimize font formatting and remove double spaces for better readability scans.")
            improvements.append("Keep your profile summary/bio brief and enriched with industry technical tags.")

        # Boost estimate
        expected_boost = min(98, final_ats_score + int((100 - final_ats_score) * 0.6))
        
        # Strengths
        strengths = []
        if len(user_skills) > 0:
            strengths.append(f"Strong foundation in {', '.join([s.capitalize() for s in user_skills[:3]])}.")
        if exp_list.exists():
            strengths.append(f"Practical industry experience with {exp_list.count()} professional roles.")
        if edu_list.exists():
            strengths.append("Structured academic background in engineering or related fields.")
        if not strengths:
            strengths.append("Clean resume parsing structure ready for employer scans.")

        # Weaknesses
        weaknesses = []
        if len(user_skills) < 4:
            weaknesses.append("Profile has fewer than 4 technical skills tags.")
        if not resume_text:
            weaknesses.append("Resume file text could not be extracted. Make sure a searchable text PDF/DOCX is uploaded.")
        if exp_list.filter(description="").exists():
            weaknesses.append("One or more work experience logs lack details of responsibilities.")

        profile_completeness = 0
        if profile.full_name: profile_completeness += 20
        if profile.bio: profile_completeness += 20
        if exp_list.exists(): profile_completeness += 20
        if proj_list.exists(): profile_completeness += 15
        if user_skills: profile_completeness += 15
        if edu_list.exists(): profile_completeness += 10

        recruiter_interest = "High" if final_ats_score >= 80 else ("Medium" if final_ats_score >= 70 else "Low")
        resume_strength = "Strong" if final_ats_score >= 85 else ("Good" if final_ats_score >= 75 else ("Fair" if final_ats_score >= 60 else "Needs Work"))

        # Format matched & missing lists nicely for display
        matched_display = [kw.capitalize() if kw not in ["aws", "sql", "cicd", "html", "css", "js", "ts"] else kw.upper() for kw in matched_kws]
        missing_display = [kw.capitalize() if kw not in ["aws", "sql", "cicd", "html", "css", "js", "ts"] else kw.upper() for kw in missing_kws]
        
        # Adjust custom forms to display standard format
        matched_display = [("CI/CD" if w == "CICD" else ("JavaScript" if w == "JS" else ("TypeScript" if w == "TS" else w))) for w in matched_display]
        missing_display = [("CI/CD" if w == "CICD" else ("JavaScript" if w == "JS" else ("TypeScript" if w == "TS" else w))) for w in missing_display]

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
            "certification_score": certification_score,
            "certifications_score": certification_score,
            "grammar_score": grammar_score,
            "matched_keywords": matched_display[:10],
            "missing_keywords": missing_display[:10],
            "missing_skills": missing_display[:10],
            "improvements": improvements[:5],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "is_job_match": is_job_match,
            "job_title": job_title,
            "best_match": best_match,
            "confidence_score": int(final_ats_score * 0.95 + 4),
            "compatibility": compatibility,
            "career_path": career_path,
            "highest_compatibility_domain": highest_compatibility_domain,
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
