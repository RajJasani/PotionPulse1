import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import HistGradientBoostingRegressor
from sqlalchemy.orm import Session
from backend.app.models import Ingredient, Sale, Event

class DemandForecaster:
    """
    Arcane Demand Forecaster using scikit-learn's HistGradientBoostingRegressor
    (LightGBM histogram-based gradient boosting) with lag, rolling, and calendar features.
    """
    _MODELS_CACHE: Dict[str, HistGradientBoostingRegressor] = {}
    _METRICS_CACHE: Dict[str, Dict[str, float]] = {}
    _RMSE_CACHE: Dict[str, float] = {}

    def __init__(self, db: Session):
        self.db = db
        self.models = DemandForecaster._MODELS_CACHE
        self.ingredient_metrics = DemandForecaster._METRICS_CACHE
        self.ingredient_rmse = DemandForecaster._RMSE_CACHE

    @classmethod
    def clear_cache(cls, ingredient_id: Optional[str] = None):
        """Invalidates ML models and metrics cache."""
        if ingredient_id:
            cls._MODELS_CACHE.pop(ingredient_id, None)
            cls._METRICS_CACHE.pop(ingredient_id, None)
            cls._RMSE_CACHE.pop(ingredient_id, None)
        else:
            cls._MODELS_CACHE.clear()
            cls._METRICS_CACHE.clear()
            cls._RMSE_CACHE.clear()

    def _load_daily_sales(self, ingredient_id: str) -> pd.DataFrame:
        """
        Loads all sales for an ingredient and aggregates to complete daily continuous time series.
        Robust to:
        - Missing sales / empty tables
        - Missing dates / zero-sales days (filled with 0.0)
        - Corrupted / negative values (sanitized)
        - Duplicate records (safely aggregated by date)
        """
        sales = (
            self.db.query(Sale)
            .filter(Sale.ingredient_id == ingredient_id)
            .order_by(Sale.sold_at.asc())
            .all()
        )
        if not sales:
            return pd.DataFrame(columns=["date", "quantity"])

        records = []
        for s in sales:
            if s.quantity is not None and s.sold_at is not None:
                records.append({
                    "date": s.sold_at.date(),
                    "quantity": max(0.0, float(s.quantity))
                })

        if not records:
            return pd.DataFrame(columns=["date", "quantity"])

        df = pd.DataFrame(records)
        df_daily = df.groupby("date")["quantity"].sum().reset_index()
        df_daily["date"] = pd.to_datetime(df_daily["date"])
        df_daily = df_daily.sort_values("date").reset_index(drop=True)

        # Fill potential missing days with 0 demand
        min_date = df_daily["date"].min()
        max_date = df_daily["date"].max()
        idx = pd.date_range(min_date, max_date, freq="D")
        df_daily = df_daily.set_index("date").reindex(idx, fill_value=0.0).rename_axis("date").reset_index()
        return df_daily

    def _build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Feature engineering:
        - Lags: 1, 2, 3, 7, 14
        - Rolling means: 7-day, 14-day, 28-day
        - Calendar: day of week, is_weekend, month, day_of_month
        """
        data = df.copy()
        for lag in [1, 2, 3, 7, 14]:
            data[f"lag_{lag}"] = data["quantity"].shift(lag)

        data["roll_mean_7"] = data["quantity"].shift(1).rolling(7, min_periods=1).mean()
        data["roll_std_7"] = data["quantity"].shift(1).rolling(7, min_periods=1).std().fillna(0.0)
        data["roll_mean_14"] = data["quantity"].shift(1).rolling(14, min_periods=1).mean()
        data["roll_mean_28"] = data["quantity"].shift(1).rolling(28, min_periods=1).mean()

        data["day_of_week"] = data["date"].dt.dayofweek
        data["is_weekend"] = data["day_of_week"].isin([4, 5, 6]).astype(int)
        data["month"] = data["date"].dt.month
        data["day_of_month"] = data["date"].dt.day
        data["is_halloween_season"] = ((data["month"] == 10) & (data["day_of_month"] >= 15)).astype(int)

        # Baseline: Seasonal Naive (demand exactly 7 days ago)
        data["baseline_seasonal_naive"] = data["lag_7"].fillna(data["lag_1"]).fillna(data["quantity"].mean())

        # Drop rows where lag features are NaN (first 14 days)
        data = data.dropna().reset_index(drop=True)
        return data

    def train_and_evaluate(self, test_days: int = 45) -> Dict[str, Dict[str, float]]:
        """
        Trains model per ingredient with a time-based train/test split.
        Compares ML model against Seasonal-Naive baseline using MAPE & WAPE.
        """
        ingredients = self.db.query(Ingredient).all()
        feature_cols = [
            "lag_1", "lag_2", "lag_3", "lag_7", "lag_14",
            "roll_mean_7", "roll_std_7", "roll_mean_14", "roll_mean_28",
            "day_of_week", "is_weekend", "month", "day_of_month", "is_halloween_season"
        ]

        summary_metrics = {}

        for ing in ingredients:
            df = self._load_daily_sales(ing.id)
            if len(df) < 30:
                continue

            featured_df = self._build_features(df)
            if len(featured_df) <= test_days:
                continue

            # Time-based split: Train on past, evaluate on most recent test_days
            train_df = featured_df.iloc[:-test_days]
            test_df = featured_df.iloc[-test_days:]

            X_train = train_df[feature_cols]
            y_train = train_df["quantity"]
            X_test = test_df[feature_cols]
            y_test = test_df["quantity"]
            y_baseline = test_df["baseline_seasonal_naive"]

            # Train HistGradientBoostingRegressor
            model = HistGradientBoostingRegressor(
                max_iter=150,
                learning_rate=0.08,
                max_leaf_nodes=31,
                min_samples_leaf=5,
                random_state=42
            )
            model.fit(X_train, y_train)

            preds = np.maximum(0.1, model.predict(X_test))

            # Metrics
            total_actual = float(np.sum(y_test))
            wape_model = float(np.sum(np.abs(y_test - preds)) / max(1.0, total_actual))
            wape_baseline = float(np.sum(np.abs(y_test - y_baseline)) / max(1.0, total_actual))

            mape_model = float(np.mean(np.abs(y_test - preds) / np.maximum(1.0, y_test))) * 100.0
            mape_baseline = float(np.mean(np.abs(y_test - y_baseline) / np.maximum(1.0, y_test))) * 100.0

            residuals = y_test - preds
            rmse = float(np.sqrt(np.mean(residuals ** 2)))

            DemandForecaster._MODELS_CACHE[ing.id] = model
            DemandForecaster._RMSE_CACHE[ing.id] = rmse
            metrics = {
                "wape_model": round(wape_model, 4),
                "wape_baseline": round(wape_baseline, 4),
                "mape_model": round(mape_model, 2),
                "mape_baseline": round(mape_baseline, 2),
                "rmse": round(rmse, 2),
                "improvement_pct": round(max(0.0, (wape_baseline - wape_model) / max(0.01, wape_baseline)) * 100.0, 1)
            }
            DemandForecaster._METRICS_CACHE[ing.id] = metrics
            summary_metrics[ing.id] = metrics

        return summary_metrics

    def train_ingredient(self, ingredient_id: str, test_days: int = 45) -> Optional[Dict[str, float]]:
        """Trains or refreshes the model for a specific ingredient."""
        df = self._load_daily_sales(ingredient_id)
        if len(df) < 20:
            return None

        featured_df = self._build_features(df)
        if len(featured_df) <= 14:
            return None

        feature_cols = [
            "lag_1", "lag_2", "lag_3", "lag_7", "lag_14",
            "roll_mean_7", "roll_std_7", "roll_mean_14", "roll_mean_28",
            "day_of_week", "is_weekend", "month", "day_of_month", "is_halloween_season"
        ]

        split_idx = max(len(featured_df) - test_days, int(len(featured_df) * 0.75))
        train_df = featured_df.iloc[:split_idx]
        test_df = featured_df.iloc[split_idx:]

        X_train = train_df[feature_cols]
        y_train = train_df["quantity"]
        X_test = test_df[feature_cols]
        y_test = test_df["quantity"]
        y_baseline = test_df["baseline_seasonal_naive"]

        model = HistGradientBoostingRegressor(
            max_iter=120,
            learning_rate=0.08,
            max_leaf_nodes=31,
            min_samples_leaf=5,
            random_state=42
        )
        model.fit(X_train, y_train)

        preds = np.maximum(0.1, model.predict(X_test))
        total_actual = float(np.sum(y_test))
        wape_model = float(np.sum(np.abs(y_test - preds)) / max(1.0, total_actual))
        wape_baseline = float(np.sum(np.abs(y_test - y_baseline)) / max(1.0, total_actual))
        mape_model = float(np.mean(np.abs(y_test - preds) / np.maximum(1.0, y_test))) * 100.0
        mape_baseline = float(np.mean(np.abs(y_test - y_baseline) / np.maximum(1.0, y_test))) * 100.0
        rmse = float(np.sqrt(np.mean((y_test - preds) ** 2)))

        DemandForecaster._MODELS_CACHE[ingredient_id] = model
        DemandForecaster._RMSE_CACHE[ingredient_id] = rmse
        metrics = {
            "wape_model": round(wape_model, 4),
            "wape_baseline": round(wape_baseline, 4),
            "mape_model": round(mape_model, 2),
            "mape_baseline": round(mape_baseline, 2),
            "rmse": round(rmse, 2),
            "improvement_pct": round(max(0.0, (wape_baseline - wape_model) / max(0.01, wape_baseline)) * 100.0, 1)
        }
        DemandForecaster._METRICS_CACHE[ingredient_id] = metrics
        return metrics

    def predict_future_demand(self, ingredient_id: str, horizon_days: int = 14) -> List[Dict]:
        """
        Predicts future demand for the next `horizon_days` days,
        applying any active Event multipliers (Full Moon Festival / Midnight Curse).
        """
        if ingredient_id not in DemandForecaster._MODELS_CACHE:
            self.train_ingredient(ingredient_id)

        model = DemandForecaster._MODELS_CACHE.get(ingredient_id)
        df = self._load_daily_sales(ingredient_id)
        if df.empty or model is None:
            # Fallback simple projection if insufficient data
            return self._fallback_projection(ingredient_id, horizon_days)

        featured_df = self._build_features(df)
        last_row = featured_df.iloc[-1].copy()
        recent_quantities = df["quantity"].tolist()

        rmse = self.ingredient_rmse.get(ingredient_id, 1.2)

        # Fetch active events
        now = datetime.utcnow()
        future_limit = now + timedelta(days=horizon_days + 1)
        active_events = (
            self.db.query(Event)
            .filter(Event.is_active == True, Event.ends_at >= now, Event.starts_at <= future_limit)
            .all()
        )

        forecasts = []
        last_date = df["date"].max()

        for step in range(1, horizon_days + 1):
            next_date = last_date + timedelta(days=step)
            dow = next_date.dayofweek
            is_wknd = 1 if dow in [4, 5, 6] else 0

            # Construct feature row dynamically
            features = {
                "lag_1": recent_quantities[-1] if len(recent_quantities) >= 1 else 3.0,
                "lag_2": recent_quantities[-2] if len(recent_quantities) >= 2 else 3.0,
                "lag_3": recent_quantities[-3] if len(recent_quantities) >= 3 else 3.0,
                "lag_7": recent_quantities[-7] if len(recent_quantities) >= 7 else 3.0,
                "lag_14": recent_quantities[-14] if len(recent_quantities) >= 14 else 3.0,
                "roll_mean_7": float(np.mean(recent_quantities[-7:])),
                "roll_std_7": float(np.std(recent_quantities[-7:])) if len(recent_quantities) >= 7 else 0.5,
                "roll_mean_14": float(np.mean(recent_quantities[-14:])),
                "roll_mean_28": float(np.mean(recent_quantities[-28:])),
                "day_of_week": dow,
                "is_weekend": is_wknd,
                "month": next_date.month,
                "day_of_month": next_date.day,
                "is_halloween_season": 1 if (next_date.month == 10 and next_date.day >= 15) else 0
            }
            feat_df = pd.DataFrame([features])
            base_pred = float(model.predict(feat_df)[0])
            base_pred = max(0.2, base_pred)

            # Check Event Multiplier (Midnight Curse)
            multiplier = 1.0
            event_name = None
            for ev in active_events:
                try:
                    affected = json.loads(ev.affected_ingredient_ids)
                except Exception:
                    affected = []
                if ingredient_id in affected and ev.starts_at.date() <= next_date.date() <= ev.ends_at.date():
                    if ev.multiplier > multiplier:
                        multiplier = ev.multiplier
                        event_name = ev.name

            final_pred = round(base_pred * multiplier, 2)
            lower_bound = max(0.0, round(final_pred - (1.65 * rmse), 2))
            upper_bound = round(final_pred + (1.65 * rmse), 2)

            forecasts.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_demand": final_pred,
                "lower_bound": lower_bound,
                "upper_bound": upper_bound,
                "event_multiplier": multiplier,
                "applied_event_name": event_name
            })

            # Append prediction to simulate multi-step lag
            recent_quantities.append(final_pred)

        return forecasts

    def _fallback_projection(self, ingredient_id: str, horizon_days: int) -> List[Dict]:
        """
        Cold-start and low-history fallback:
        - If ingredient has a few sales, uses their average daily rate.
        - If brand new (0 sales), bases projection on minimum_threshold/lead_time or standard default (3.5).
        - Correctly checks active events (Full Moon / Midnight Curse) and multiplies demand!
        - Provides realistic lower/upper bounds.
        """
        ing = self.db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
        base_demand = 3.5
        if ing:
            if ing.minimum_threshold > 0:
                base_demand = max(1.0, round(ing.minimum_threshold / max(1, ing.lead_time_days), 2))
            
            # If there are any sales at all, use their empirical mean
            partial_sales = self.db.query(Sale).filter(Sale.ingredient_id == ingredient_id).all()
            if partial_sales:
                sum_qty = sum(s.quantity for s in partial_sales if s.quantity > 0)
                if sum_qty > 0:
                    base_demand = max(0.5, round(sum_qty / max(1, len(partial_sales)), 2))

        now = datetime.utcnow()
        future_limit = now + timedelta(days=horizon_days + 1)
        active_events = (
            self.db.query(Event)
            .filter(Event.is_active == True, Event.ends_at >= now, Event.starts_at <= future_limit)
            .all()
        )

        forecasts = []
        for i in range(1, horizon_days + 1):
            next_date = now + timedelta(days=i)
            multiplier = 1.0
            event_name = None
            for ev in active_events:
                try:
                    affected = json.loads(ev.affected_ingredient_ids)
                except Exception:
                    affected = []
                if ingredient_id in affected and ev.starts_at.date() <= next_date.date() <= ev.ends_at.date():
                    if ev.multiplier > multiplier:
                        multiplier = ev.multiplier
                        event_name = ev.name

            projected = round(base_demand * multiplier, 2)
            lower = max(0.0, round(projected * 0.7, 2))
            upper = round(projected * 1.35, 2)

            forecasts.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_demand": projected,
                "lower_bound": lower,
                "upper_bound": upper,
                "event_multiplier": multiplier,
                "applied_event_name": event_name
            })
        return forecasts
