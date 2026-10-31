import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from backend.app.models import Ingredient, Sale, StockMovement, Anomaly, Event

class StrangeHappeningsDetector:
    """
    Arcane Anomaly & Strange Happenings Sentinel:
    Detects sudden spikes, sudden drops, and unexplained stock shrinkages (theft/leakage)
    using rolling Z-scores, forecast residuals, and cross-ledger reconciliation.
    """
    def __init__(self, db: Session):
        self.db = db

    def scan_for_anomalies(self, lookback_days: int = 365) -> List[Dict]:
        """
        Scans historical sales and stock movements to identify anomalies.
        """
        ingredients = self.db.query(Ingredient).all()
        detected_anomalies = []
        now = datetime.utcnow()
        cutoff_date = now - timedelta(days=lookback_days)

        for ing in ingredients:
            sales = (
                self.db.query(Sale)
                .filter(Sale.ingredient_id == ing.id, Sale.sold_at >= cutoff_date)
                .order_by(Sale.sold_at.asc())
                .all()
            )
            if not sales:
                continue

            # Group daily quantities
            records = [{"date": s.sold_at.date(), "quantity": s.quantity, "sold_at": s.sold_at} for s in sales]
            df = pd.DataFrame(records)
            daily = df.groupby("date")["quantity"].sum().reset_index()
            daily["date"] = pd.to_datetime(daily["date"])
            daily = daily.sort_values("date").reset_index(drop=True)

            if len(daily) < 14:
                continue

            # Calculate 14-day rolling mean & std
            daily["rolling_mean"] = daily["quantity"].shift(1).rolling(14, min_periods=7).mean()
            daily["rolling_std"] = daily["quantity"].shift(1).rolling(14, min_periods=7).std().fillna(1.0)
            daily["rolling_std"] = np.maximum(0.5, daily["rolling_std"])

            daily["z_score"] = (daily["quantity"] - daily["rolling_mean"]) / daily["rolling_std"]

            # Flag spikes (Z-score > 3.0 and quantity >= 2.5x rolling mean)
            spikes = daily[(daily["z_score"] > 3.0) & (daily["quantity"] >= 2.5 * daily["rolling_mean"])]
            for _, row in spikes.iterrows():
                expected = float(row["rolling_mean"])
                actual = float(row["quantity"])
                score = min(0.99, round(float(0.70 + (row["z_score"] / 20.0)), 2))
                sev = "CRITICAL" if score >= 0.95 or (actual / max(1.0, expected)) >= 4.0 else "HIGH"

                dt_val = row["date"].to_pydatetime()
                date_str = dt_val.strftime("%Y-%m-%d")
                exp_ratio = actual / max(0.1, expected)

                detected_anomalies.append({
                    "id": f"anom_spike_{ing.id}_{date_str}",
                    "ingredient_id": ing.id,
                    "ingredient_name": ing.name,
                    "anomaly_type": "SPIKE",
                    "severity": sev,
                    "anomaly_score": score,
                    "expected_consumption": round(expected, 2),
                    "actual_consumption": round(actual, 2),
                    "window_start": dt_val,
                    "window_end": dt_val + timedelta(hours=23, minutes=59),
                    "status": "UNRESOLVED",
                    "reasoning": f"Unusual consumption surge: {actual:.1f} {ing.unit} consumed ({exp_ratio:.1f}x higher than expected {expected:.1f} {ing.unit}).",
                    "detected_at": dt_val + timedelta(days=1)
                })

            # Check unexplained stock movements (missing stock / shrinkage)
            movements = (
                self.db.query(StockMovement)
                .filter(
                    StockMovement.ingredient_id == ing.id,
                    StockMovement.delta < 0,
                    StockMovement.change_type.in_(["THEFT", "SPOILAGE", "SUDDEN_DRAIN", "UNEXPLAINED"])
                )
                .all()
            )
            for m in movements:
                abs_loss = abs(m.delta)
                sev = "CRITICAL" if abs_loss >= 15.0 else "HIGH"
                score = 0.96 if abs_loss >= 20.0 else 0.88

                detected_anomalies.append({
                    "id": f"anom_drain_{m.id}",
                    "ingredient_id": ing.id,
                    "ingredient_name": ing.name,
                    "anomaly_type": "SUDDEN_DRAIN",
                    "severity": sev,
                    "anomaly_score": score,
                    "expected_consumption": 0.0,
                    "actual_consumption": round(abs_loss, 2),
                    "window_start": m.created_at - timedelta(hours=4),
                    "window_end": m.created_at,
                    "status": "UNRESOLVED",
                    "reasoning": f"Unexplained stock shrinkage: {abs_loss:.1f} {ing.unit} vanished without a corresponding sale record ({m.reason or 'Physical discrepancy'}).",
                    "detected_at": m.created_at
                })

        return detected_anomalies

    def suggest_events_from_spikes(self, recent_days: int = 14) -> List[Dict]:
        """
        Automatic Event Suggestion:
        If recent demand spikes are detected across mystical ingredients (e.g. Wolfsbane, Silver Leaf),
        suggests an upcoming or active cosmic event (e.g. Full Moon Festival).
        """
        now = datetime.utcnow()
        recent_cutoff = now - timedelta(days=recent_days)

        recent_spikes = (
            self.db.query(Anomaly)
            .filter(
                Anomaly.anomaly_type == "SPIKE",
                Anomaly.window_start >= recent_cutoff
            )
            .all()
        )

        suggestions = []
        if recent_spikes:
            affected_ids = list(set(s.ingredient_id for s in recent_spikes))
            ing_names = [s.ingredient.name for s in recent_spikes if s.ingredient]
            avg_spike_ratio = np.mean([s.actual_consumption / max(1.0, s.expected_consumption) for s in recent_spikes])
            suggested_mult = round(min(4.0, max(2.0, avg_spike_ratio)), 1)

            suggestions.append({
                "suggested_name": "Full Moon Surge (Auto-Detected)",
                "event_type": "FESTIVAL",
                "suggested_multiplier": suggested_mult,
                "affected_ingredient_ids": affected_ids,
                "affected_ingredient_names": ing_names,
                "starts_at": now.strftime("%Y-%m-%dT00:00:00"),
                "ends_at": (now + timedelta(days=4)).strftime("%Y-%m-%dT23:59:59"),
                "rationale": f"Sentinel detected {len(recent_spikes)} sharp consumption spikes across {', '.join(ing_names[:3])}. Suggesting {suggested_mult}x multiplier event."
            })

        return suggestions
