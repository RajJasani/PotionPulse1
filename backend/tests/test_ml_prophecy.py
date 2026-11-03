import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models import Event, Ingredient
from backend.app.ml.forecaster import DemandForecaster
from backend.app.ml.prophecy import ProphecyEngine
from backend.app.ml.restock import RestockSpellEngine
from backend.app.ml.anomaly_detector import StrangeHappeningsDetector

client = TestClient(app)

def test_ml_forecaster_evaluation_and_bounds():
    db = SessionLocal()
    forecaster = DemandForecaster(db)
    metrics = forecaster.train_and_evaluate(test_days=45)
    db.close()

    assert len(metrics) >= 10
    # Verify bounds on Wolfsbane forecast
    res = client.get("/api/forecasts/ing_wolfsbane?horizon_days=14")
    assert res.status_code == 200
    data = res.json()
    assert len(data["forecast"]) == 14
    for item in data["forecast"]:
        assert item["predicted_demand"] > 0
        assert item["upper_bound"] >= item["predicted_demand"]
        assert item["lower_bound"] <= item["predicted_demand"]

def test_stockout_prophecies_urgency_ordering():
    res = client.get("/api/prophecies/stockouts")
    assert res.status_code == 200
    prophecies = res.json()
    assert len(prophecies) >= 15

    # Bat wings is stocked out (0 stock)
    bat_wings = next(p for p in prophecies if p["ingredient_id"] == "ing_bat_wings")
    assert bat_wings["is_stocked_out"] is True
    assert bat_wings["days_until_stockout"] == 0.0

    # Ensure prophecies are ordered by urgency (stocked out and critical at the front)
    assert prophecies[0]["urgency"] == "CRITICAL"

def test_restock_spell_recommendations():
    res = client.get("/api/recommendations/reorder")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) > 0

    for r in recs:
        assert r["recommended_quantity"] > 0
        assert r["estimated_cost_gold"] > 0
        assert len(r["reasoning"]) > 10
        assert "lead time" in r["reasoning"].lower()

def test_anomaly_sentinel_catches_spikes_and_theft():
    res = client.get("/api/anomalies")
    assert res.status_code == 200
    anomalies = res.json()
    types = [a["anomaly_type"] for a in anomalies]
    assert "SPIKE" in types
    assert "SUDDEN_DRAIN" in types

    # Dragon scale theft
    drain = next(a for a in anomalies if a["ingredient_id"] == "ing_dragon_scale" and a["anomaly_type"] == "SUDDEN_DRAIN")
    assert drain["anomaly_type"] == "SUDDEN_DRAIN"
    assert drain["severity"] == "CRITICAL"

def test_midnight_curse_3x_event_changes_recommendations_and_stockouts():
    """
    NON-NEGOTIABLE REQUIREMENT:
    Proves that activating a 3x Full Moon Festival event modifies future forecasts,
    increases recommended reorder quantities, and accelerates the projected stockout date!
    """
    target_ing = "ing_moonpetal"

    # 1. Measure baseline recommendations and prophecies without event
    res_base_prophecy = client.get("/api/prophecies/stockouts")
    base_prophecy = next(p for p in res_base_prophecy.json() if p["ingredient_id"] == target_ing)
    base_days_left = base_prophecy["days_until_stockout"]

    # 2. Add a 3.0x Full Moon event for Moonpetal starting today
    now = datetime.utcnow()
    event_payload = {
        "name": "Full Moon Lunar Surge Test",
        "event_type": "FESTIVAL",
        "multiplier": 3.0,
        "affected_ingredient_ids": [target_ing],
        "starts_at": now.isoformat(),
        "ends_at": (now + timedelta(days=7)).isoformat(),
        "is_active": True
    }
    event_res = client.post("/api/events", json=event_payload)
    assert event_res.status_code == 201
    created_event_id = event_res.json()["id"]

    try:
        # 3. Check modified forecast: event_multiplier should now be 3.0
        res_fcst = client.get(f"/api/forecasts/{target_ing}?horizon_days=7")
        assert res_fcst.status_code == 200
        multipliers = [f["event_multiplier"] for f in res_fcst.json()["forecast"]]
        assert 3.0 in multipliers

        # 4. Check modified prophecy: projected days until stockout should significantly decrease
        res_new_prophecy = client.get("/api/prophecies/stockouts")
        new_prophecy = next(p for p in res_new_prophecy.json() if p["ingredient_id"] == target_ing)
        new_days_left = new_prophecy["days_until_stockout"]

        # 3x demand must cause stockout to happen much sooner
        assert new_days_left < base_days_left, (
            f"Expected days until stockout to decrease from {base_days_left} under 3x event, but got {new_days_left}"
        )

        # 5. Check restock recommendations under 3x demand
        res_recs = client.get("/api/recommendations/reorder")
        moonpetal_rec = next((r for r in res_recs.json() if r["ingredient_id"] == target_ing), None)
        assert moonpetal_rec is not None
        assert "3.0x" in moonpetal_rec["reasoning"] or "Full Moon" in moonpetal_rec["reasoning"]

    finally:
        # Clean up test event so DB remains clean
        db = SessionLocal()
        ev = db.query(Event).filter(Event.id == created_event_id).first()
        if ev:
            db.delete(ev)
            db.commit()
        db.close()
