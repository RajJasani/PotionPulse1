#!/bin/bash
set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
PYTHONPATH=. "$PROJECT_ROOT/backend/venv/bin/python" backend/app/ml/retrain.py
