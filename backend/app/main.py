"""
backend/app/main.py
Inisialisasi aplikasi FastAPI, penanganan siklus hidup (lifespan), CORS middleware, dan pendaftaran rute API.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core import config
from app.core.model_loader import model_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Siklus hidup aplikasi FastAPI:
    Memuat seluruh artefak model (XGBoost, Scaler, Encoder, Metrics) tepat sekali saat startup (NFR-01).
    """
    print("Memulai inisialisasi aplikasi backend...")
    model_service.load_artifacts()
    yield
    print("Aplikasi backend dihentikan.")


app = FastAPI(
    title=config.APP_TITLE,
    description=config.APP_DESCRIPTION,
    version=config.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Konfigurasi CORS Middleware (PRD Bagian 11)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan router API
app.include_router(router)


@app.get("/", tags=["Root"])
def root():
    """Endpoint root penyambut API."""
    return {
        "message": "Selamat datang di API Talent Scouting Player Scoring PUBG Mobile",
        "status": "running",
        "documentation": "/docs",
        "version": config.APP_VERSION
    }
