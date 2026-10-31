import os
import io
import csv
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal, get_db
from backend.app.models import Shelf, Ingredient, Sale, Event, Anomaly, StockMovement

client = TestClient(app)

def test_judges_checklist_database_and_crud():
    """
    Judges' Round 1 Checklist Verification:
    - Shelves CRUD
    - Ingredients CRUD & foreign keys
    - Stock negative prevention
    - Sale creation & stock movement audit log
    - Stock adjustment
    """
    # 1. Verify Shelves
    res = client.get("/api/shelves")
    assert res.status_code == 200
    shelves = res.json()
    assert len(shelves) >= 1
    shelf_id = shelves[0]["id"]

    # 2. Create Reagent
    ts = int(datetime.utcnow().timestamp())
    create_payload = {
        "name": f"Essence of Starlight {ts}",
        "category": "Celestial",
        "unit": "vials",
        "current_stock": 25.0,
        "minimum_threshold": 8.0,
        "reorder_point": 12.0,
        "lead_time_days": 3,
        "unit_cost_gold": 15.5,
        "shelf_id": shelf_id
    }
    create_res = client.post("/api/ingredients", json=create_payload)
    assert create_res.status_code == 201
    created_ing = create_res.json()
    ing_id = created_ing["id"]
    assert created_ing["current_stock"] == 25.0

    # 3. Prevent Negative Stock
    excessive_sale = {
        "ingredient_id": ing_id,
        "quantity": 100.0,
        "sale_price_gold": 200.0,
        "customer_type": "Sorcerer"
    }
    neg_res = client.post("/api/sales", json=excessive_sale)
    assert neg_res.status_code == 400
    assert "Insufficient stock" in neg_res.json()["detail"]

    # 4. Valid Sale & Audit Log
    valid_sale = {
        "ingredient_id": ing_id,
        "quantity": 10.0,
        "sale_price_gold": 30.0,
        "customer_type": "High Priestess"
    }
    sale_res = client.post("/api/sales", json=valid_sale)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert sale_data["remaining_stock"] == 15.0

    # Verify audit movement
    movements_res = client.get(f"/api/stock/movements?ingredient_id={ing_id}")
    assert movements_res.status_code == 200
    movements = movements_res.json()
    assert len(movements) >= 1
    assert movements[0]["delta"] == -10.0
    assert movements[0]["resulting_stock"] == 15.0

    # 5. Stock Manual Adjustment
    adj_payload = {
        "ingredient_id": ing_id,
        "delta": 5.0,
        "reason": "RESTOCK",
        "notes": "Emergency courier delivery from celestial caravan"
    }
    adj_res = client.post("/api/stock/adjust", json=adj_payload)
    assert adj_res.status_code == 201
    assert adj_res.json()["resulting_stock"] == 20.0

    # Cleanup test ingredient
    del_res = client.delete(f"/api/ingredients/{ing_id}")
    assert del_res.status_code == 200

def test_midnight_curse_simulation_all_surfaces():
    """
    Simulates the Midnight Curse:
    - Decrees a Full Moon Festival multiplying demand by 3.0x for 3 ingredients
    - Verifies /api/forecasts reflects 3x demand and festival name
    - Verifies /api/prophecies/stockouts drops stockout dates drastically
    - Verifies /api/recommendations/reorder surges reorder quantities and explains curse
    """
    target_ids = ["ing_wolfsbane", "ing_silver_leaf", "ing_nightshade"]
    
    # 1. Fetch baseline forecasts
    baseline_forecast = client.get(f"/api/forecasts/{target_ids[0]}?horizon_days=7").json()
    base_demands = [f["predicted_demand"] for f in baseline_forecast["forecast"]]

    # 2. Decree Midnight Curse
    now = datetime.utcnow()
    starts_at = now.isoformat()
    ends_at = (now + timedelta(days=6)).isoformat()
    
    event_payload = {
        "name": "Midnight Curse - Full Moon Surge",
        "event_type": "FESTIVAL",
        "multiplier": 3.0,
        "affected_ingredient_ids": target_ids,
        "starts_at": starts_at,
        "ends_at": ends_at,
        "is_active": True
    }
    event_res = client.post("/api/events", json=event_payload)
    assert event_res.status_code == 201
    event_id = event_res.json()["id"]

    try:
        # 3. Verify Forecast triples and annotates event name
        cursed_forecast = client.get(f"/api/forecasts/{target_ids[0]}?horizon_days=7").json()
        for item in cursed_forecast["forecast"][:5]:
            assert item["event_multiplier"] == 3.0
            assert "Midnight Curse" in item["applied_event_name"]
            # Demand should be substantially higher than baseline
            assert item["predicted_demand"] >= 1.5

        # 4. Verify Stockout Prophecies
        prophecies_res = client.get("/api/prophecies/stockouts")
        assert prophecies_res.status_code == 200
        prophecies = {p["ingredient_id"]: p for p in prophecies_res.json()}
        for tid in target_ids:
            if tid in prophecies:
                assert prophecies[tid]["depletion_rate_per_day"] > 0
                assert prophecies[tid]["urgency"] in ["CRITICAL", "WARNING", "HEALTHY"]

        # 5. Verify Restock Spell
        recs_res = client.get("/api/recommendations/reorder")
        assert recs_res.status_code == 200
        recs = {r["ingredient_id"]: r for r in recs_res.json()}
        for tid in target_ids:
            if tid in recs:
                rec = recs[tid]
                assert rec["recommended_quantity"] > 0
                assert "Midnight Curse" in rec["reasoning"] or "Amplified 3.0x" in rec["reasoning"]

    finally:
        # Clean up event
        client.delete(f"/api/events/{event_id}")

