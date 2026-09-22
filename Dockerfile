FROM node:22-bookworm-slim AS bundle
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npx esbuild scripts/open-puzzle.mjs --bundle --platform=node --format=esm --outfile=/puzzle-runner.mjs

FROM python:3.12-slim-bookworm
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=bundle /puzzle-runner.mjs /app/puzzle-runner.mjs
ENV PUZZLE_RUNNER=/app/puzzle-runner.mjs
ENV FLASK_ENV=production
CMD ["sh", "-c", "flask --app wsgi db upgrade && python seed.py && gunicorn -w 1 --timeout 120 -b 0.0.0.0:${PORT:-10000} wsgi:app"]
