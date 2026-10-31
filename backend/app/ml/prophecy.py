from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Ingredient
from backend.app.ml.forecaster import DemandForecaster

class ProphecyEngine:
    """
    Arcane Stockout Prophecy Engine:
    Projects exact stockout date, fractional days remaining, and confidence bounds
    by simulating inventory depletion against ML forecast curves.
    """
    def __init__(self, db: Session, forecaster: Optional[DemandForecaster] = None):
        self.db = db
        self.forecaster = forecaster or DemandForecaster(db)

    def calculate_stockout(self, ingredient: Ingredient, horizon_days: int = 30) -> Dict:
        now = datetime.utcnow()
        stock = ingredient.current_stock

        if stock <= 0:
            return {
                "ingredient_id": ingredient.id,
                "name": ingredient.name,
                "current_stock": stock,
                "unit": ingredient.unit,
                "depletion_rate_per_day": 0.0,
                "days_until_stockout": 0.0,
                "stockout_date": now.isoformat(),
                "confidence_range": {"min_days": 0.0, "max_days": 0.0},
                "urgency": "CRITICAL",
                "minimum_threshold": ingredient.minimum_threshold,
                "is_stocked_out": True
            }

        # Fetch daily forecasts
        forecast_items = self.forecaster.predict_future_demand(ingredient.id, horizon_days=horizon_days)
        if not forecast_items:
            # Fallback estimation
            return {
                "ingredient_id": ingredient.id,
                "name": ingredient.name,
                "current_stock": stock,
                "unit": ingredient.unit,
                "depletion_rate_per_day": 3.0,
                "days_until_stockout": round(stock / 3.0, 2),
                "stockout_date": (now + timedelta(days=stock / 3.0)).isoformat(),
                "confidence_range": {"min_days": round(stock / 4.0, 2), "max_days": round(stock / 2.0, 2)},
                "urgency": "WARNING" if (stock / 3.0) < 7 else "HEALTHY",
                "minimum_threshold": ingredient.minimum_threshold,
                "is_stocked_out": False
            }

        # Simulate depletion for: Point Estimate, Upper Demand (Pessimistic), Lower Demand (Optimistic)
        days_point = self._simulate_runout(stock, [f["predicted_demand"] for f in forecast_items])
        days_pessimistic = self._simulate_runout(stock, [f["upper_bound"] for f in forecast_items])
        days_optimistic = self._simulate_runout(stock, [f["lower_bound"] for f in forecast_items])

        avg_daily_rate = float(sum(f["predicted_demand"] for f in forecast_items[:7]) / min(7, len(forecast_items)))
        stockout_dt = now + timedelta(days=days_point) if days_point < 90 else None

        if days_point <= 3.0 or stock <= ingredient.minimum_threshold:
            urgency = "CRITICAL"
        elif days_point <= 7.0 or stock <= ingredient.reorder_point:
            urgency = "WARNING"
        else:
            urgency = "HEALTHY"

        return {
            "ingredient_id": ingredient.id,
            "name": ingredient.name,
            "current_stock": round(stock, 2),
            "unit": ingredient.unit,
            "depletion_rate_per_day": round(avg_daily_rate, 2),
            "days_until_stockout": round(days_point, 2),
            "stockout_date": stockout_dt.isoformat() if stockout_dt else None,
            "confidence_range": {
                "pessimistic_days": round(days_pessimistic, 2),
                "optimistic_days": round(days_optimistic, 2)
            },
            "urgency": urgency,
            "minimum_threshold": ingredient.minimum_threshold,
            "is_stocked_out": False
        }

    def _simulate_runout(self, initial_stock: float, daily_demands: List[float]) -> float:
        remaining = initial_stock
        days = 0.0
        for demand in daily_demands:
            safe_demand = max(0.01, demand)
            if remaining <= safe_demand:
                fraction = remaining / safe_demand
                return days + fraction
            remaining -= safe_demand
            days += 1.0

        # If stock extends past horizon, extrapolate with last day demand
        last_demand = max(0.1, daily_demands[-1] if daily_demands else 1.0)
        return days + (remaining / last_demand)

    def get_all_stockout_prophecies(self) -> List[Dict]:
        ingredients = self.db.query(Ingredient).all()
        prophecies = [self.calculate_stockout(ing) for ing in ingredients]
        prophecies.sort(key=lambda p: (0 if p["is_stocked_out"] else 1, p["days_until_stockout"]))
        return prophecies
