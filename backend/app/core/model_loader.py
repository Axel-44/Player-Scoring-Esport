"""
backend/app/core/model_loader.py
Singleton loader untuk artefak model XGBoost, preprocessor, dan inferensi skor pemain.
Mendukung inferensi ultra-ringan berbasis native XGBoost Booster + NumPy (tanpa scikit-learn / pandas)
sehingga bundle size sangat ramping (<180 MB) dan aman untuk Vercel Serverless.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import xgboost as xgb

from app.core import config


class ModelService:
    """Service pengelola model machine learning dan inferensi prediksi."""

    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.booster: Optional[xgb.Booster] = None
        self.preprocessor: Dict[str, Any] = {}
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

        model_json_path = config.ML_ARTIFACTS_DIR / "model.json"
        preprocessor_path = config.ML_ARTIFACTS_DIR / "preprocessor.json"
        metrics_path = config.ML_ARTIFACTS_DIR / "metrics.json"

        # 1. Pastikan file model dan preprocessor JSON ada
        if not model_json_path.exists():
            # Jika belum ada model.json, generate dari model.joblib jika joblib tersedia
            joblib_path = config.ML_ARTIFACTS_DIR / "model.joblib"
            if joblib_path.exists():
                import joblib
                legacy_model = joblib.load(joblib_path)
                legacy_model.save_model(str(model_json_path))
            else:
                raise FileNotFoundError(f"File model tidak ditemukan: {model_json_path}")

        if not preprocessor_path.exists():
            # Fallback jika belum ada preprocessor.json
            scaler_path = config.ML_ARTIFACTS_DIR / "scaler.joblib"
            encoder_path = config.ML_ARTIFACTS_DIR / "label_encoder.joblib"
            if scaler_path.exists() and encoder_path.exists():
                import joblib
                scaler = joblib.load(scaler_path)
                encoder = joblib.load(encoder_path)
                prep_data = {
                    "tier_classes": list(encoder.classes_),
                    "feature_names": list(scaler.feature_names_in_),
                    "scale_": [float(x) for x in scaler.scale_],
                    "min_": [float(x) for x in scaler.min_]
                }
                with open(preprocessor_path, "w", encoding="utf-8") as pf:
                    json.dump(prep_data, pf, indent=2)
            else:
                raise FileNotFoundError(f"File preprocessor tidak ditemukan: {preprocessor_path}")

        # 2. Muat XGBoost Booster
        self.booster = xgb.Booster()
        self.booster.load_model(str(model_json_path))

        # 3. Muat Preprocessor
        with open(preprocessor_path, "r", encoding="utf-8") as pf:
            self.preprocessor = json.load(pf)

        # 4. Muat Metrics
        if metrics_path.exists():
            with open(metrics_path, "r", encoding="utf-8") as f:
                self.metrics_data = json.load(f)
        else:
            self.metrics_data = {}

        self._is_loaded = True
        print("Artefak model ML berhasil dimuat (Mode: Ultra-Lightweight Native XGBoost)!")

    def is_loaded(self) -> bool:
        return self._is_loaded

    def _encode_tier(self, tier_val: Any) -> float:
        """Transformasi kategori Tier menjadi representasi integer terstandarisasi."""
        classes = self.preprocessor.get("tier_classes", [])
        s = str(tier_val).strip()
        if s in classes:
            return float(classes.index(s))
        if s.title() in classes:
            return float(classes.index(s.title()))
        if s.capitalize() in classes:
            return float(classes.index(s.capitalize()))
        return 0.0

    def _prepare_matrix(self, players: List[Dict[str, Any]]) -> xgb.DMatrix:
        """
        Mentransformasi list dictionary statistik pemain menjadi numpy 2D array
        terskala (Min-Max Scaling) lalu dibungkus ke dalam DMatrix.
        """
        feature_names = self.preprocessor.get("feature_names", config.FEATURE_COLUMNS_IN_X)
        scale_arr = np.array(self.preprocessor["scale_"], dtype=np.float32)
        min_arr = np.array(self.preprocessor["min_"], dtype=np.float32)

        rows = []
        for p in players:
            tier_enc = self._encode_tier(p.get("tier", "Bronze"))
            row = []
            for col in feature_names:
                if col == "tier_encoded":
                    row.append(tier_enc)
                else:
                    row.append(float(p.get(col, 0.0)))
            rows.append(row)

        X_raw = np.array(rows, dtype=np.float32)
        X_scaled = X_raw * scale_arr + min_arr

        return xgb.DMatrix(X_scaled, feature_names=feature_names)

    def predict_single(self, player_data: Dict[str, Any]) -> Tuple[float, str]:
        """Memprediksi skor untuk 1 pemain."""
        if not self._is_loaded or self.booster is None:
            raise RuntimeError("Model belum dimuat. Panggil load_artifacts() terlebih dahulu.")

        dmat = self._prepare_matrix([player_data])
        raw_pred = self.booster.predict(dmat)[0]
        score = round(float(np.clip(raw_pred, 0.0, 100.0)), 2)
        category = config.get_score_category(score)

        return score, category

    def predict_batch(self, players_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Memprediksi skor untuk banyak pemain sekaligus secara efisien."""
        if not self._is_loaded or self.booster is None:
            raise RuntimeError("Model belum dimuat. Panggil load_artifacts() terlebih dahulu.")

        if not players_data:
            return []

        dmat = self._prepare_matrix(players_data)
        raw_preds = self.booster.predict(dmat)
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
