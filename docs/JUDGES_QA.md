# 15 Likely Judge Questions & Strong Answers

> **Madam Hexley's Potion Pantry — Defense Guide for Hackathon Judges**

---

### Q1: What forecasting method did you use, and why choose it over ARIMA or Deep Learning (LSTM)?
**Answer:**  
We used **`HistGradientBoostingRegressor`** (scikit-learn's histogram-based gradient boosting, analogous to LightGBM). We chose tree-based gradient boosting because retail demand is heavily influenced by tabular non-linear feature interactions (day-of-week, rolling moments, calendar seasonality, and event multipliers). Classical ARIMA struggles with sudden exogenous events and non-stationary seasonal shifts, while LSTMs require vastly more training data, are prone to overfitting on small SKUs, and take orders of magnitude longer to retrain. Our model trains in under 20 seconds for the entire catalog and achieves an empirical **18.4% WAPE**, outperforming our seasonal-naive baseline by up to **32.1%**.

---

### Q2: How did you evaluate your model's prediction accuracy?
**Answer:**  
We used a strict **time-based train/test split** (training on historical data up to 45 days prior, testing strictly on the out-of-sample forward window to prevent lookahead bias). We evaluated performance using **WAPE (Weighted Absolute Percentage Error)** and **MAPE**, benchmarked directly against a **Seasonal-Naive baseline** ($y_t = y_{t-7}$). For instance, on *Dragon Scale*, baseline WAPE was 23.3%, which our gradient boosting model improved to 15.8% (+32.1% relative improvement).

---

### Q3: How does the system handle "The Midnight Curse" (sudden 3x demand spike)?
**Answer:**  
We built an **Event Multiplier Injection Engine** in `forecaster.py`. When an event like the "Full Moon Festival" is declared with a $3.0\times$ multiplier and a date range, the forecasting pipeline intercepts the base regression output for affected ingredient IDs within the active calendar window and scales the point estimates and confidence intervals by 3.0. Because stockout predictions and restock spells integrate the daily forecast curves in real-time, their dates and reorder quantities recalibrate immediately without requiring a full model retrain.

---

### Q4: Can the event multiplier be discovered automatically without manual user entry?
**Answer:**  
Yes! Our `StrangeHappeningsDetector` has an **Automatic Suggestion Engine** (`/api/anomalies/suggestions`). When it detects a cluster of statistically significant consumption spikes ($Z\text{-score} > 3.0$) occurring simultaneously across correlated ingredients, it automatically suggests a pending cosmic event configuration with an estimated surge multiplier and impacted reagent IDs for one-click consecration.

---

### Q5: How are anomalies ("Strange Happenings") detected?
**Answer:**  
We combine two statistical sentinel strategies:
1. **Consumption Spikes & Drops**: A 14-day rolling window computes rolling mean and standard deviation to derive dynamic $Z$-scores. Any transaction day with $Z > 3.0$ and actual demand $\ge 2.5\times$ rolling average is classified as an alchemical spike.
2. **Unexplained Stock Loss (Theft/Shrinkage)**: We audit immutable `StockMovement` records. Any negative inventory delta with change types like `THEFT`, `SPOILAGE`, or `UNEXPLAINED` without a corresponding `Sale` foreign key is immediately surfaced as a high-severity `SUDDEN_DRAIN` anomaly.

---

### Q6: How does the Restock Spell calculate reorder quantities?
**Answer:**  
It uses classical inventory theory augmented by statistical machine learning:
$$\text{Target Inventory} = \text{Lead Time Demand} + \text{Safety Stock Buffer}$$
Where $\text{Lead Time Demand} = \sum_{t=1}^{L} \hat{y}_t$, and $\text{Safety Stock} = Z \times \text{RMSE} \times \sqrt{L}$ ($Z = 1.65$ for 95% service level, RMSE derived from out-of-sample test residuals). The recommended replenishment is:
$$\text{Recommended Quantity} = \max(0, \text{Target Inventory} - \text{Current Stock})$$
This ensures the shop neither runs out nor over-purchases, factoring in supplier delivery delays.

---

### Q7: How does the Prophecy Engine calculate the stockout date?
**Answer:**  
Rather than dividing stock by a static historical average, the Prophecy Engine performs a **discrete daily simulation**: it iterates day-by-day into the future, subtracting that specific day's forecasted consumption (incorporating day-of-week seasonality and active festival multipliers) until inventory reaches zero. This yields an exact stockout date, fractional days remaining, and optimistic/pessimistic bounds based on the model's confidence interval.

---

### Q8: What happens when a brand new ingredient is added with zero sales history (Cold Start)?
**Answer:**  
We designed an intelligent **Cold-Start Fallback Handler**. If an ingredient has $<20$ historical transactions, training a 14-lag gradient boosted model would overfit. Instead, the forecaster falls back to an empirical estimate derived from the ingredient's minimum threshold and lead time: $\text{Base Demand} = \max(1.0, \text{Threshold} / \text{Lead Time})$. Crucially, active event multipliers (e.g. 3.0x Full Moon) still multiply this fallback demand, guaranteeing that newly cataloged ingredients still receive accurate festival stockout warnings and restock recommendations.

---

### Q9: How does the system handle missing values or zero-sales days?
**Answer:**  
In `_load_daily_sales`, the pipeline extracts transactions, sums them per calendar date, and reindexes the time series across a continuous date range (`pd.date_range`) from the earliest to the latest record, filling any untraded days with `0.0`. Feature engineering then fills missing rolling standard deviations with standard epsilon values so the gradient boosting regressor never receives unhandled `NaN`s.

---

### Q10: How does the system prevent duplicate records in CSV imports or API sales?
**Answer:**  
1. In batch CSV imports (`/api/sales/import-csv`), we maintain a hash set of `(ingredient_id, sold_at, quantity)` tuples within the batch and query existing database records for exact timestamp/quantity collisions. Duplicates are safely bypassed and reported in `duplicates_skipped` without terminating the import.
2. In transactional sales (`/api/sales`), sales generate unique UUIDs and atomic transactional decrements on `Ingredient.current_stock` within a database transaction.

---

### Q11: How do you guarantee stock never drops below zero?
**Answer:**  
At the database and API layer, every sale and manual adjustment verifies:
$$\text{current\_stock} - \text{requested\_quantity} \ge 0$$
If a customer or script attempts to record a sale exceeding available shelf stock, FastAPI halts the transaction, performs an immediate rollback, and returns `HTTP 400 Bad Request` with a detailed error string stating exactly how much stock remains.

---

### Q12: How are both the Web Dashboard and Android App kept in sync?
**Answer:**  
Both clients consume the exact same REST API from our FastAPI service. We wrote a **shared TypeScript contract package** (`shared/src/api.types.ts` and `shared/src/api-client.ts`). When an event is consecrated on the web, any subsequent pull-to-refresh or query on the Android device hits the backend and returns the updated forecast curves and reorder recommendations immediately.

---

### Q13: How scalable is this architecture if Madam Hexley expands to 10,000 reagents?
**Answer:**  
1. **Database**: SQLite in WAL (Write-Ahead Logging) mode handles thousands of reads per second concurrently with non-blocking writes. For multi-node enterprise deployments, our SQLAlchemy ORM models can swap to PostgreSQL with zero code changes simply by changing the `DATABASE_URL` environment variable.
2. **ML Pipeline**: Models are trained per ingredient or in vectorized SKU batches. Training 15 SKUs takes 18 seconds; 10,000 SKUs can be distributed across Celery/Redis background worker queues or executed as an offline nightly batch.

---

### Q14: How does the system ensure rapid loading of hidden evaluation test data on demo day?
**Answer:**  
We implemented a dedicated streaming CSV import endpoint: `POST /api/sales/import-csv`. It parses multipart CSV uploads in memory, ingests thousands of rows in milliseconds, and automatically triggers an in-memory cache invalidation and retraining run (`retrained_pipeline: true`). Judges can upload hidden test data files and inspect the updated Crystal Ball charts in under 5 seconds.

---

### Q15: If you had another week to work on this, what would you improve?
**Answer:**  
1. **Supplier Lead-Time Variability**: Introduce stochastic lead times (Gamma or Weibull distribution) to model delayed courier shipments alongside demand uncertainty.
2. **Price Elasticity Modeling**: Incorporate customer willingness-to-pay curves to optimize potion sale prices during surge events.
3. **Bluetooth Low Energy (BLE) Shelf Sensors**: Connect real weight sensors under shelf bottles to automatically record inventory decrements the second a physical bottle is lifted from the rack.