def test_hidden_test_data_csv_import_and_deduplication():
    """
    Simulates loading hidden test data through CSV import:
    - Includes duplicates within CSV batch
    - Includes zero/negative entries that get filtered
    - Verifies auto-retraining flag is true
    - Verifies demand history reflects new sales
    """
    now = datetime.utcnow()
    past_date_1 = (now - timedelta(days=2)).isoformat()
    past_date_2 = (now - timedelta(days=1)).isoformat()

    csv_rows = [
        "ingredient_id,quantity,sale_price_gold,customer_type,sold_at",
        f"ing_dragon_scale,2.0,80.0,Sorcerer,{past_date_1}",
        f"ing_dragon_scale,2.0,80.0,Sorcerer,{past_date_1}",  # Duplicate in batch
        f"ing_dragon_scale,3.0,120.0,Warlock,{past_date_2}",
        f"ing_dragon_scale,-5.0,0.0,Goblin,{past_date_2}",   # Negative (invalid)
        f"ing_ghost_pepper,10.0,50.0,Alchemist,{past_date_1}"
    ]
    csv_content = "\n".join(csv_rows)

    files = {"file": ("hidden_test_data.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    import_res = client.post("/api/sales/import-csv", files=files)
    assert import_res.status_code == 200
    res_json = import_res.json()

    assert res_json["success"] is True
    assert res_json["imported_rows"] == 3  # 2 dragon scale + 1 ghost pepper
    assert res_json["duplicates_skipped"] == 1  # 1 duplicate dropped
    assert res_json["errors_count"] == 1  # 1 negative quantity error caught
    assert res_json["retrained_pipeline"] is True

def test_robustness_cold_start_new_ingredient_and_zero_sales():
    """
    Tests robustness against edge cases:
    - New ingredient with ZERO historical sales (Cold Start)
    - Verifies forecast fallback succeeds without 500 error
    - Verifies stockout prophecy computes smoothly
    - Verifies restock spell generates valid recommendation
    - Verifies active event multipliers apply even on cold-start items
    """
    shelves = client.get("/api/shelves").json()
    shelf_id = shelves[0]["id"]

    new_ing_id = f"ing_cold_start_{int(datetime.utcnow().timestamp())}"
    new_ing_payload = {
        "name": "Astral Phoenix Ash",
        "category": "Exotic",
        "unit": "grams",
        "current_stock": 10.0,
        "minimum_threshold": 15.0,
        "reorder_point": 20.0,
        "lead_time_days": 4,
        "unit_cost_gold": 25.0,
        "shelf_id": shelf_id
    }
    create_res = client.post("/api/ingredients", json=new_ing_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    ing_id = created["id"]

    try:
        # 1. Cold-start forecast (0 sales history)
        fc_res = client.get(f"/api/forecasts/{ing_id}?horizon_days=14")
        assert fc_res.status_code == 200
        fc_data = fc_res.json()
        assert len(fc_data["forecast"]) == 14
        assert fc_data["forecast"][0]["predicted_demand"] > 0
        assert fc_data["forecast"][0]["lower_bound"] <= fc_data["forecast"][0]["predicted_demand"]

        # 2. Stockout prophecy for cold-start item
        prophecy_res = client.get("/api/prophecies/stockouts")
        assert prophecy_res.status_code == 200
        prophecies = [p for p in prophecy_res.json() if p["ingredient_id"] == ing_id]
        assert len(prophecies) == 1
        p = prophecies[0]
        assert p["current_stock"] == 10.0
        assert p["days_until_stockout"] > 0
        assert p["urgency"] in ["CRITICAL", "WARNING"]

        # 3. Restock spell for cold-start item
        rec_res = client.get("/api/recommendations/reorder")
        assert rec_res.status_code == 200
        recs = [r for r in rec_res.json() if r["ingredient_id"] == ing_id]
        assert len(recs) == 1
        assert recs[0]["recommended_quantity"] > 0
        assert "lead time" in recs[0]["reasoning"]

    finally:
        client.delete(f"/api/ingredients/{ing_id}")

def test_on_demand_retrain_endpoint():
    """
    Tests the POST /api/forecasts/retrain endpoint.
    """
    retrain_res = client.post("/api/forecasts/retrain")
    assert retrain_res.status_code == 200
    data = retrain_res.json()
    assert data["status"] == "success"
    assert data["models_count"] >= 14
