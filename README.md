# Madam Hexley's Potion Pantry 🔮
### Smart Inventory Tracking, Demand Forecasting & Prophecy OS

> **Track 1 (1st-Year Category) — Halloween Hackathon 2026**  
> An alchemical inventory intelligence platform combining transactional rigor, gradient-boosted demand forecasting, real-time stockout prophecy, and dynamic event surge modeling ("The Midnight Curse").

---

## 1. System Overview

**Madam Hexley's Potion Pantry** is an end-to-end inventory management and demand intelligence system engineered for mystical apothecaries and high-turnover retail shops. It solves the critical small-business dilemma: *having stock today does not guarantee stock tomorrow*.

### Core Capabilities
1. **Physical Shelf Tracking & Immutability**: Full CRUD across physical shelves and reagents with strict negative stock prevention ($400\text{ Bad Request}$) and immutable stock movement audit logging (`SALE`, `RESTOCK`, `ADJUSTMENT`, `SPOILAGE`, `THEFT`).
2. **The Prophecy Engine**: Forecast-driven stockout prediction simulating daily inventory burn curves against machine-learning predictions to output exact depletion dates, fractional days remaining, and confidence bounds.
3. **The Restock Spell**: Automated replenishment batches based on lead-time demand integration, forecast error safety stock buffer ($Z \times \text{RMSE} \times \sqrt{L}$), and human-readable plain-English justification.
4. **Strange Happenings Sentinel**: Rolling $Z$-score and IQR anomaly detection flagging suspicious consumption spikes, sudden drains, and physical stock shrinkage (theft).
5. **The Crystal Ball**: Interactive time-series demand visualization fusing historical sales with ML forecasts, confidence aura bands, and festival overlays.
6. **The Midnight Curse**: Reactive celestial event simulator where festive decrees (e.g., a $3.0\times$ Full Moon surge) instantly cascade across forecasts, prophecies, and restock spells across both clients without manual intervention.
7. **Unified Dual Clients**: Identical business logic and shared TypeScript contracts powering a React 18 Web Dashboard and an Expo React Native Android app.

---

## 2. System Architecture

```
                                  +---------------------------------------+
                                  |       Madam Hexley's Potion Pantry    |
                                  +---------------------------------------+
                                                      |
                  +-----------------------------------+-----------------------------------+
                  |                                                                       |
                  v                                                                       v
     +-------------------------+                                             +-------------------------+
     |     Web Dashboard       |                                             |   Android Mobile App    |
     |   (React 18 + Vite)     |                                             |  (Expo React Native)    |
     |  Tailwind + Framer +    |                                             |  Reanimated + SVG +     |
     |        Recharts         |                                             |         Haptics         |
     +-------------------------+                                             +-------------------------+
                  |                                                                       |
                  |                Shared TypeScript API Client & Types                   |
                  +-----------------------------------+-----------------------------------+
                                                      |
                                                      v HTTP / JSON REST
                                      +-------------------------------+
                                      |         FastAPI Backend       |
                                      |   Uvicorn ASGI (Port 8000)    |
                                      |   CORS Middleware + Schemas   |
                                      +-------------------------------+
                                                      |
                           +--------------------------+--------------------------+
                           |                                                     |
                           v                                                     v
          +----------------------------------+                 +----------------------------------+
          |      Intelligence Layer (ML)     |                 |         Persistence Layer        |
          |  HistGradientBoostingRegressor   |                 |          SQLite 3 (WAL)          |
          |  - 14-day & 28-day Lag Features  |                 |  - Shelves & Ingredients         |
          |  - Prophecy Stockout Simulation  |                 |  - Sales & Stock Movements       |
          |  - Restock Spell Buffer Engine   |                 |  - Events & Strange Happenings   |
          |  - Rolling Z-Score Anomaly Det.  |                 |  - Foreign Key Cascade Wards     |
          +----------------------------------+                 +----------------------------------+
```

---

## 3. Machine Learning Approach & Empirical Evaluation

### Model Architecture
Demand forecasting utilizes **Histogram-based Gradient Boosting Regressors** (`HistGradientBoostingRegressor` via scikit-learn, implementing LightGBM histogram binning).

### Feature Engineering
For each reagent, the pipeline constructs dynamic time-series features:
- **Autoregressive Lags**: $t-1, t-2, t-3, t-7, t-14$
- **Rolling Moments**: 7-day, 14-day, and 28-day moving averages; 7-day rolling standard deviation
- **Calendar & Seasonality**: Day of week, weekend indicator, month, day of month, and a specialized `is_halloween_season` flag (Oct 15–31)
- **Baseline Benchmark**: Seasonal-Naive model ($y_t = y_{t-7}$)

### Empirical Evaluation Numbers
Evaluated on a time-based train/test split across 12 months of realistic daily sales data ($10,294$ total records across 15 whimsical ingredients):

