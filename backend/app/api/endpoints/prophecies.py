from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas import ProphecyStockoutOut
from backend.app.ml.prophecy import ProphecyEngine

router = APIRouter(prefix="/prophecies", tags=["Prophecy Engine"])

@router.get("/stockouts", response_model=List[ProphecyStockoutOut])
def get_stockout_prophecies(db: Session = Depends(get_db)):
    engine = ProphecyEngine(db)
    prophecies = engine.get_all_stockout_prophecies()

    results = []
    for p in prophecies:
        stockout_dt = None
        if p.get("stockout_date"):
            try:
                stockout_dt = datetime.fromisoformat(p["stockout_date"])
            except Exception:
                stockout_dt = None

        results.append(
            ProphecyStockoutOut(
                ingredient_id=p["ingredient_id"],
                name=p["name"],
                current_stock=p["current_stock"],
                unit=p["unit"],
                depletion_rate_per_day=p["depletion_rate_per_day"],
                days_until_stockout=p["days_until_stockout"],
                stockout_date=stockout_dt,
                urgency=p["urgency"],
                minimum_threshold=p["minimum_threshold"],
                is_stocked_out=p["is_stocked_out"]
            )
        )

    return results
