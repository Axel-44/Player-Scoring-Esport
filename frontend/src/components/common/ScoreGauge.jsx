/**
 * frontend/src/components/common/ScoreGauge.jsx
 * Komponen visualisasi gauge lingkaran untuk Player Score (0-100) dan badge kategori skor.
 */

import React from "react";

export const ScoreGauge = ({ score = 0, category = "Menengah", size = "md" }) => {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));
  
  // Hitung persentase offset lingkaran (lingkaran keliling = 2 * PI * r)
  const radius = size === "sm" ? 36 : size === "lg" ? 72 : 56;
  const strokeWidth = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Warna dinamis berdasarkan kategori skor (5 Talent Tiers)
  const getTheme = (cat) => {
    switch (cat) {
      case "Master":
      case "Elite":
        return {
          stroke: "#10B981", // Emerald
          glow: "rgba(16, 185, 129, 0.4)",
          badge: "badge-master",
          textColor: "text-emerald-400",
        };
      case "Berpotensi":
      case "Tinggi":
        return {
          stroke: "#06B6D4", // Cyan
          glow: "rgba(6, 182, 212, 0.4)",
          badge: "badge-berpotensi",
          textColor: "text-esports-cyan",
        };
      case "Mahir":
        return {
          stroke: "#3B82F6", // Blue
          glow: "rgba(59, 130, 246, 0.4)",
          badge: "badge-mahir",
          textColor: "text-blue-400",
        };
      case "Menengah":
        return {
          stroke: "#F59E0B", // Amber
          glow: "rgba(245, 158, 11, 0.4)",
          badge: "badge-menengah",
          textColor: "text-esports-amber",
        };
      case "Pemula":
      case "Rendah":
      default:
        return {
          stroke: "#EF4444", // Rose
          glow: "rgba(239, 68, 68, 0.4)",
          badge: "badge-pemula",
          textColor: "text-esports-rose",
        };
    }
  };

  const theme = getTheme(category);
  const containerDim = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: containerDim, height: containerDim }}>
        <svg className="transform -rotate-90" width={containerDim} height={containerDim}>
          {/* Background circle track */}
          <circle
            cx={containerDim / 2}
            cy={containerDim / 2}
            r={radius}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active score ring */}
          <circle
            cx={containerDim / 2}
            cy={containerDim / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
              filter: `drop-shadow(0 0 8px ${theme.glow})`,
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-gaming font-bold tracking-tight ${theme.textColor} ${
              size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl"
            }`}
          >
            {clampedScore.toFixed(1)}
          </span>
          {size !== "sm" && (
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              / 100
            </span>
          )}
        </div>
      </div>

      {/* Category Badge */}
      {size !== "sm" && (
        <span className={`mt-2 px-3 py-1 rounded-full text-[11px] font-gaming font-bold uppercase tracking-wider ${theme.badge}`}>
          {category}
        </span>
      )}
    </div>
  );
};
