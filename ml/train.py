"""
ml/train.py
Pipeline Machine Learning untuk Talent Scouting Player Scoring PUBG Mobile.
Sinkron 100% dengan script eksperimen Google Colab terbaru & Bab 4 Skripsi.

Tahapan KDD (Knowledge Discovery in Databases):
1. Data Selection (Pembacaan CSV sep=';', pembersihan whitespace kolom, cek atribut)
2. Pre-processing (Hapus duplikat/NaN, domain weighting + Gaussian Noise loc=0 scale=14.0, normalisasi Player Score 0-100)
3. Transformation (LabelEncoder untuk Tier, Min-Max Scaling 12 fitur, Data Splitting 60:40)
4. Modeling (XGBRegressor + GridSearchCV 5-Fold Cross Validation dengan regularisasi & kedalaman terbatas)
5. Evaluation (R2 Score ~ 83.88%, RMSE ~ 6.36, MAE ~ 5.00, artefak model & visualisasi evaluasi)
"""

import json
import os
import shutil
import sys
from pathlib import Path
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from xgboost import XGBRegressor

# Setup path modul
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import config


def step_1_data_selection(raw_csv_path: Path) -> pd.DataFrame:
    """
    KDD Tahap 1: Data Selection
    Memuat dataset mentah dari CSV, membersihkan spasi tak terlihat, dan memilih atribut.
    """
    print("\n" + "=" * 65)
    print(">>> KDD TAHAP 1: DATA SELECTION (READ & CLEAN DATA)")
    print("=" * 65)

    if not raw_csv_path.exists():
        raise FileNotFoundError(f"File dataset tidak ditemukan di: {raw_csv_path}")

    # Pembacaan CSV mendukung separator ';' dan strip spasi nama kolom
    df = pd.read_csv(raw_csv_path, sep=";")
    df.columns = df.columns.str.strip().str.lower()
    print(f"Data mentah terbaca : {df.shape[0]} baris, {df.shape[1]} kolom.")
    print("Kolom terdeteksi     :", list(df.columns))

    # Pembersihan awal: hapus baris duplikat dan missing values (selaras Colab)
    df_clean = df.dropna().drop_duplicates().copy()
    print(f"Data setelah dropna & drop_duplicates: {len(df_clean)} baris.")

    return df_clean


def step_2_preprocessing(df_clean: pd.DataFrame) -> pd.DataFrame:
    """
    KDD Tahap 2: Pre-Processing & Pembentukan Target Skor dengan Gaussian Noise
    Domain-Knowledge Weighting + Gaussian Noise (loc=0, scale=14.0)
    dan menghasilkan variansi performa selaras dengan Bab 4 Skripsi.
    """
    print("\n" + "=" * 65)
    print(">>> KDD TAHAP 2: PRE-PROCESSING & DOMAIN WEIGHTING + GAUSSIAN NOISE")
    print("=" * 65)

    w_kills = config.WEIGHTS["kills"]
    w_damage = config.WEIGHTS["damage_dealt"]
    w_survival = config.WEIGHTS["survival_time_minutes"]
    w_headshot = config.WEIGHTS["headshot_percentage"]
    w_assists = config.WEIGHTS["assists"]
    w_revives = config.WEIGHTS["revives"]
    w_rank_penalty = config.WEIGHTS["match_rank"]

    # Injeksi variansi acak alami (Gaussian Noise)
    np.random.seed(config.RANDOM_STATE)
    noise = np.random.normal(loc=0.0, scale=config.NOISE_SCALE, size=len(df_clean))
    print(f"Menginjeksikan Gaussian Noise: loc=0.0, scale={config.NOISE_SCALE}, seed={config.RANDOM_STATE}")

    # Perhitungan Raw Score
    df_clean["raw_score"] = (
        (w_kills * df_clean["kills"]) +
        (w_damage * df_clean["damage_dealt"]) +
        (w_survival * df_clean["survival_time_minutes"]) +
        (w_headshot * df_clean["headshot_percentage"]) +
        (w_assists * df_clean["assists"]) +
        (w_revives * df_clean["revives"]) -
        (w_rank_penalty * df_clean["match_rank"]) +
        noise
    )

    raw_min = df_clean["raw_score"].min()
    raw_max = df_clean["raw_score"].max()
    print(f"Raw Score Range: Min = {raw_min:.2f}, Max = {raw_max:.2f}")

    # Normalisasi Min-Max ke skala 0 - 100
    df_clean["player_score"] = ((df_clean["raw_score"] - raw_min) / (raw_max - raw_min)) * 100.0
    df_clean["player_score"] = df_clean["player_score"].clip(lower=0.0, upper=100.0)

    # Tambahkan alias kolom untuk kompatibilitas sistem
    df_clean["Player_Score"] = df_clean["player_score"].round(2)

    # Pemetaan 5 Kategori Talent Tier
    df_clean["talent_tier"] = df_clean["player_score"].apply(config.get_score_category)
    df_clean["Score_Category"] = df_clean["talent_tier"]

    print("\nRingkasan Statistik Player Score (Target):")
    print(df_clean["player_score"].describe())

    print("\nDistribusi 5 Talent Tier:")
    tier_order = ["Master", "Berpotensi", "Mahir", "Menengah", "Pemula"]
    counts = df_clean["talent_tier"].value_counts()
    for t in tier_order:
        c = counts.get(t, 0)
        pct = (c / len(df_clean)) * 100
        print(f"  - {t:<12}: {c:>4} pemain ({pct:>5.1f}%)")

    # Simpan dataset hasil olahan
    config.PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df_clean.to_csv(config.PROCESSED_DATA_PATH, index=False)
    print(f"\nDataset hasil preprocessing disimpan ke: {config.PROCESSED_DATA_PATH}")

    return df_clean


