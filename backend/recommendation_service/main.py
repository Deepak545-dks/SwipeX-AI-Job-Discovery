import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recommendation_service")

app = FastAPI(title="SwipeX AI Recommendation Service")

# Attempt to load Sentence Transformers. If it fails or is not installed, fallback to TF-IDF.
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    
    # Load model on startup
    MODEL_NAME = "all-MiniLM-L6-v2"
    logger.info(f"Loading SentenceTransformer model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    logger.info("SentenceTransformer model loaded successfully.")
    HAS_TRANSFORMERS = True
except ImportError:
    logger.warning("sentence-transformers or numpy not installed. Falling back to TF-IDF similarity.")
    HAS_TRANSFORMERS = False
except Exception as e:
    logger.error(f"Error loading SentenceTransformer model: {e}. Falling back to TF-IDF similarity.")
    HAS_TRANSFORMERS = False

if not HAS_TRANSFORMERS:
    # TF-IDF Fallback setup
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        logger.info("Scikit-learn loaded successfully for TF-IDF fallback.")
        HAS_TFIDF = True
    except ImportError:
        logger.warning("scikit-learn not installed. Falling back to simple keyword matching.")
        HAS_TFIDF = False

# Request/Response schemas
class JobItem(BaseModel):
    id: str
    description: str

class RecommendationRequest(BaseModel):
    resume_text: str
    jobs: List[JobItem]

class RankedJob(BaseModel):
    id: str
    score: float

class RecommendationResponse(BaseModel):
    ranked_jobs: List[RankedJob]
    engine: str

def compute_transformers_similarity(resume: str, job_descriptions: List[str]) -> List[float]:
    # Encode resume and jobs
    texts = [resume] + job_descriptions
    embeddings = model.encode(texts, show_progress_bar=False)
    
    resume_emb = embeddings[0]
    job_embs = embeddings[1:]
    
    # Calculate cosine similarity manually using numpy
    dot_products = np.dot(job_embs, resume_emb)
    job_norms = np.linalg.norm(job_embs, axis=1)
    resume_norm = np.linalg.norm(resume_emb)
    
    # Avoid divide by zero
    norms = job_norms * resume_norm
    norms[norms == 0] = 1e-9
    
    similarities = dot_products / norms
    return [float(score) for score in similarities]

def compute_tfidf_similarity(resume: str, job_descriptions: List[str]) -> List[float]:
    vectorizer = TfidfVectorizer(stop_words='english')
    corpus = [resume] + job_descriptions
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    # Calculate cosine similarity of the first item (resume) against the rest
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
    return [float(score) for score in similarities[0]]

def compute_keyword_similarity(resume: str, job_descriptions: List[str]) -> List[float]:
    # Simple overlap score normalized by length of job description words
    resume_words = set(resume.lower().split())
    scores = []
    for desc in job_descriptions:
        desc_words = desc.lower().split()
        if not desc_words:
            scores.append(0.0)
            continue
        overlap = len(resume_words.intersection(set(desc_words)))
        scores.append(float(overlap) / len(set(desc_words)))
    return scores

@app.post("/recommend/", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest):
    if not payload.jobs:
        return {"ranked_jobs": [], "engine": "none"}
        
    resume_text = payload.resume_text.strip()
    job_ids = [job.id for job in payload.jobs]
    job_descriptions = [job.description.strip() for job in payload.jobs]
    
    scores = []
    engine = "transformers"
    
    try:
        if HAS_TRANSFORMERS and 'model' in globals():
            scores = compute_transformers_similarity(resume_text, job_descriptions)
        elif HAS_TFIDF:
            scores = compute_tfidf_similarity(resume_text, job_descriptions)
            engine = "tfidf"
        else:
            scores = compute_keyword_similarity(resume_text, job_descriptions)
            engine = "keyword"
    except Exception as e:
        logger.error(f"Error computing similarity: {e}. Defaulting to keyword matching.")
        scores = compute_keyword_similarity(resume_text, job_descriptions)
        engine = "keyword_fallback"
        
    # Map back to models, sort, and return
    ranked = [
        RankedJob(id=job_ids[i], score=round(scores[i], 4))
        for i in range(len(job_ids))
    ]
    ranked.sort(key=lambda x: x.score, reverse=True)
    
    return RecommendationResponse(ranked_jobs=ranked, engine=engine)

@app.get("/health/")
def health_check():
    return {
        "status": "healthy",
        "has_transformers": HAS_TRANSFORMERS,
        "has_tfidf": HAS_TFIDF if 'HAS_TFIDF' in globals() else False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True)
