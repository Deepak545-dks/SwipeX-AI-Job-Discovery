import requests
import logging
from django.conf import settings

logger = logging.getLogger("jobs.recommendations")

RECOMMENDATION_SERVICE_URL = getattr(settings, 'RECOMMENDATION_SERVICE_URL', 'http://localhost:8008/recommend/')

def rank_jobs_for_candidate(candidate_text: str, jobs_list) -> list:
    """
    Calls the FastAPI SentenceTransformers microservice to rank jobs.
    Returns a list of job IDs ordered by similarity rank, or None if the microservice is offline/errors.
    """
    if not jobs_list:
        return []
        
    payload = {
        "resume_text": candidate_text,
        "jobs": [
            {
                "id": str(job.id),
                "description": f"{job.title} at {job.company.name}. Job Type: {job.job_type}. Location: {job.location}. Description: {job.description}. Requirements: {job.requirements or ''}"
            }
            for job in jobs_list
        ]
    }
    
    try:
        # Use short timeout (e.g. 2.0 seconds) to prevent blocking user requests in production
        response = requests.post(RECOMMENDATION_SERVICE_URL, json=payload, timeout=2.0)
        if response.status_code == 200:
            data = response.json()
            ranked_jobs = data.get("ranked_jobs", [])
            logger.info(f"AI Recommendation ranked {len(ranked_jobs)} jobs successfully using engine: {data.get('engine')}")
            return [item["id"] for item in ranked_jobs]
        else:
            logger.warning(f"Recommendation microservice returned non-200 code: {response.status_code}")
    except Exception as e:
        logger.warning(f"Failed to connect to recommendation microservice: {e}. Falling back to default skills matching.")
        
    return None