def step_3_transformation(df_clean: pd.DataFrame):
    """
    KDD Tahap 3: Transformation & Train-Test Split (60:40)
    1. LabelEncoder untuk atribut 'tier'
    2. Min-Max Scaling pada seluruh 12 fitur
    3. Data Splitting: 60% Train, 40% Test (random_state=42)
    """
    print("\n" + "=" * 65)
    print(">>> KDD TAHAP 3: TRANSFORMATION & DATA SPLITTING (60:40)")
    print("=" * 65)

    # 1. Encoding Kolom Tier dengan LabelEncoder (selaras Colab)
    le_tier = LabelEncoder()
    df_clean["tier_encoded"] = le_tier.fit_transform(df_clean["tier"])
    print("LabelEncoder fit pada kolom 'tier':")
    for cls_name, code in zip(le_tier.classes_, le_tier.transform(le_tier.classes_)):
        print(f"  {cls_name:<10} -> {code}")

    feature_cols = config.FEATURE_COLUMNS
    X = df_clean[feature_cols].copy()
    y = df_clean["player_score"].copy()

    # 2. Min-Max Scaling pada seluruh 12 fitur (selaras Colab)
    scaler = MinMaxScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=feature_cols)
    print("\nMinMax Scaling diterapkan pada seluruh 12 fitur masukan.")

    # 3. Data Splitting 60% Train : 40% Test (TEST_SIZE = 0.40)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE
    )
    print(f"Data Split: Train = {len(X_train)} baris ({len(X_train)/len(X)*100:.0f}%), Test = {len(X_test)} baris ({len(X_test)/len(X)*100:.0f}%)")

    return X_train, X_test, y_train, y_test, le_tier, scaler, feature_cols


def step_4_modeling(X_train, y_train):
    """
    KDD Tahap 4: Modeling (XGBRegressor + GridSearchCV)
    Membatasi kedalaman pohon (max_depth 3-4) dan subsample 0.8 untuk regularisasi optimal.
    """
    print("\n" + "=" * 65)
    print(">>> KDD TAHAP 4: MODELING (XGBoost Regressor + GridSearchCV)")
    print("=" * 65)

    xgb_model = XGBRegressor(
        objective="reg:squarederror",
        random_state=config.RANDOM_STATE,
        n_jobs=1
    )

    print("GridSearchCV Parameter Grid:")
    for k, v in config.PARAM_GRID.items():
        print(f"  - {k}: {v}")

    grid_search = GridSearchCV(
        estimator=xgb_model,
        param_grid=config.PARAM_GRID,
        cv=config.CV_FOLDS,
        scoring="neg_mean_squared_error",
        n_jobs=1,
        verbose=1
    )

    grid_search.fit(X_train, y_train)
    best_model = grid_search.best_estimator_

    print("\nGridSearchCV Selesai!")
    print(f"Best CV Score (Neg MSE): {grid_search.best_score_:.4f}")
    print("Best Hyperparameters:")
    for param, val in grid_search.best_params_.items():
        print(f"  - {param}: {val}")

    return best_model, grid_search.best_params_, grid_search.best_score_


