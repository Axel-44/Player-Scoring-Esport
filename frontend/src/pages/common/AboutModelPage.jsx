/**
 * frontend/src/pages/common/AboutModelPage.jsx
 * Halaman transparansi ilmiah "Tentang Model" menampilkan evaluasi R2, RMSE, MAE,
 * parameter terbaik GridSearchCV, dan Feature Importance (FR-11).
 * Selaras 100% dengan Bab 4 Skripsi & model terbaru XGBoost (R2 ~ 83.45% - 83.88%).
 */

import React, { useEffect, useState } from "react";
import { Cpu, CheckCircle, BarChart3, Database, Layers, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

export const AboutModelPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [featureImportances, setFeatureImportances] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const [resMetrics, resFI] = await Promise.all([
          fetch(`${apiUrl}/model/metrics`).then((r) => (r.ok ? r.json() : null)),
          fetch(`${apiUrl}/model/feature-importance`).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (resMetrics) setMetrics(resMetrics);
        if (resFI?.feature_importances) setFeatureImportances(resFI.feature_importances);
      } catch (err) {
        console.warn("FastAPI offline, menggunakan data metrik skripsi terbaru:", err);
      } finally {
        // Fallback default sesuai artefak model terbaru (Bab 4 Skripsi) jika backend offline
        setMetrics((prev) =>
          prev || {
            model_name: "XGBRegressor",
            r2_score: 0.8345,
            rmse: 6.4494,
            mae: 5.0699,
            train_r2_score: 0.8840,
            train_rmse: 5.2756,
            train_mae: 4.2276,
            cv_best_score: -40.4092,
            best_params: {
              learning_rate: 0.05,
              max_depth: 3,
              n_estimators: 150,
              subsample: 0.8,
              colsample_bytree: 0.8,
            },
            target_met: true,
          }
        );

        setFeatureImportances((prev) =>
          prev && prev.length > 0
            ? prev
            : [
                { feature: "match_rank", importance: 0.5604 },
                { feature: "survival_time_minutes", importance: 0.1369 },
                { feature: "headshot_percentage", importance: 0.0725 },
                { feature: "damage_dealt", importance: 0.0604 },
                { feature: "kills", importance: 0.0439 },
                { feature: "revives", importance: 0.0362 },
                { feature: "assists", importance: 0.0298 },
                { feature: "heals_used", importance: 0.0149 },
                { feature: "distance_travelled_km", importance: 0.0131 },
                { feature: "longest_kill_meters", importance: 0.0129 },
                { feature: "tier_encoded", importance: 0.0100 },
                { feature: "boosts_used", importance: 0.0090 },
              ]
        );
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, [apiUrl]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="inline-flex items-center gap-2 text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider mb-2">
          <Cpu className="w-4 h-4" />
          MACHINE LEARNING TRANSPARENCY (FR-11)
        </div>
        <h1 className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
          ARSITEKTUR & KINERJA MODEL XGBOOST
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl">
          Dokumentasi ilmiah metodologi KDD, parameter pelatihan, dan hasil evaluasi metrik model regresi Player Scoring PUBG Mobile untuk Bab IV Skripsi.
        </p>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* R2 Score Test Set */}
        <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">R2 Score (Data Uji 40%)</span>
          <p className="text-3xl font-gaming font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics?.r2_score ? (metrics.r2_score * 100).toFixed(2) + "%" : "83.45%"}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <CheckCircle className="w-3.5 h-3.5" /> {metrics?.r2_score?.toFixed(4) || "0.8345"}
          </span>
        </div>

        {/* RMSE */}
        <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Root Mean Squared Error (RMSE)</span>
          <p className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white mt-1">
            {metrics?.rmse?.toFixed(4) || "6.4494"}
          </p>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Deviasi pada skala 0-100</span>
        </div>

        {/* MAE */}
        <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mean Absolute Error (MAE)</span>
          <p className="text-3xl font-gaming font-bold text-red-600 mt-1">
            {metrics?.mae?.toFixed(4) || "5.0699"}
          </p>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Rata-rata selisih tebakan ~5 poin</span>
        </div>

        {/* Train Set R2 */}
        <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">R2 Score (Data Latih 60%)</span>
          <p className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white mt-1">
            {metrics?.train_r2_score ? (metrics.train_r2_score * 100).toFixed(2) + "%" : "88.40%"}
          </p>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-red-600" /> Gap Train-Test &lt; 5% (Ideal)
          </span>
        </div>
      </div>

      {/* Grid: Best Hyperparameters & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hyperparameters Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <Layers className="w-5 h-5" />
              <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Parameter Terbaik (GridSearchCV)
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
              Parameter optimal terpilih dari 40 kombinasi fit menggunakan 5-Fold Cross Validation:
            </p>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">learning_rate</span>
                <span className="text-zinc-900 dark:text-white font-bold">{metrics?.best_params?.learning_rate ?? "0.05"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">max_depth</span>
                <span className="text-zinc-900 dark:text-white font-bold">{metrics?.best_params?.max_depth ?? "3"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">n_estimators</span>
                <span className="text-zinc-900 dark:text-white font-bold">{metrics?.best_params?.n_estimators ?? "150"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">subsample</span>
                <span className="text-zinc-900 dark:text-white font-bold">{metrics?.best_params?.subsample ?? "0.8"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">colsample_bytree</span>
                <span className="text-zinc-900 dark:text-white font-bold">{metrics?.best_params?.colsample_bytree ?? "0.8"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">objective</span>
                <span className="text-red-600 font-bold">reg:squarederror</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            Metode: KDD Data Mining • Train/Test Split: 60% / 40% (Random State: 42) • Gaussian Noise (loc=0, scale=14.0)
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Feature Importance (Gain)
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Tingkat kontribusi tiap fitur terhadap pembentukan skor akhir pemain (Model XGBoost Terbaru):
          </p>

          <div className="space-y-2.5">
            {featureImportances.map((item, index) => {
              const maxImp = featureImportances[0]?.importance || 1;
              const widthPct = Math.max(3, (item.importance / maxImp) * 100);
              return (
                <div key={item.feature} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-800 dark:text-zinc-300">
                      {index + 1}. {item.feature}
                    </span>
                    <span className="text-red-600 font-semibold">
                      {(item.importance * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
