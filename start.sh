#!/usr/bin/env bash
# ==============================================================================
# PotionPulse - Unified Dev / Production Startup Script
# ==============================================================================
set -e

MODE="${1:-dev}"

echo "=========================================================="
echo "  🔮 Madam Hexley's PotionPulse Apothecary Dashboard"
echo "  Mode: ${MODE}"
echo "=========================================================="

# Activate virtual environment if present
if [ -d "backend/venv" ]; then
  source backend/venv/bin/activate
fi

if [ "$MODE" = "prod" ] || [ "$MODE" = "production" ]; then
  echo "📦 Building production frontend..."
  cd web && npm run build && cd ..

  echo "🚀 Launching unified production server on http://0.0.0.0:8000..."
  exec uvicorn backend.app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
else
  echo "✨ Starting in Development Mode:"
  echo "   - FastAPI backend on http://localhost:8000"
  echo "   - Vite React frontend on http://localhost:5173"
  echo ""

  # Start backend in background
  PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
  BACKEND_PID=$!

  # Start frontend in foreground
  cd web
  npm run dev -- --host 0.0.0.0 --port 5173 &
  FRONTEND_PID=$!

  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT INT TERM
  wait
fi