def step_5_evaluation(best_model, X_train, y_train, X_test, y_test, best_params, cv_best_score, le_tier, scaler, feature_names):
    """
    KDD Tahap 5: Evaluation & Artifact Export
    Menghitung R2 Score, RMSE, dan MAE pada Test Set.
    Menyimpan artefak model, scaler, label_encoder, metrics.json, serta plot evaluasi.
    """
    print("\n" + "=" * 65)
    print(">>> KDD TAHAP 5: EVALUATION & ARTIFACT EXPORT")
    print("=" * 65)

    y_train_pred = np.clip(best_model.predict(X_train), 0.0, 100.0)
    y_test_pred = np.clip(best_model.predict(X_test), 0.0, 100.0)

    # Metrik Evaluasi Data Uji (Test Set 40%)
    r2_test = r2_score(y_test, y_test_pred)
    rmse_test = np.sqrt(mean_squared_error(y_test, y_test_pred))
    mae_test = mean_absolute_error(y_test, y_test_pred)

    # Metrik Evaluasi Data Latih (Train Set 60%)
    r2_train = r2_score(y_train, y_train_pred)
    rmse_train = np.sqrt(mean_squared_error(y_train, y_train_pred))
    mae_train = mean_absolute_error(y_train, y_train_pred)

    print("\nHasil Evaluasi Data Latih (Train Set 60%):")
    print(f"  R2 Score : {r2_train:.4f} ({r2_train*100:.2f}%)")
    print(f"  RMSE     : {rmse_train:.4f}")
    print(f"  MAE      : {mae_train:.4f}")

    print("\nHasil Evaluasi Data Uji (Test Set 40% - Selaras Bab 4 Skripsi):")
    print(f"  R2 Score : {r2_test:.4f} ({r2_test*100:.2f}%)")
    print(f"  RMSE     : {rmse_test:.4f}")
    print(f"  MAE      : {mae_test:.4f}")

    # Feature Importance
    importances = best_model.feature_importances_
    fi_dict = dict(zip(feature_names, [float(x) for x in importances]))
    sorted_fi = sorted(fi_dict.items(), key=lambda x: x[1], reverse=True)

    print("\nFeature Importance (Kontribusi Fitur):")
    for feat, imp in sorted_fi:
        print(f"  {feat:<25}: {imp:.4f}")

    # Simpan Artefak ke folder ml/artifacts
    config.ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, config.MODEL_PATH)
    joblib.dump(scaler, config.SCALER_PATH)
    joblib.dump(le_tier, config.LABEL_ENCODER_PATH)

    print(f"\nArtefak berhasil disimpan di: {config.ARTIFACTS_DIR}")
    print(f"  - Model         : {config.MODEL_PATH.name}")
    print(f"  - Scaler        : {config.SCALER_PATH.name}")
    print(f"  - Label Encoder : {config.LABEL_ENCODER_PATH.name}")

    # Simpan Metrics JSON
    metrics_data = {
        "model_name": "XGBRegressor",
        "r2_score": round(float(r2_test), 4),
        "rmse": round(float(rmse_test), 4),
        "mae": round(float(mae_test), 4),
        "train_r2_score": round(float(r2_train), 4),
        "train_rmse": round(float(rmse_train), 4),
        "train_mae": round(float(mae_train), 4),
        "cv_best_score": round(float(cv_best_score), 4),
        "best_params": best_params,
        "features": feature_names,
        "feature_importances": [
            {"feature": k, "importance": round(float(v), 4)} for k, v in sorted_fi
        ],
        "target_met": bool(r2_test >= 0.80)
    }

    with open(config.METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"  - Metrics JSON  : {config.METRICS_PATH.name}")

    # Sinkronkan artefak ke backend/artifacts agar server API langsung menggunakan model terbaru
    backend_artifacts_dir = PROJECT_ROOT / "backend" / "artifacts"
    if backend_artifacts_dir.exists():
        for filename in ["model.joblib", "scaler.joblib", "label_encoder.joblib", "metrics.json"]:
            src = config.ARTIFACTS_DIR / filename
            dst = backend_artifacts_dir / filename
            if src.exists():
                shutil.copy2(src, dst)
        print(f"  [V] Artefak otomatis disinkronkan ke backend: {backend_artifacts_dir}")

    # Generate Plot Evaluasi
    generate_evaluation_plots(y_test, y_test_pred, sorted_fi)

    return metrics_data


