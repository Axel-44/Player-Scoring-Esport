"""
backend/app/schemas/player.py
Pydantic schemas untuk validasi data masukan dan respon API FastAPI.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

# 8 Tier resmi PUBG Mobile sesuai temuan pada dataset Kaggle
ValidTier = Literal[
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Crown",
    "Ace",
    "Conqueror",
]

class PlayerInput(BaseModel):
    """Schema statistik pertandingan pemain PUBG Mobile untuk prediksi Player Score."""
    tier: ValidTier = Field(
        ...,
        description="Tier pemain (Bronze, Silver, Gold, Platinum, Diamond, Crown, Ace, Conqueror)",
        examples=["Conqueror"]
    )
    kills: int = Field(
        ...,
        ge=0,
        description="Jumlah musuh yang berhasil dieliminasi (Kills >= 0)",
        examples=[5]
    )
    damage_dealt: float = Field(
        ...,
        ge=0.0,
        description="Total damage yang dihasilkan kepada lawan (Damage >= 0.0)",
        examples=[550.5]
    )
    survival_time_minutes: float = Field(
        ...,
        ge=0.0,
        description="Durasi bertahan hidup dalam pertandingan dalam satuan menit",
        examples=[24.5]
    )
    headshot_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Persentase headshot (0.0 sampai 100.0)",
        examples=[32.5]
    )
    assists: int = Field(
        ...,
        ge=0,
        description="Jumlah assist dalam melumpuhkan musuh",
        examples=[3]
    )
    revives: int = Field(
        ...,
        ge=0,
        description="Jumlah pertolongan membangkitkan teman satu tim yang knock",
        examples=[2]
    )
    distance_travelled_km: float = Field(
        ...,
        ge=0.0,
        description="Jarak tempuh perjalanan dalam match (km)",
        examples=[6.4]
    )
    longest_kill_meters: float = Field(
        ...,
        ge=0.0,
        description="Jarak eliminasi musuh terjauh (meter)",
        examples=[145.2]
    )
    heals_used: int = Field(
        ...,
        ge=0,
        description="Jumlah item medis pemulihan darah yang digunakan",
        examples=[4]
    )
    boosts_used: int = Field(
        ...,
        ge=0,
        description="Jumlah item peningkat energi/boost yang digunakan",
        examples=[5]
    )
    match_rank: int = Field(
        ...,
        ge=1,
        le=100,
        description="Peringkat akhir tim/pemain dalam match (1 sampai 100)",
        examples=[1]
    )


class PlayerPredictionResponse(BaseModel):
    """Schema respon hasil inferensi Player Score."""
    player_score: float = Field(..., description="Skor akhir kemampuan pemain (0 - 100)")
    score_category: str = Field(..., description="Kategori skor (Rendah, Menengah, Tinggi, Elite)")


class BatchPlayerInput(BaseModel):
    """Schema masukan untuk inferensi batch."""
    players: List[PlayerInput] = Field(..., description="Daftar statistik pemain yang akan dinilai")


class BatchPredictionResponse(BaseModel):
    """Schema respon untuk inferensi batch."""
    total: int = Field(..., description="Total pemain yang diproses")
    predictions: List[PlayerPredictionResponse] = Field(..., description="Daftar hasil skor tiap pemain")


class FeatureImportanceItem(BaseModel):
    """Schema elemen feature importance."""
    feature: str
    importance: float


class FeatureImportanceResponse(BaseModel):
    """Schema respon daftar feature importance model."""
    feature_importances: List[FeatureImportanceItem]


class ModelMetricsResponse(BaseModel):
    """Schema respon metrik evaluasi model XGBoost."""
    model_name: str
    r2_score: float
    rmse: float
    mae: float
    train_r2_score: float
    train_rmse: float
    train_mae: float
    cv_best_score: Optional[float] = None
    cv_best_r2: Optional[float] = 0.0
    best_params: Dict[str, Any]
    target_met: bool


class HealthResponse(BaseModel):
    """Schema respon pemeriksaan kesehatan layanan (health check)."""
    status: str
    model_loaded: bool
    version: str
