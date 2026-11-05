"""
ml/config.py
Konfigurasi parameter Machine Learning, bobot domain-knowledge Player Score,
definisi fitur, pemetaan Tier, serta kategori skor selaras dengan eksperimen Colab & Bab 4 Skripsi.
"""

from pathlib import Path

# --- Path Konfigurasi ---
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

RAW_DATA_PATH = DATA_DIR / "pubg.csv"
PROCESSED_DATA_PATH = DATA_DIR / "processed_pubg.csv"

# --- Artefak Model Output ---
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
SCALER_PATH = ARTIFACTS_DIR / "scaler.joblib"
LABEL_ENCODER_PATH = ARTIFACTS_DIR / "label_encoder.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"

# --- Domain-Knowledge Weighting & Gaussian Noise (Selaras Colab & Bab 3-4 Skripsi) ---
WEIGHTS = {
    "kills": 3.0,
    "damage_dealt": 0.05,
    "survival_time_minutes": 1.5,
    "headshot_percentage": 0.5,
    "assists": 2.0,
    "revives": 2.5,
    "match_rank": 1.0,  # Penalti pengurang
}
NOISE_SCALE = 14.0  # Gaussian Noise loc=0, scale=14.0 untuk variansi alami

# --- Fitur Masukan Model (12 Fitur) ---
FEATURE_COLUMNS = [
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

NUMERIC_FEATURES = [
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

# --- Pemetaan Tier PUBG Mobile ---
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

# --- 5 Tingkatan Talent Tier (Selaras dengan Bab 3 & 4 Skripsi) ---
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

# --- Parameter Training & KDD ---
RANDOM_STATE = 42
TEST_SIZE = 0.40  # Skenario Data Splitting 60% Train : 40% Test
CV_FOLDS = 5

# Hyperparameter Grid dengan regularisasi & pembatasan kedalaman
PARAM_GRID = {
    "learning_rate": [0.03, 0.05],
    "max_depth": [3, 4],
    "n_estimators": [100, 150],
    "subsample": [0.8],
    "colsample_bytree": [0.8],
}
