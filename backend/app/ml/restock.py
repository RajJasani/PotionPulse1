import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Ingredient
from backend.app.ml.forecaster import DemandForecaster

class RestockSpellEngine:
    """
    Arcane Restock Spell:
    Calculates optimal replenishment batches using Lead-Time Demand Integration,
    Statistical Safety Stock (Z-score * RMSE * sqrt(L)), and event surge allowances.
    """
    _RECOMMENDATIONS_CACHE: Optional[tuple] = None

    @classmethod
    def clear_cache(cls):
        cls._RECOMMENDATIONS_CACHE = None

    def __init__(self, db: Session, forecaster: Optional[DemandForecaster] = None):
        self.db = db
        self.forecaster = forecaster or DemandForecaster(db)

    def calculate_recommendation(self, ingredient: Ingredient) -> Optional[Dict]:
        lead_time = max(1, ingredient.lead_time_days)
        stock = ingredient.current_stock

        # 1. Obtain daily forecasts for lead time + 14-day replenishment cycle
        horizon_days = lead_time + 14
        forecasts = self.forecaster.predict_future_demand(ingredient.id, horizon_days=horizon_days)

        # 2. Demand during lead time
        lead_time_demand = sum(f["predicted_demand"] for f in forecasts[:lead_time])

        # 3. Demand during 14-day review/replenishment cycle
        cycle_demand = sum(f["predicted_demand"] for f in forecasts[lead_time:horizon_days])

        # 4. Statistical Safety Stock based on forecast RMSE
        rmse = self.forecaster.ingredient_rmse.get(ingredient.id, 1.2)
        # Z = 1.65 (95% service level in witching operations)
        safety_stock = round(1.65 * rmse * math.sqrt(lead_time), 2)

        # 5. Check if any upcoming event affected the forecast
        max_multiplier = max((f["event_multiplier"] for f in forecasts), default=1.0)
        event_names = list(set(f["applied_event_name"] for f in forecasts if f["applied_event_name"]))

        # 6. Calculate estimated stockout date
        cumulative = 0.0
        days_until_stockout = 0.0
        for i, f in enumerate(forecasts):
            demand = max(0.01, f["predicted_demand"])
            if cumulative + demand >= stock:
                fraction = max(0.0, (stock - cumulative) / demand)
                days_until_stockout = i + fraction
                break
            cumulative += demand
        else:
            days_until_stockout = len(forecasts) + 5.0

        # 7. Reorder point threshold
        dynamic_reorder_point = lead_time_demand + safety_stock
        static_threshold = max(ingredient.reorder_point, ingredient.minimum_threshold)

        # Reorder triggered if stock <= reorder point, or stock <= lead-time demand + buffer,
        # or if an upcoming event surge causes target stock to exceed current inventory,
        # or if stock runs out within the review horizon
        needs_reorder = (
            (stock <= static_threshold)
            or (stock <= dynamic_reorder_point)
            or (max_multiplier > 1.0 and (lead_time_demand + cycle_demand + safety_stock) > stock)
            or (days_until_stockout <= horizon_days)
        )

        if not needs_reorder:
            return None

        # Reorder quantity: target inventory minus current stock
        target_inventory = lead_time_demand + cycle_demand + safety_stock
        recommended_qty = max(5.0, round(target_inventory - stock, 1))
        cost = round(recommended_qty * ingredient.unit_cost_gold, 2)

        if stock <= 0:
            urgency = "CRITICAL"
        elif days_until_stockout <= lead_time or stock <= ingredient.minimum_threshold:
            urgency = "CRITICAL"
        elif days_until_stockout <= (lead_time + 4.0):
            urgency = "SOON"
        else:
            urgency = "NORMAL"

        now = datetime.utcnow()
        stockout_dt = now + timedelta(days=days_until_stockout) if days_until_stockout < 90 else None

        # Human-readable plain English reason string
        reason_phrases = [
            f"Expected demand over {lead_time}d lead time is {lead_time_demand:.1f} {ingredient.unit}.",
            f"Safety stock buffer is {safety_stock:.1f} {ingredient.unit} (RMSE: {rmse:.2f})."
        ]
        if max_multiplier > 1.0 and event_names:
            reason_phrases.append(f"Amplified {max_multiplier:.1f}x by upcoming {', '.join(event_names)}.")
        if stock <= ingredient.minimum_threshold:
            reason_phrases.append(f"Current stock ({stock:.1f} {ingredient.unit}) is below minimum threshold ({ingredient.minimum_threshold:.1f}).")
        else:
            reason_phrases.append(f"Depletion expected in {days_until_stockout:.1f} days.")

        reasoning = " ".join(reason_phrases)

        return {
            "ingredient_id": ingredient.id,
            "ingredient_name": ingredient.name,
            "current_stock": stock,
            "unit": ingredient.unit,
            "recommended_quantity": recommended_qty,
            "estimated_cost_gold": cost,
            "urgency": urgency,
            "projected_stockout_date": stockout_dt.isoformat() if stockout_dt else None,
            "days_until_stockout": round(days_until_stockout, 2),
            "reasoning": reasoning
        }

    def get_all_recommendations(self) -> List[Dict]:
        now = datetime.utcnow()
        if RestockSpellEngine._RECOMMENDATIONS_CACHE:
            cached_time, cached_data = RestockSpellEngine._RECOMMENDATIONS_CACHE
            if (now - cached_time).total_seconds() < 60:
                return cached_data

        ingredients = self.db.query(Ingredient).all()
        recommendations = []
        for ing in ingredients:
            rec = self.calculate_recommendation(ing)
            if rec:
                recommendations.append(rec)

        recommendations.sort(
            key=lambda r: (
                0 if r["urgency"] == "CRITICAL" else 1 if r["urgency"] == "SOON" else 2,
                r["days_until_stockout"] or 999
            )
        )
        RestockSpellEngine._RECOMMENDATIONS_CACHE = (now, recommendations)
        return recommendations
