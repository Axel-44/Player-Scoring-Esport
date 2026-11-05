"""
backend/app/api/routes.py
Definisi endpoint REST API FastAPI untuk inferensi dan metrik model sesuai PRD Bagian 11.
"""

from fastapi import APIRouter, HTTPException, status
from app.core import config
from app.core.model_loader import model_service
from app.schemas.player import (
    BatchPlayerInput,
    BatchPredictionResponse,
    FeatureImportanceResponse,
    HealthResponse,
    ModelMetricsResponse,
    PlayerInput,
    PlayerPredictionResponse,
)

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check layanan API",
    tags=["Health"]
)
def check_health():
    """Memeriksa status hidup layanan API dan apakah model ML telah berhasil dimuat."""
    return HealthResponse(
        status="ok",
        model_loaded=model_service.is_loaded(),
        version=config.APP_VERSION,
    )


@router.post(
    "/predict",
    response_model=PlayerPredictionResponse,
    summary="Prediksi skor satu pemain",
    tags=["Prediction"]
)
def predict_player_score(player: PlayerInput):
    """
    Menerima 1 data statistik pemain PUBG Mobile, mentransformasikan fitur,
    dan mengembalikan Player Score (0-100) beserta kategori skornya.
    """
    try:
        score, category = model_service.predict_single(player.model_dump())
        return PlayerPredictionResponse(
            player_score=score,
            score_category=category
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memprediksi skor pemain: {str(e)}"
        )


@router.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    summary="Prediksi skor banyak pemain sekaligus",
    tags=["Prediction"]
)
def predict_batch_player_scores(batch: BatchPlayerInput):
    """
    Menerima daftar statistik banyak pemain, menjalankan inferensi secara efisien,
    dan mengembalikan daftar skor serta kategori untuk setiap pemain.
    """
    try:
        players_data = [p.model_dump() for p in batch.players]
        predictions_raw = model_service.predict_batch(players_data)
        
        predictions = [
            PlayerPredictionResponse(
                player_score=item["player_score"],
                score_category=item["score_category"]
            )
            for item in predictions_raw
        ]
        
        return BatchPredictionResponse(
            total=len(predictions),
            predictions=predictions
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memproses batch prediksi: {str(e)}"
        )


@router.get(
    "/model/metrics",
    response_model=ModelMetricsResponse,
    summary="Metrik evaluasi model XGBoost",
    tags=["Model Information"]
)
def get_model_metrics():
    """Menyajikan metrik evaluasi model (R2 Score, RMSE, MAE, Best Hyperparameters)."""
    try:
        metrics = model_service.get_metrics()
        return ModelMetricsResponse(**metrics)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil metrik model: {str(e)}"
        )


@router.get(
    "/model/feature-importance",
    response_model=FeatureImportanceResponse,
    summary="Daftar Feature Importance",
    tags=["Model Information"]
)
def get_feature_importance():
    """Menyajikan daftar kontribusi setiap fitur (Feature Importance) terhadap Player Score."""
    try:
        importances = model_service.get_feature_importance()
        return FeatureImportanceResponse(feature_importances=importances)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mengambil feature importance: {str(e)}"
        )
