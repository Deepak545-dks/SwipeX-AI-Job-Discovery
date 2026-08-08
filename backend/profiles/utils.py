import logging
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader

logger = logging.getLogger("profiles.utils")

def extract_text_from_pdf(pdf_file_path_or_stream) -> str:
    """
    Extracts plain text from a PDF file path or file-like stream object using pypdf.
    Returns empty string if any error occurs.
    """
    try:
        reader = PdfReader(pdf_file_path_or_stream)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF resume: {e}")
        return ""

def extract_text_from_docx(docx_file_path_or_stream) -> str:
    """
    Extracts plain text from a DOCX resume file stream or path using standard zipfile and xml parsing.
    """
    try:
        with zipfile.ZipFile(docx_file_path_or_stream) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # XML namespace for Word markup
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for para in root.findall('.//w:p', ns):
                text_runs = []
                for run in para.findall('.//w:t', ns):
                    if run.text:
                        text_runs.append(run.text)
                if text_runs:
                    paragraphs.append("".join(text_runs))
            return "\n".join(paragraphs).strip()
    except Exception as e:
        logger.error(f"Error extracting text from DOCX resume: {e}")
        return ""

def extract_text(file_obj, filename) -> str:
    """
    Directs the stream to the appropriate parser based on file extension.
    """
    ext = filename.split('.')[-1].lower()
    if ext == 'pdf':
        return extract_text_from_pdf(file_obj)
    elif ext in ['docx', 'doc']:
        return extract_text_from_docx(file_obj)
    return ""

def compile_candidate_profile_text(profile) -> str:
    """
    Compiles a comprehensive text corpus representing the candidate's professional profile
    (combining full name, bio, experience descriptions, education history, and skills list).
    Used as search queries or recommendation inputs when matching jobs.
    """
    sections = []
    
    if profile.full_name:
        sections.append(f"Name: {profile.full_name}")
        
    if profile.bio:
        sections.append(f"Summary / Bio: {profile.bio}")
        
    # Skills list
    skills = [s.name for s in profile.skills.all()]
    if skills:
        sections.append(f"Skills stack: {', '.join(skills)}")
        
    # Work Experience history
    experiences = profile.experiences.all()
    if experiences.exists():
        sections.append("Work Experience:")
        for exp in experiences:
            end_val = exp.end_date.strftime("%Y-%m") if exp.end_date else ("Present" if exp.is_current else "Unknown")
            exp_text = f"- {exp.title} at {exp.company} ({exp.start_date.strftime('%Y-%m')} to {end_val})."
            if exp.description:
                exp_text += f" Responsibilities: {exp.description}"
            sections.append(exp_text)
            
    # Education history
    education_list = profile.education.all()
    if education_list.exists():
        sections.append("Education:")
        for edu in education_list:
            edu_text = f"- {edu.degree} in {edu.field_of_study} from {edu.institution}."
            sections.append(edu_text)
            
    return "\n\n".join(sections)

def get_recommendation_text_for_candidate(user) -> str:
    """
    Gets the text to send to the recommendation engine for a candidate.
    Combines the extracted text of the latest resume PDF AND the consolidated profile text corpus.
    This guarantees rich textual inputs for semantic embedding matching.
    """
    profile = user.profile
    profile_text = compile_candidate_profile_text(profile)
    
    latest_resume = profile.resumes.first()
    resume_text = ""
    if latest_resume and latest_resume.file:
        try:
            # Open resume file stream
            with latest_resume.file.open('rb') as f:
                resume_text = extract_text(f, latest_resume.file.name)
        except Exception as e:
            logger.error(f"Error opening resume file for text extraction: {e}")
            
    if resume_text:
        # Merge both texts to enrich the corpus
        return f"{resume_text}\n\nCandidate Profile Details:\n{profile_text}"
    return profile_text
