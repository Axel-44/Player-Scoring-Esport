"""
backend/app/core/model_loader.py
Singleton loader untuk artefak model XGBoost, preprocessor, dan inferensi skor pemain.
Memuat model sekali saat startup (NFR-01) untuk menjamin latensi <= 1 detik.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

from app.core import config


class ModelService:
    """Service pengelola model machine learning dan inferensi prediksi."""

    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.metrics_data: Dict[str, Any] = {}
        self._is_loaded = False

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self) -> None:
        """Memuat seluruh artefak model dan metrik ke dalam memori."""
        print("Memuat artefak model ML ke memori...")

        if not config.MODEL_PATH.exists():
            raise FileNotFoundError(f"File model tidak ditemukan di: {config.MODEL_PATH}")
        if not config.SCALER_PATH.exists():
            raise FileNotFoundError(f"File scaler tidak ditemukan di: {config.SCALER_PATH}")
        if not config.LABEL_ENCODER_PATH.exists():
            raise FileNotFoundError(f"File encoder tidak ditemukan di: {config.LABEL_ENCODER_PATH}")
        if not config.METRICS_PATH.exists():
            raise FileNotFoundError(f"File metrics tidak ditemukan di: {config.METRICS_PATH}")

        self.model = joblib.load(config.MODEL_PATH)
        self.scaler = joblib.load(config.SCALER_PATH)
        self.label_encoder = joblib.load(config.LABEL_ENCODER_PATH)

        with open(config.METRICS_PATH, "r", encoding="utf-8") as f:
            self.metrics_data = json.load(f)

        self._is_loaded = True
        print("Artefak model ML berhasil dimuat!")

    def is_loaded(self) -> bool:
        return self._is_loaded

    def _prepare_features(self, df_input: pd.DataFrame) -> pd.DataFrame:
        """Mentransformasi dataframe masukan menjadi fitur yang siap diinferensi oleh model."""
        # 1. Transformasi Tier menggunakan LabelEncoder
        raw_tiers = df_input["tier"].values
        if hasattr(self.label_encoder, "classes_"):
            classes = list(self.label_encoder.classes_)
            tier_clean = []
            for t in raw_tiers:
                s = str(t).strip()
                if s in classes:
                    tier_clean.append(s)
                elif s.title() in classes:
                    tier_clean.append(s.title())
                elif s.capitalize() in classes:
                    tier_clean.append(s.capitalize())
                else:
                    tier_clean.append(classes[0])
            tier_encoded = self.label_encoder.transform(tier_clean)
        else:
            tier_encoded = self.label_encoder.transform(pd.DataFrame({"Tier": raw_tiers})).ravel()

        feature_cols = config.FEATURE_COLUMNS_IN_X
        df_features = pd.DataFrame(index=df_input.index)
        df_features["tier_encoded"] = np.array(tier_encoded).ravel().astype(float)

        for col in feature_cols:
            if col != "tier_encoded":
                df_features[col] = df_input[col].values.astype(float)

        # 2. Min-Max Scaling pada seluruh 12 fitur (selaras Colab & training)
        scaled_array = self.scaler.transform(df_features[feature_cols])
        return pd.DataFrame(scaled_array, columns=feature_cols)

    def predict_single(self, player_data: Dict[str, Any]) -> Tuple[float, str]:
        """Memprediksi skor untuk 1 pemain."""
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat. Panggil load_artifacts() terlebih dahulu.")

        df_input = pd.DataFrame([player_data])
        X = self._prepare_features(df_input)

        raw_pred = self.model.predict(X)[0]
        score = round(float(np.clip(raw_pred, 0.0, 100.0)), 2)
        category = config.get_score_category(score)

        return score, category

    def predict_batch(self, players_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Memprediksi skor untuk banyak pemain sekaligus secara efisien."""
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat. Panggil load_artifacts() terlebih dahulu.")

        if not players_data:
            return []

        df_input = pd.DataFrame(players_data)
        X = self._prepare_features(df_input)

        raw_preds = self.model.predict(X)
        clipped_preds = np.clip(raw_preds, 0.0, 100.0)

        results = []
        for p in clipped_preds:
            score = round(float(p), 2)
            results.append({
                "player_score": score,
                "score_category": config.get_score_category(score)
            })

        return results

    def get_metrics(self) -> Dict[str, Any]:
        """Mengambil metrik evaluasi model."""
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat.")
        return {
            "model_name": self.metrics_data.get("model_name", "XGBRegressor"),
            "r2_score": self.metrics_data.get("r2_score", 0.0),
            "rmse": self.metrics_data.get("rmse", 0.0),
            "mae": self.metrics_data.get("mae", 0.0),
            "train_r2_score": self.metrics_data.get("train_r2_score", 0.0),
            "train_rmse": self.metrics_data.get("train_rmse", 0.0),
            "train_mae": self.metrics_data.get("train_mae", 0.0),
            "cv_best_score": self.metrics_data.get("cv_best_score", self.metrics_data.get("cv_best_r2", 0.0)),
            "cv_best_r2": self.metrics_data.get("cv_best_r2", self.metrics_data.get("cv_best_score", 0.0)),
            "best_params": self.metrics_data.get("best_params", {}),
            "target_met": self.metrics_data.get("target_met", True),
        }

    def get_feature_importance(self) -> List[Dict[str, Any]]:
        """Mengambil data feature importance dari model."""
        if not self._is_loaded:
            raise RuntimeError("Model belum dimuat.")
        return self.metrics_data.get("feature_importances", [])


# Instance singleton global
model_service = ModelService.get_instance()
