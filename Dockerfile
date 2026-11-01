# ==============================================================================
# Stage 1: Build the React Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy root configurations and package manifests
COPY package.json package-lock.json* ./
COPY shared ./shared
COPY web ./web

# Install frontend dependencies and build production bundle
WORKDIR /app/web
RUN npm ci || npm install
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Backend & Single-Process Runtime
# ==============================================================================
FROM python:3.11-slim AS runtime
WORKDIR /app

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    DATABASE_URL="sqlite:////app/data/pantry.db" \
    FRONTEND_DIST="/app/web/dist"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy application code
COPY backend ./backend
COPY shared ./shared

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/web/dist ./web/dist

# Ensure data directory exists for persistent SQLite database
RUN mkdir -p /app/data

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start Uvicorn ASGI server
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
