/**
 * frontend/src/components/common/PlayerRadarChart.jsx
 * Komponen Recharts Radar Chart untuk analisis multi-axis performa pemain PUBG Mobile
 * (Combat, Survival, Teamwork, Precision, Utility).
 * Mendukung komparasi 1 hingga 3 pemain sekaligus.
 */

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

// Helper normalisasi statistik pertandingan menjadi skala 0-100
export const calculatePlayerDimensions = (player) => {
  if (!player) return { combat: 0, survival: 0, teamwork: 0, precision: 0, utility: 0 };

  const kills = Number(player.Kills) || 0;
  const damage = Number(player.Damage_Dealt) || 0;
  const survival = Number(player.Survival_Time_Minutes) || 0;
  const rank = Number(player.Match_Rank) || 100;
  const headshot = Number(player.Headshot_Percentage) || 0;
  const assists = Number(player.Assists) || 0;
  const revives = Number(player.Revives) || 0;
  const heals = Number(player.Heals_Used) || 0;
  const boosts = Number(player.Boosts_Used) || 0;

  // 1. Combat (Kills & Damage): 0 - 100
  const combat = Math.min(100, Math.round((kills / 8) * 50 + (damage / 800) * 50));

  // 2. Survival (Survival Time & Invers Rank): 0 - 100
  const rankScore = Math.max(0, (101 - rank));
  const survivalDim = Math.min(100, Math.round((survival / 30) * 50 + (rankScore / 100) * 50));

  // 3. Teamwork (Assists & Revives): 0 - 100
  const teamwork = Math.min(100, Math.round((assists / 5) * 50 + (revives / 4) * 50));

  // 4. Precision (Headshot %): 0 - 100
  const precision = Math.min(100, Math.round((headshot / 50) * 100));

  // 5. Utility (Heals & Boosts): 0 - 100
  const utility = Math.min(100, Math.round(((heals + boosts) / 14) * 100));

  return {
    combat,
    survival: survivalDim,
    teamwork,
    precision,
    utility,
  };
};

export const PlayerRadarChart = ({ players = [], height = 300 }) => {
  const { isDark } = useTheme();
  const playerList = Array.isArray(players) ? players : [players];
  if (playerList.length === 0 || !playerList[0]) return null;

  // Warna aksen untuk 1-3 pemain: Crimson Red, Neutral Slate, Neutral Zinc
  const colorPalette = [
    { stroke: "#dc2626", fill: "#dc2626", name: playerList[0]?.IGN || playerList[0]?.Player_ID || "Player 1" },
    { stroke: isDark ? "#a1a1aa" : "#52525b", fill: isDark ? "#a1a1aa" : "#52525b", name: playerList[1]?.IGN || playerList[1]?.Player_ID || "Player 2" },
    { stroke: isDark ? "#71717a" : "#27272a", fill: isDark ? "#71717a" : "#27272a", name: playerList[2]?.IGN || playerList[2]?.Player_ID || "Player 3" },
  ];

  // Hitung data radar
  const playerDimensions = playerList.map(calculatePlayerDimensions);

  const axes = [
    { subject: "Combat", key: "combat", fullMark: 100 },
    { subject: "Survival", key: "survival", fullMark: 100 },
    { subject: "Teamwork", key: "teamwork", fullMark: 100 },
    { subject: "Precision", key: "precision", fullMark: 100 },
    { subject: "Utility", key: "utility", fullMark: 100 },
  ];

  const chartData = axes.map((axis) => {
    const item = { subject: axis.subject, fullMark: axis.fullMark };
    playerDimensions.forEach((dim, idx) => {
      item[`player_${idx}`] = dim[axis.key];
    });
    return item;
  });

  return (
    <div style={{ width: "100%", height }} className="flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke={isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)"} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: isDark ? "#9ca3af" : "#4b5563", fontSize: 12, fontFamily: "Rajdhani", fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
            tick={{ fill: isDark ? "#6b7280" : "#9ca3af", fontSize: 10 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "rgba(24, 24, 27, 0.96)" : "rgba(255, 255, 255, 0.96)",
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              fontSize: "12px",
              color: isDark ? "#fff" : "#09090b",
              fontFamily: "Outfit",
            }}
          />

          {playerList.map((p, idx) => (
            <Radar
              key={p.Player_ID || idx}
              name={p.IGN || p.Player_ID || `Pemain ${idx + 1}`}
              dataKey={`player_${idx}`}
              stroke={colorPalette[idx].stroke}
              fill={colorPalette[idx].fill}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          ))}

          {playerList.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: 10,
                fontSize: 12,
                fontFamily: "Rajdhani",
                fontWeight: 600,
              }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
