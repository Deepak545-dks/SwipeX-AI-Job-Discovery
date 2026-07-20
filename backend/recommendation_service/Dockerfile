FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Pre-install dependencies. Note: we use --no-cache-dir to minimize image size
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the transformer model into the docker image so it doesn't download on container start!
# This is a key production engineering best practice for instant boot and deterministic runs!
RUN python -c "from sentence_transformers import SentenceTransformer; Model = SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8008

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8008"]