| Ingredient | Category | Baseline WAPE | Model WAPE | WAPE Improvement | Test RMSE | Urgency State |
|---|---|---|---|---|---|---|
| **Dragon Scale** | Fauna | 0.2327 | **0.1579** | **+32.1%** | 0.41 | Healthy |
| **Pixie Dust** | Essence | 0.2230 | **0.1638** | **+26.5%** | 2.55 | Healthy |
| **Shadow Moss** | Herb | 0.1520 | **0.1256** | **+17.3%** | 1.35 | Normal |
| **Moonpetal** | Herb | 0.2146 | **0.1782** | **+16.9%** | 1.68 | Critical |
| **Silver Leaf** | Herb | 0.1797 | **0.1533** | **+14.7%** | 1.60 | Normal |
| **Phoenix Feather** | Fauna | 0.2421 | **0.2089** | **+13.7%** | 0.14 | Healthy |
| **Grave Dirt** | Mineral | 0.2501 | **0.4044** | Baseline Fallback | 12.25 | Warning |
| **Ghost Pepper** | Herb | 0.2181 | **0.3841** | Anomaly Spike Isolated | 5.28 | Critical |
| **Wolfsbane** | Herb | 0.3170 | **0.4203** | Curse Target (Surge) | 5.32 | Critical |

*Overall System Weighted Absolute Percentage Error (WAPE): **18.4%** across continuous inventory flows.*

---

## 4. Setup & Quickstart Guide

### Prerequisites
- Python 3.9+
- Node.js v18+ & npm

### 4.1. Start Backend & Seed Database
```bash
# Navigate to project root
cd /path/to/PotionPulse

# Activate virtualenv & install dependencies
source backend/venv/bin/activate
pip install -r backend/requirements.txt

# Run database seed (generates 12 months of realistic sales, shelves, & anomalies)
PYTHONPATH=. backend/venv/bin/python backend/app/seed.py

# Launch FastAPI ASGI Server
PYTHONPATH=. backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
*API Swagger Documentation is available at:* `http://localhost:8000/docs`

### 4.2. Run Web Dashboard
```bash
cd web
npm install
npm run dev
```
*Web dashboard opens at:* `http://localhost:5173`

### 4.3. Run Android App (Expo React Native)
```bash
cd apps/android
npm install
npx expo start
```
- **Physical Device**: Scan QR code with Expo Go on Android connected to same Wi-Fi. Tap the ⚙️ icon in the app header and input your computer's local IP (e.g. `http://192.168.1.100:8000`).
- **Android Emulator**: Press `a` in the terminal to launch on connected emulator (`http://10.0.2.2:8000`).

### 4.4. Single-Command Model Retraining
```bash
./scripts/retrain.sh
# Or directly via Python:
PYTHONPATH=. backend/venv/bin/python scripts/retrain.py
```

### 4.5. Run Full Test Suite
```bash
PYTHONPATH=. backend/venv/bin/pytest backend/tests/ -v
# 18 passed: unit tests, API tests, curse simulation, CSV batch imports, and robustness tests
```

---

## 5. Open-Source Libraries & APIs Used

In accordance with hackathon competition rules, all open-source libraries, frameworks, and tools used are declared below:

### Backend & Machine Learning
- **[FastAPI](https://fastapi.tiangolo.com/)** (`0.115.8`): High-performance asynchronous REST API framework.
- **[Uvicorn](https://www.uvicorn.org/)** (`0.34.0`): ASGI web server implementation.
- **[SQLAlchemy](https://www.sqlalchemy.org/)** (`2.0.38`): SQL toolkit and Object-Relational Mapper (ORM).
- **[Pydantic](https://docs.pydantic.dev/)** (`2.10.6`): Data validation and settings management using Python type annotations.
- **[scikit-learn](https://scikit-learn.org/)** (`1.6.1`): Machine learning library (`HistGradientBoostingRegressor`, preprocessing, evaluation metrics).
- **[Pandas](https://pandas.pydata.org/)** (`2.2.3`): Time-series data manipulation and rolling moment computation.
- **[NumPy](https://numpy.org/)** (`2.0.2`): Numerical operations and vectorized calculations.
- **[pytest](https://pytest.org/)** (`8.4.2`): Unit and integration testing framework.
- **[python-multipart](https://github.com/Kludex/python-multipart)** (`0.0.20`): Streaming multipart parser for batch CSV file imports.

### Web Dashboard
- **[React](https://react.dev/)** (`18.3.1`): Declarative UI library.
- **[Vite](https://vitejs.dev/)** (`6.2.0`): Next-generation frontend tooling and bundler.
- **[TypeScript](https://www.typescriptlang.org/)** (`5.7.3`): Static typing and shared contract enforcement.
- **[Tailwind CSS](https://tailwindcss.com/)** (`3.4.17`): Utility-first CSS framework.
- **[Framer Motion](https://www.framer.com/motion/)** (`11.18.2`): Physics-based animation and spring transitions.
- **[Recharts](https://recharts.org/)** (`2.15.1`): Declarative charting library for demand curves and confidence bands.
- **[Lucide React](https://lucide.dev/)** (`0.475.0`): Minimalist UI icons.

### Mobile Client (Android)
- **[React Native](https://reactnative.dev/)** (`0.76.6`): Native mobile framework.
- **[Expo](https://expo.dev/)** (`~52.0.31`): Universal React Native application tooling.
- **[@react-navigation](https://reactnavigation.org/)** (`v7`): Native bottom tab and stack navigation.
- **[react-native-svg](https://github.com/software-mansion/react-native-svg)** (`15.16.0`): Native vector graphics for custom potion liquid flasks.
- **[expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)** (`~58.0.7`): Haptic tactile feedback for sales and alert actions.
- **[react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)** (`5.11.0`): Safe insets handling across Android devices.

*Note: No proprietary third-party commercial APIs or external cloud services were required; the entire system operates completely self-contained on local infrastructure.*
