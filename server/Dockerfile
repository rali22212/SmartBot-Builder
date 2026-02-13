FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only torch to save space and ensure it fits in free tiers
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other requirements (ignoring torch since we just installed it)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Use PORT environment variable or default to 7860 (Hugging Face default)
CMD gunicorn -b 0.0.0.0:${PORT:-7860} app:app
