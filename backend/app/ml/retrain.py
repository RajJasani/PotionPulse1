#!/usr/bin/env python3
"""
Madam Hexley's Potion Pantry - Arcane Model Retrainer
Command-line utility to trigger on-demand retraining of all demand forecasting models,
evaluating against seasonal-naive baseline and updating RMSE caches.

Usage:
    PYTHONPATH=. backend/venv/bin/python backend/app/ml/retrain.py
"""

import sys
import time
from backend.app.core.database import SessionLocal
from backend.app.ml.forecaster import DemandForecaster

def run_retrain():
    print("🔮 [PotionPulse ML] Initiating Arcane Demand Model Retraining...")
    start_time = time.time()
    
    db = SessionLocal()
    try:
        DemandForecaster.clear_cache()
        forecaster = DemandForecaster(db)
        metrics = forecaster.train_and_evaluate(test_days=45)
        
        duration = round(time.time() - start_time, 2)
        print(f"✨ [PotionPulse ML] Retraining complete in {duration}s!")
        print(f"   Ingredients Modeled: {len(metrics)}")
        print("   ------------------------------------------------------------")
        print("   Ingredient ID            | Model WAPE | Baseline | Imprv % | RMSE")
        print("   ------------------------------------------------------------")
        for ing_id, m in sorted(metrics.items()):
            print(f"   {ing_id:<24} | {m['wape_model']:>10.4f} | {m['wape_baseline']:>8.4f} | {m['improvement_pct']:>6.1f}% | {m['rmse']:>5.2f}")
        print("   ------------------------------------------------------------")
        return 0
    except Exception as e:
        print(f"❌ [PotionPulse ML] Retraining failed with arcane disturbance: {e}")
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(run_retrain())
