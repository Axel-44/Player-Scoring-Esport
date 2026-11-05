/**
 * frontend/src/components/player/PlayerVisionCard.jsx
 * Kartu Profil E-Sports Vision Scout Card Resmi:
 * - Desain Ultra-Minimalis Monokrom & Bersih (bebas dari efek neon/ungu glowing).
 * - Mendukung Dark Mode (#18181b, #27272a, #ffffff) dan Light Mode (#ffffff, #e4e4e7, #09090b).
 * - Aksen tunggal Merah Crimson Solid (#dc2626) untuk status dan sorotan performa.
 * - Visual atlet menyatu rapi, bar atribut minimalis, dan ringkasan metrik riil XGBoost.
 */

import React, { useRef, useState } from "react";
import {
  Eye,
  Crosshair,
  Brain,
  Shield,
  Gamepad2,
  Crown,
  Flame,
  Zap,
  User,
  Camera,
  Maximize2,
  X,
} from "lucide-react";

import { getPlayerAvatar } from "../../utils/avatarUtils";

export const PlayerVisionCard = ({
  playerData,
  scoreResult,
  customAvatar,
  showActions = true,
  className = "",
}) => {
  const cardRef = useRef(null);
  const [viewMode, setViewMode] = useState("avatar"); // "avatar" | "screenshot"
  const [showLightbox, setShowLightbox] = useState(false);

  const screenshotUrl = playerData?.match_screenshot_url || playerData?.matchScreenshotUrl;

  const heroAvatar = getPlayerAvatar(playerData, null, customAvatar);
  const isCustomAvatar = Boolean(
    customAvatar ||
    playerData?.avatar ||
    (playerData?.isCurrentUser && typeof window !== "undefined" && localStorage.getItem("pulse_scout_custom_avatar"))
  );

  // Nilai statistik dari playerData & scoreResult
  const ign = playerData?.ign || playerData?.IGN || playerData?.Player_Name || playerData?.Player_ID || "MAESTRO";
  const realName = playerData?.real_name || playerData?.Real_Name || null;
  const displayGameId = playerData?.gameId || playerData?.game_id || playerData?.Player_ID || "PREVIEW";
  const tier = playerData?.tier || playerData?.Tier || "Unranked";
  const score = scoreResult?.player_score ?? playerData?.Player_Score ?? 0;
  const category = scoreResult?.score_category || playerData?.Score_Category || "Belum Ada Data";
  const rank = playerData?.match_rank ?? playerData?.Match_Rank ?? 0;
  const kills = playerData?.kills ?? playerData?.Kills ?? 0;
  const damage = playerData?.damage_dealt ?? playerData?.Damage_Dealt ?? 0;
  const headshot = playerData?.headshot_percentage ?? playerData?.Headshot_Percentage ?? 0;
  const survival = playerData?.survival_time_minutes ?? playerData?.Survival_Time_Minutes ?? 0;
  const assists = playerData?.assists ?? playerData?.Assists ?? 0;
  const revives = playerData?.revives ?? playerData?.Revives ?? 0;
  const distance = playerData?.distance_travelled_km ?? playerData?.Distance_Travelled_KM ?? 0;
  const longestKill = playerData?.longest_kill_meters ?? playerData?.Longest_Kill_Meters ?? 0;
  const mapName = playerData?.map || playerData?.Map || "-";
  const weapon = playerData?.favorite_weapon || playerData?.Favorite_Weapon || "-";
  const heals = Number(playerData?.heals_used ?? playerData?.Heals_Used ?? 0);
  const boosts = Number(playerData?.boosts_used ?? playerData?.Boosts_Used ?? 0);

  // Penentuan Role & Tactical Style
  const getRoleAndStyle = () => {
    const explicitRole = playerData?.Role || playerData?.role;
    if (explicitRole) {
      const r = String(explicitRole).toLowerCase();
      if (r.includes("rusher") || r.includes("fragger")) {
        return {
          role: "Rusher / Fragger",
          style: "Aggressive Entry / Breaker",
          tagline: "ONE SHOT, ONE EXTINCTION. THE CIRCLE BOWS TO FORCE.",
        };
      }
      if (r.includes("sniper") || r.includes("marksman")) {
        return {
          role: "Sniper / Marksman",
          style: "Long-Range Precision / Overwatcher",
          tagline: "SEE THE TARGET BEFORE IT MOVES. ABSOLUTE ACCURACY.",
        };
      }
      if (r.includes("zone") || r.includes("controller")) {
        return {
          role: "Zone Controller",
          style: "Late-Game Anchor / Rotator",
          tagline: "I DON'T CHASE THE SAFE ZONE... I COMMAND IT.",
        };
      }
      if (r.includes("support") || r.includes("igl")) {
        return {
          role: "Support / IGL",
          style: "Playmaker / Team Coordinator",
          tagline: "EVERY ROTATION IS CALCULATED. COHESION IS LETHAL.",
        };
      }
    }

    if (kills >= 7 || damage >= 800) {
      return {
        role: "Primary Fragger",
        style: "Aggressive Entry / Breaker",
        tagline: "ONE SHOT, ONE EXTINCTION. THE CIRCLE BOWS TO FORCE.",
      };
    }
    if (headshot >= 32 || longestKill >= 160) {
      return {
        role: "Marksman / Scout",
        style: "Long-Range Precision / Overwatcher",
        tagline: "SEE THE TARGET BEFORE IT MOVES. ABSOLUTE ACCURACY.",
      };
    }
    if (survival >= 25 && rank <= 5) {
      return {
        role: "Zone Controller",
        style: "Late-Game Anchor / Rotator",
        tagline: "I DON'T CHASE THE SAFE ZONE... I COMMAND IT.",
      };
    }
    if (assists >= 3 || revives >= 2) {
      return {
        role: "Tactical IGL / Support",
        style: "Playmaker / Team Coordinator",
        tagline: "EVERY ROTATION IS CALCULATED. COHESION IS LETHAL.",
      };
    }
    return {
      role: "Flex Operator",
      style: "Versatile Combatant / Adaptor",
      tagline: "SEAMLESS ADAPTATION TO ANY BATTLEGROUND.",
    };
  };

  const { role, style, tagline } = getRoleAndStyle();

  // 1. COMBAT POWER
  const combatPct = Math.min(99, Math.max(20, Math.round((kills / 10) * 45 + (damage / 900) * 55)));
  // 2. AIM ACCURACY
  const accuracyPct = Math.min(99, Math.max(15, Math.round((headshot / 45) * 60 + (longestKill / 220) * 40)));
  // 3. SURVIVAL ZONE
  const survivalPct = Math.min(99, Math.max(15, Math.round((survival / 29) * 65 + (distance / 7.5) * 35)));
  // 4. TACTICAL IQ
  const tacticalPct = Math.min(99, Math.max(20, Math.round(Math.max(10, 100 - rank * 4) * 0.7 + (assists / 5) * 30)));
  // 5. SQUAD UTILITY
  const utilityPct = Math.min(99, Math.max(20, Math.round((revives / 4) * 50 + ((heals + boosts) / 10) * 50)));

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-[#18181b] dark:bg-[#18181b] light:bg-[#ffffff] text-zinc-100 dark:text-zinc-100 light:text-zinc-900 shadow-xl overflow-hidden transition-colors duration-300 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        
        {/* =========================================================================
            KOLOM KIRI: VISUAL ATLET & RANK OVERLAY (md:col-span-5)
            ========================================================================= */}
        <div className="md:col-span-5 relative flex flex-col justify-end border-b md:border-b-0 md:border-r border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-100 overflow-hidden min-h-[440px]">
          
          {/* Toggle Pilihan 3: Switch Foto Profil <-> Screenshot Bukti Pertandingan */}
          {screenshotUrl && (
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-auto animate-fadeIn">
              <div className="p-0.5 rounded-xl bg-black/85 backdrop-blur-md border border-zinc-700/80 flex items-center shadow-2xl">
                <button
                  type="button"
                  onClick={() => setViewMode("avatar")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-gaming font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === "avatar"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>PROFIL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("screenshot")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-gaming font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === "screenshot"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>BUKTI SS</span>
                </button>
              </div>

              {viewMode === "screenshot" && (
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="px-2 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-zinc-700/80 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-gaming font-bold flex items-center gap-1 shadow-2xl cursor-pointer"
                  title="Perbesar Screenshot (Fullscreen)"
                >
                  <Maximize2 className="w-3 h-3 text-red-500" />
                  <span>ZOOM</span>
                </button>
              )}
            </div>
          )}

          {/* Foto Pemain / Bukti Screenshot */}
          <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
            {viewMode === "screenshot" && screenshotUrl ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center p-2 cursor-pointer group relative"
                onClick={() => setShowLightbox(true)}
                title="Klik untuk melihat resolusi penuh"
              >
                <img
                  src={screenshotUrl}
                  alt={`Bukti Match ${ign}`}
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute bottom-28 px-3 py-1 rounded-full bg-black/80 border border-red-500/50 text-[10px] font-mono text-zinc-300 pointer-events-none flex items-center gap-1 shadow-md">
                  <Eye className="w-3 h-3 text-red-500" />
                  <span>Klik gambar untuk memperbesar</span>
                </div>
              </div>
            ) : (
              <img
                src={heroAvatar}
                alt={ign}
                className="w-full h-full object-cover object-top opacity-95 transition-transform duration-500"
              />
            )}
          </div>

          {/* IGN & Match Rank Tag - Diposisikan di Bawah Gambar */}
          <div className="relative z-10 pt-16 pb-5 px-4 text-center bg-gradient-to-t from-black/95 via-black/75 to-transparent">
            <div className="inline-block px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 mb-2.5 shadow-sm">
              {`${mapName.toUpperCase()} SPECIALIST`}
            </div>

            <h2 className="text-3xl font-gaming font-black tracking-wider text-white uppercase leading-none drop-shadow-md">
              {ign}
            </h2>

            {/* Rank Callout */}
            <div className="my-2.5">
              {rank === 1 ? (
                <div className="py-1 px-3 rounded bg-red-600/20 border border-red-600/50 inline-flex items-center gap-1.5 text-red-400">
                  <Crown className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-gaming font-black tracking-wider">
                    #1 WWCD WINNER
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-baseline gap-1.5 px-3 py-1 rounded bg-black/60 border border-zinc-700/60 backdrop-blur-sm">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">FINISH RANK:</span>
                  <span className="text-lg font-gaming font-black text-white">
                    #{rank}
                  </span>
                </div>
              )}
            </div>

            {/* Match Quick Metric Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-black/60 border border-zinc-700/60 text-zinc-300 backdrop-blur-sm">
                {kills} Kills
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-zinc-700/60 text-zinc-300 backdrop-blur-sm">
                {Math.round(damage)} Dmg
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-zinc-700/60 text-zinc-300 backdrop-blur-sm">
                {weapon}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-zinc-700/60 text-zinc-300 backdrop-blur-sm">
                {mapName}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            KOLOM KANAN: STATISTIK, ATRIBUT PROGRESS, DAN BIO (md:col-span-7)
            ========================================================================= */}
        <div className="md:col-span-7 p-5 sm:p-6 space-y-4 bg-transparent">
          
          {/* Header Card: IGN, Role, Score, Tier */}
          <div className="p-4 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-2xl font-gaming font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-950 uppercase leading-tight">
                      {ign}
                    </h3>
                    {realName && (
                      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-400">
                        ({realName})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-[10px] font-mono font-bold uppercase">
                      {tier}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                      ID: {displayGameId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Score Badge */}
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  PLAYER SCORE
                </div>
                <div className="text-3xl font-gaming font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-950">
                  {Number(score).toFixed(1)}
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-red-600/10 border border-red-600/30 text-red-500">
                  {category.toUpperCase()} TIER
                </span>
              </div>
            </div>

            {/* Meta Rows (Role & Style) */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[11px] font-mono">ROLE:</span>
                <span className="font-gaming font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 truncate">{role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[11px] font-mono">STYLE:</span>
                <span className="font-gaming font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 truncate">{style}</span>
              </div>
            </div>
          </div>

          {/* Middle Card: VISION PUBG SCOUT ATTRIBUTE BARS */}
          <div className="p-4 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-gaming font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-950 tracking-wider uppercase flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                  <span>KARTU SCOUT VISION RESMI</span>
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Objective Evaluation based on XGBoost Inference
                </p>
              </div>
            </div>

            {/* Minimalist Attribute Progress Bars */}
            <div className="space-y-2.5 pt-1">
              
              {/* 1. COMBAT POWER */}
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-4 flex justify-center text-red-500 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="w-32 flex flex-col shrink-0">
                  <span className="font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-[11px]">
                    COMBAT POWER
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {kills} Kills • {Math.round(damage)} Dmg
                  </span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-700"
                    style={{ width: `${combatPct}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono font-bold text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 shrink-0">
                  {combatPct}%
                </span>
              </div>

              {/* 2. AIM ACCURACY */}
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-4 flex justify-center text-zinc-400 shrink-0">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div className="w-32 flex flex-col shrink-0">
                  <span className="font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-[11px]">
                    AIM ACCURACY
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {Number(headshot).toFixed(1)}% HS • {Math.round(longestKill)}m
                  </span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-700"
                    style={{ width: `${accuracyPct}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono font-bold text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 shrink-0">
                  {accuracyPct}%
                </span>
              </div>

              {/* 3. SURVIVAL ZONE */}
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-4 flex justify-center text-zinc-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="w-32 flex flex-col shrink-0">
                  <span className="font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-[11px]">
                    SURVIVAL ZONE
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {Number(survival).toFixed(1)}m • {Number(distance).toFixed(1)} km
                  </span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-700"
                    style={{ width: `${survivalPct}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono font-bold text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 shrink-0">
                  {survivalPct}%
                </span>
              </div>

              {/* 4. TACTICAL IQ */}
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-4 flex justify-center text-zinc-400 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="w-32 flex flex-col shrink-0">
                  <span className="font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-[11px]">
                    TACTICAL IQ
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Rank #{rank} • {assists} Ast
                  </span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-700"
                    style={{ width: `${tacticalPct}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono font-bold text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 shrink-0">
                  {tacticalPct}%
                </span>
              </div>

              {/* 5. SQUAD UTILITY */}
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-4 flex justify-center text-zinc-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="w-32 flex flex-col shrink-0">
                  <span className="font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-[11px]">
                    SQUAD UTILITY
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {revives} Rev • {heals + boosts} Meds
                  </span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-700"
                    style={{ width: `${utilityPct}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono font-bold text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 shrink-0">
                  {utilityPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: STATISTIK MATCH & BIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* STATS (REAL MATCH BREAKDOWN) */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[11px] font-gaming font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 uppercase tracking-wider">
                  STATISTIK MATCH
                </h5>
                <span className="text-[10px] text-zinc-400 font-mono">12 METRICS</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between py-0.5 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                  <span className="text-zinc-400 text-[11px]">DAMAGE / KILLS:</span>
                  <span className="font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-xs">
                    {Math.round(damage)} HP ({kills} K)
                  </span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                  <span className="text-zinc-400 text-[11px]">HEADSHOT RATE:</span>
                  <span className="font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-xs">
                    {Number(headshot).toFixed(1)}% ({Math.round(longestKill)}m)
                  </span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                  <span className="text-zinc-400 text-[11px]">SURVIVAL TIME:</span>
                  <span className="font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-xs">
                    {Number(survival).toFixed(1)}m ({Number(distance).toFixed(1)}km)
                  </span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-400 text-[11px]">MATCH PLACEMENT:</span>
                  <span className="font-bold text-red-500 text-xs">
                    #{rank} {rank === 1 ? "WWCD" : ""} ({assists} Ast)
                  </span>
                </div>
              </div>
            </div>

            {/* BIO */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <h5 className="text-[11px] font-gaming font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 uppercase tracking-wider">
                  BIO EVALUASI
                </h5>
                <Brain className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              <p className="text-[11px] text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed italic">
                "{tagline}"
              </p>

              <p className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600 leading-tight pt-1 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                Peringkat evaluasi talenta objektif terstandar berbasis model regresi machine learning XGBoost.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Ribbon Bar */}
      <div className="relative z-10 px-6 py-2.5 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-950/40 dark:bg-zinc-950/40 light:bg-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider">
        <span>BATTLEGROUND OBJECTIVE EVALUATION</span>
        <span>•</span>
        <span>PULSE SCOUT TALENT SYSTEM</span>
        <span>•</span>
        <span>XGBOOST INFERENCE</span>
      </div>

      {/* Lightbox Pop-up Fullscreen Screenshot */}
      {showLightbox && screenshotUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-zoom-out"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] bg-zinc-950 rounded-2xl border border-zinc-800 p-2 shadow-2xl overflow-hidden cursor-default flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-red-500" />
                <span className="text-xs font-gaming font-bold uppercase tracking-wider">
                  Bukti Tangkapan Layar Pertandingan Resmi (Proof of Match) - {ign}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 max-h-[80vh] overflow-auto flex items-center justify-center bg-black rounded-b-xl">
              <img
                src={screenshotUrl}
                alt={`Screenshot Hasil Match ${ign}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
