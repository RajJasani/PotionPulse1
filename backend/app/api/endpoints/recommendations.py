from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas import ReorderRecommendationOut
from backend.app.ml.restock import RestockSpellEngine

router = APIRouter(prefix="/recommendations", tags=["Restock Spell & Recommendations"])

@router.get("/reorder", response_model=List[ReorderRecommendationOut])
def get_reorder_recommendations(db: Session = Depends(get_db)):
    spell = RestockSpellEngine(db)
    recs = spell.get_all_recommendations()

    results = []
    for r in recs:
        stockout_dt = None
        if r.get("projected_stockout_date"):
            try:
                stockout_dt = datetime.fromisoformat(r["projected_stockout_date"])
            except Exception:
                stockout_dt = None

        results.append(
            ReorderRecommendationOut(
                ingredient_id=r["ingredient_id"],
                ingredient_name=r["ingredient_name"],
                current_stock=r["current_stock"],
                unit=r["unit"],
                recommended_quantity=r["recommended_quantity"],
                estimated_cost_gold=r["estimated_cost_gold"],
                urgency=r["urgency"],
                projected_stockout_date=stockout_dt,
                days_until_stockout=r.get("days_until_stockout"),
                reasoning=r["reasoning"]
            )
        )

    return results
