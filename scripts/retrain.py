#!/usr/bin/env python3
import os
import sys

# Ensure root directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ml.retrain import run_retrain

if __name__ == "__main__":
    sys.exit(run_retrain())
