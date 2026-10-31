from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Ingredient
from backend.app.schemas import ForecastOut, DailyForecastItem
from backend.app.ml.forecaster import DemandForecaster

router = APIRouter(prefix="/forecasts", tags=["Crystal Ball & Forecasts"])

@router.get("/{ingredient_id}", response_model=ForecastOut)
def get_ingredient_forecast(
    ingredient_id: str,
    horizon_days: int = Query(14, ge=1, le=30),
    db: Session = Depends(get_db)
):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=404,
            detail=f"Reagent '{ingredient_id}' not found in pantry records."
        )

    forecaster = DemandForecaster(db)
    items = forecaster.predict_future_demand(ingredient_id=ingredient_id, horizon_days=horizon_days)

    forecast_items = [
        DailyForecastItem(
            date=item["date"],
            predicted_demand=item["predicted_demand"],
            lower_bound=item["lower_bound"],
            upper_bound=item["upper_bound"],
            event_multiplier=item["event_multiplier"],
            applied_event_name=item["applied_event_name"]
        )
        for item in items
    ]

    return ForecastOut(
        ingredient_id=ingredient.id,
        ingredient_name=ingredient.name,
        current_stock=ingredient.current_stock,
        forecast=forecast_items
    )

@router.post("/retrain")
def retrain_forecast_models(db: Session = Depends(get_db)):
    """
    Triggers immediate on-demand retraining of all ingredient demand models.
    Refreshes evaluation metrics, RMSE cache, and forecast baselines.
    """
    DemandForecaster.clear_cache()
    forecaster = DemandForecaster(db)
    metrics = forecaster.train_and_evaluate()
    return {
        "status": "success",
        "message": f"Successfully retrained models for {len(metrics)} ingredients.",
        "models_count": len(metrics),
        "metrics_summary": metrics
    }
