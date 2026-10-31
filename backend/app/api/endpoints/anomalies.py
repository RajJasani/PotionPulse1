from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Anomaly, Ingredient
from backend.app.schemas import AnomalyOut, AnomalyResolve
from backend.app.ml.anomaly_detector import StrangeHappeningsDetector

router = APIRouter(prefix="/anomalies", tags=["Strange Happenings & Anomalies"])

@router.get("", response_model=List[AnomalyOut])
def get_anomalies(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (UNRESOLVED, ACKNOWLEDGED, RESOLVED)"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)
    if status_filter:
        query = query.filter(Anomaly.status == status_filter.upper())

    anomalies = query.order_by(Anomaly.detected_at.desc()).limit(limit).all()

    return [
        AnomalyOut(
            id=a.id,
            ingredient_id=a.ingredient_id,
            ingredient_name=a.ingredient.name if a.ingredient else "Unknown",
            anomaly_type=a.anomaly_type,
            severity=a.severity,
            anomaly_score=a.anomaly_score,
            expected_consumption=a.expected_consumption,
            actual_consumption=a.actual_consumption,
            window_start=a.window_start,
            window_end=a.window_end,
            status=a.status,
            detected_at=a.detected_at
        )
        for a in anomalies
    ]

@router.get("/suggestions")
def get_event_suggestions(recent_days: int = Query(30, ge=1, le=90), db: Session = Depends(get_db)):
    """
    Automatic Mode: Analyzes detected spikes and returns suggested event configurations (e.g. Full Moon).
    """
    detector = StrangeHappeningsDetector(db)
    suggestions = detector.suggest_events_from_spikes(recent_days=recent_days)
    return suggestions

@router.post("/scan")
def trigger_sentinel_scan(db: Session = Depends(get_db)):
    """
    Executes a scan for Strange Happenings (spikes & unexplained stock loss) and synchronizes the DB.
    """
    detector = StrangeHappeningsDetector(db)
    detected = detector.scan_for_anomalies(lookback_days=365)
    new_count = 0

    for item in detected:
        existing = db.query(Anomaly).filter(Anomaly.id == item["id"]).first()
        if not existing:
            anomaly = Anomaly(
                id=item["id"],
                ingredient_id=item["ingredient_id"],
                anomaly_type=item["anomaly_type"],
                severity=item["severity"],
                anomaly_score=item["anomaly_score"],
                expected_consumption=item["expected_consumption"],
                actual_consumption=item["actual_consumption"],
                window_start=item["window_start"],
                window_end=item["window_end"],
                status=item["status"],
                detected_at=item["detected_at"]
            )
            db.add(anomaly)
            new_count += 1

    db.commit()
    return {
        "status": "scan_complete",
        "total_anomalies_detected": len(detected),
        "new_anomalies_recorded": new_count
    }

@router.post("/{id}/resolve", response_model=AnomalyOut)
def resolve_anomaly(id: str, resolve_in: AnomalyResolve, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == id).first()
    if not anomaly:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strange Happening incident '{id}' not found."
        )

    anomaly.status = resolve_in.status
    db.commit()
    db.refresh(anomaly)

    return AnomalyOut(
        id=anomaly.id,
        ingredient_id=anomaly.ingredient_id,
        ingredient_name=anomaly.ingredient.name if anomaly.ingredient else "Unknown",
        anomaly_type=anomaly.anomaly_type,
        severity=anomaly.severity,
        anomaly_score=anomaly.anomaly_score,
        expected_consumption=anomaly.expected_consumption,
        actual_consumption=anomaly.actual_consumption,
        window_start=anomaly.window_start,
        window_end=anomaly.window_end,
        status=anomaly.status,
        detected_at=anomaly.detected_at
    )