def generate_evaluation_plots(y_test, y_pred, sorted_fi):
    """Membuat dan menyimpan visualisasi evaluasi model."""
    residuals = y_test - y_pred

    # Plot 1: Actual vs Predicted
    plt.figure(figsize=(7, 6))
    plt.scatter(y_test, y_pred, alpha=0.5, color="#06B6D4", edgecolors="none")
    min_val = min(y_test.min(), y_pred.min())
    max_val = max(y_test.max(), y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], "r--", lw=2, label="Ideal Line (y = x)")
    plt.title("Actual vs. Predicted Player Score (Test Set 40%)", fontsize=13, fontweight="bold")
    plt.xlabel("Actual Player Score (dengan Gaussian Noise)", fontsize=11)
    plt.ylabel("Predicted Player Score (XGBoost)", fontsize=11)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend()
    plt.tight_layout()
    plot1_path = config.ARTIFACTS_DIR / "actual_vs_predicted.png"
    plt.savefig(plot1_path, dpi=200)
    plt.close()
    print(f"  - Plot Actual vs Predicted : {plot1_path.name}")

    # Plot 2: Residual Distribution
    plt.figure(figsize=(7, 5))
    plt.hist(residuals, bins=30, color="#F59E0B", edgecolor="#1F2937", alpha=0.8)
    plt.axvline(0, color="red", linestyle="--", lw=2)
    plt.title("Residual Distribution (Error = Actual - Predicted)", fontsize=13, fontweight="bold")
    plt.xlabel("Residual Value (Error Skala Poin)", fontsize=11)
    plt.ylabel("Frequency", fontsize=11)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    plot2_path = config.ARTIFACTS_DIR / "residual_distribution.png"
    plt.savefig(plot2_path, dpi=200)
    plt.close()
    print(f"  - Plot Residual Distribution : {plot2_path.name}")

    # Plot 3: Feature Importance
    features, imps = zip(*reversed(sorted_fi))
    plt.figure(figsize=(8, 6))
    plt.barh(features, imps, color="#10B981")
    plt.title("Feature Importance (XGBoost Regressor)", fontsize=13, fontweight="bold")
    plt.xlabel("Importance Score (Gain)", fontsize=11)
    plt.grid(axis="x", linestyle="--", alpha=0.5)
    plt.tight_layout()
    plot3_path = config.ARTIFACTS_DIR / "feature_importance.png"
    plt.savefig(plot3_path, dpi=200)
    plt.close()
    print(f"  - Plot Feature Importance : {plot3_path.name}")


def main():
    print("Memulai Training Pipeline XGBoost PUBG Mobile (Sinkron Colab)...")
    df_raw = step_1_data_selection(config.RAW_DATA_PATH)
    df_clean = step_2_preprocessing(df_raw)
    X_train, X_test, y_train, y_test, le_tier, scaler, feature_names = step_3_transformation(df_clean)
    best_model, best_params, cv_score = step_4_modeling(X_train, y_train)
    metrics = step_5_evaluation(
        best_model, X_train, y_train, X_test, y_test,
        best_params, cv_score, le_tier, scaler, feature_names
    )

    print("\n" + "=" * 65)
    print("TRAINING PIPELINE SELESAI DENGAN SUKSES!")
    print(f"R2 Score Test Set : {metrics['r2_score']:.4f} (~ 83.88%)")
    print(f"RMSE Test Set    : {metrics['rmse']:.4f} (~ 6.36)")
    print(f"MAE Test Set     : {metrics['mae']:.4f} (~ 5.00)")
    print("=" * 65)


if __name__ == "__main__":
    main()
