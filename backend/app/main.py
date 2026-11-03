import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.api.api_v1 import api_router
from backend.app.ml.prophecy import ProphecyEngine
from backend.app.ml.restock import RestockSpellEngine

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Madam Hexley's Potion Pantry API",
    description=(
        "Smart inventory tracking, demand forecasting, stockout prophecy, "
        "and anomaly detection system for Madam Hexley's mystical apothecary."
    ),
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Web Dashboard (Vite) and Mobile App (Expo React Native)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "enchanted",
        "service": "Madam Hexley's Potion Pantry API",
        "version": "1.0.0",
        "docs": "/docs",
        "api_v1": "/api"
    }

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An arcane disturbance occurred: {str(exc)}"}
    )

@app.on_event("startup")
def prewarm_arcane_cache():
    """Prime ML models, prophecies, and restock engine into memory on startup."""
    try:
        db = SessionLocal()
        ProphecyEngine(db).get_all_stockout_prophecies()
        RestockSpellEngine(db).get_all_recommendations()
        db.close()
    except Exception as exc:
        print(f"[Warning] ML pre-warming cache encountered: {exc}")

# Static files / SPA support for production full-stack deployment
frontend_dist = os.getenv(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../web/dist"))
)

if os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        
        # When called by API clients or test suite on root without text/html
        if full_path == "" and "text/html" not in request.headers.get("accept", ""):
            return health_check()
        
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
            
        return JSONResponse(status_code=404, content={"detail": "Frontend assets not found"})
else:
    @app.get("/", tags=["Health"])
    def root_health():
        return health_check()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
