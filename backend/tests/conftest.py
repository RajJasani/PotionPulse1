import pytest
from backend.app.seed import seed_database
from backend.app.ml.forecaster import DemandForecaster
from backend.app.ml.prophecy import ProphecyEngine
from backend.app.ml.restock import RestockSpellEngine

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()
    DemandForecaster.clear_cache()
    ProphecyEngine.clear_cache()
    RestockSpellEngine.clear_cache()
    yield
    DemandForecaster.clear_cache()
    ProphecyEngine.clear_cache()
    RestockSpellEngine.clear_cache()
