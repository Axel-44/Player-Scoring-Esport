"""
backend/app/core/config.py
Konfigurasi aplikasi backend FastAPI, path artefak model ML, dan CORS settings.
"""

import os
from pathlib import Path
from typing import List

# --- Path Resolusi Proyek ---
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Cek lokasi artefak model (mendukung deployment monorepo maupun standalone backend)
env_artifacts_dir = os.getenv("ML_ARTIFACTS_DIR")
if env_artifacts_dir and Path(env_artifacts_dir).exists():
    ML_ARTIFACTS_DIR = Path(env_artifacts_dir)
elif (BACKEND_DIR / "artifacts").exists():
    ML_ARTIFACTS_DIR = BACKEND_DIR / "artifacts"
elif (PROJECT_ROOT / "ml" / "artifacts").exists():
    ML_ARTIFACTS_DIR = PROJECT_ROOT / "ml" / "artifacts"
else:
    ML_ARTIFACTS_DIR = BACKEND_DIR / "artifacts"

# Path Artefak Model ML
MODEL_PATH = ML_ARTIFACTS_DIR / "model.joblib"
SCALER_PATH = ML_ARTIFACTS_DIR / "scaler.joblib"
LABEL_ENCODER_PATH = ML_ARTIFACTS_DIR / "label_encoder.joblib"
METRICS_PATH = ML_ARTIFACTS_DIR / "metrics.json"

# --- Metadata Aplikasi ---
APP_TITLE = "Talent Scouting PUBG Mobile - Scoring API"
APP_DESCRIPTION = "API Inferensi Skor Pemain PUBG Mobile berbasis XGBoost Regressor untuk Talent Scouting E-Sports."
APP_VERSION = "1.0.0"

# --- CORS Origins ---
env_cors = os.getenv("CORS_ORIGINS")
if env_cors:
    CORS_ORIGINS: List[str] = [origin.strip() for origin in env_cors.split(",") if origin.strip()]
    if "*" not in CORS_ORIGINS:
        CORS_ORIGINS.append("*")
else:
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",  # Mengizinkan seluruh origin untuk kebutuhan deployment & preview
    ]

# --- Definisi Fitur Model (12 Fitur Selaras Colab) ---
TIER_ORDER = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Crown",
    "Ace",
    "Conqueror",
]

FEATURE_COLUMNS_IN_X = [
    "tier_encoded",
    "kills",
    "damage_dealt",
    "survival_time_minutes",
    "headshot_percentage",
    "assists",
    "revives",
    "distance_travelled_km",
    "longest_kill_meters",
    "heals_used",
    "boosts_used",
    "match_rank",
]

# --- 5 Tingkatan Talent Tier (Selaras Bab 3 & 4 Skripsi) ---
SCORE_CATEGORIES = [
    {"min": 0, "max": 20.0, "category": "Pemula"},
    {"min": 20.001, "max": 40.0, "category": "Menengah"},
    {"min": 40.001, "max": 60.0, "category": "Mahir"},
    {"min": 60.001, "max": 80.0, "category": "Berpotensi"},
    {"min": 80.001, "max": 100.0, "category": "Master"},
]

def get_score_category(score: float) -> str:
    """Mengembalikan kategori Talent Tier berdasarkan nilai Player Score (0-100)."""
    score_clamped = max(0.0, min(100.0, float(score)))
    if score_clamped <= 20.0:
        return "Pemula"
    elif score_clamped <= 40.0:
        return "Menengah"
    elif score_clamped <= 60.0:
        return "Mahir"
    elif score_clamped <= 80.0:
        return "Berpotensi"
    else:
        return "Master"

