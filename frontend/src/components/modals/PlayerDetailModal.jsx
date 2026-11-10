/**
 * frontend/src/components/modals/PlayerDetailModal.jsx
 * Modal tampilan detail komprehensif profil pemain, radar chart, dan statistik (FR-06).
 * Mendukung tema bersih Light Mode & Dark Mode dengan aksen Merah Crimson.
 */

import React, { useState } from "react";
import { ScoreGauge } from "../common/ScoreGauge";
import { PlayerRadarChart } from "../common/PlayerRadarChart";
import { PlayerVisionCard } from "../player/PlayerVisionCard";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { useAuth } from "../../context/AuthContext";
import {
  X,
  Crosshair,
  Shield,
  Activity,
  Heart,
  Zap,
  MapPin,
  Trophy,
  BookmarkCheck,
  Users,
  Check,
  Flame,
  ArrowRight,
  Printer,
} from "lucide-react";
import { ScoutingReportModal } from "./ScoutingReportModal";

export const PlayerDetailModal = ({ player, onClose }) => {
  const { role } = useAuth();
  const isManager = String(role || "").toLowerCase().trim() === "manager";
  const {
    addToShortlist,
    addToCompare,
    comparedPlayers,
    shortlist,
    players,
    playerHistory,
    playerProfile,
    playerAvatar,
  } = usePlayerStore();
  const [activePlayer, setActivePlayer] = useState(player);
  const [shortlistSuccess, setShortlistSuccess] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [activeTab, setActiveTab] = useState("vision"); // "vision" | "stats" | "matches"
  const [showReportModal, setShowReportModal] = useState(false);

  // Sinkronkan activePlayer jika prop player berubah
  React.useEffect(() => {
    setActivePlayer(player);
  }, [player]);

  // Cek apakah pemain yang sedang dibuka adalah akun atlet saat ini
  const isCurrentCandidateUser = Boolean(
    activePlayer?.is_current_user ||
    (playerProfile?.ign && (activePlayer?.IGN || "").toLowerCase().trim() === playerProfile.ign.toLowerCase().trim()) ||
    (activePlayer?.Player_ID && String(activePlayer.Player_ID).startsWith("USR-"))
  );

  // Temukan seluruh sesi match yang di-upload oleh kandidat ini
  const candidateMatches = React.useMemo(() => {
    if (!activePlayer) return [];
    const playerIgn = (activePlayer.IGN || "").toLowerCase().trim();

    if (isCurrentCandidateUser && playerHistory && playerHistory.length > 0) {
      // Petakan 4 riwayat sesi atlet agar lengkap ditampilkan di tab Sesi Match
      return playerHistory.map((h, idx) => ({
        Player_ID: h.id || `MATCH-#${idx + 1}`,
        IGN: playerProfile?.ign || activePlayer.IGN || "HIRAKO SHINJI",
        Map: h.map || "Erangel",
        Tier: h.tier || "Crown",
        Kills: Number(h.kills ?? 0),
        Damage_Dealt: Number(h.damage_dealt ?? 0),
        Survival_Time_Minutes: Number(h.survival_time_minutes ?? 0),
        Headshot_Percentage: Number(h.headshot_percentage ?? 0),
        Assists: Number(h.assists ?? 0),
        Revives: Number(h.revives ?? 0),
        Distance_Travelled_km: Number(h.distance_travelled_km ?? 0),
        Longest_Kill_meters: Number(h.longest_kill_meters ?? 0),
        Heals_Used: Number(h.heals_used ?? 0),
        Boosts_Used: Number(h.boosts_used ?? 0),
        Match_Rank: Number(h.match_rank ?? 5),
        Win: h.match_rank === 1 ? 1 : 0,
        Favorite_Weapon: h.favorite_weapon || "M416",
        Player_Score: Number(h.player_score ?? 0),
        Score_Category: h.score_category || "Menengah",
        created_at: h.date || new Date().toISOString(),
        is_current_user: true,
      }));
    }

    if (!playerIgn) return [activePlayer];
    const matched = (players || []).filter(
      (p) => (p.IGN || "").toLowerCase().trim() === playerIgn
    );
    return matched.length > 0 ? matched : [activePlayer];
  }, [activePlayer, players, playerHistory, playerProfile, isCurrentCandidateUser]);

  // Agregat statistik seluruh sesi upload
  const avgScore = React.useMemo(() => {
    if (!candidateMatches || candidateMatches.length === 0) return 0;
    const sum = candidateMatches.reduce((acc, m) => acc + (Number(m.Player_Score) || 0), 0);
    return (sum / candidateMatches.length).toFixed(1);
  }, [candidateMatches]);

  const avgKills = React.useMemo(() => {
    if (!candidateMatches || candidateMatches.length === 0) return 0;
    const sum = candidateMatches.reduce((acc, m) => acc + (Number(m.Kills) || 0), 0);
    return (sum / candidateMatches.length).toFixed(1);
  }, [candidateMatches]);

  const avgDamage = React.useMemo(() => {
    if (!candidateMatches || candidateMatches.length === 0) return 0;
    const sum = candidateMatches.reduce((acc, m) => acc + (Number(m.Damage_Dealt) || 0), 0);
    return (sum / candidateMatches.length).toFixed(1);
  }, [candidateMatches]);

  const isAlreadyShortlisted = activePlayer && Array.isArray(shortlist)
    ? shortlist.some((item) => item.Player_ID === activePlayer.Player_ID)
    : false;
  const isAlreadyCompared = activePlayer && Array.isArray(comparedPlayers)
    ? comparedPlayers.some((p) => p.Player_ID === activePlayer.Player_ID)
    : false;

  const handleAddShortlist = () => {
    if (!activePlayer) return;
    addToShortlist(activePlayer, notes);
    setShortlistSuccess(true);
    setTimeout(() => setShortlistSuccess(false), 2500);
    setShowNotesInput(false);
  };

  if (!activePlayer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {activePlayer.Player_ID}
              </span>
              <span className="text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider">
                {activePlayer.Tier}
              </span>
              {candidateMatches.length > 1 && (
                <span className="text-xs font-gaming font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-600" />
                  {candidateMatches.length} Sesi Match Di-upload
                </span>
              )}
            </div>
            <h2 className="text-2xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
              {activePlayer.IGN || `Player ${activePlayer.Player_ID}`}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Map Sesi Ini: <strong className="text-zinc-800 dark:text-zinc-200">{activePlayer.Map || "Semua Map"}</strong> • Senjata:{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">{activePlayer.Favorite_Weapon || "M416"}</strong>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-gaming font-bold tracking-wider flex items-center gap-1.5 transition-all bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer"
              title="Pratinjau & Cetak Dokumen Laporan Scouting Resmi (A4 PDF)"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>DOWNLOAD PDF</span>
            </button>

            {/* Tombol Khusus Manager: Bandingkan & Shortlist */}
            {isManager && (
              <>
                <button
                  onClick={() => addToCompare(activePlayer)}
                  disabled={isAlreadyCompared}
                  className={`px-3.5 py-2 rounded-xl text-xs font-gaming font-bold tracking-wider flex items-center gap-1.5 transition-all ${
                    isAlreadyCompared
                      ? "bg-red-600/15 text-red-600 border border-red-600/40"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{isAlreadyCompared ? "DALAM KOMPARASI" : "BANDINGKAN"}</span>
                </button>

                <button
                  onClick={() => setShowNotesInput(!showNotesInput)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-gaming font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAlreadyShortlisted
                      ? "bg-red-600/15 text-red-600 border border-red-600/40"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                  }`}
                >
                  {shortlistSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>TERSIMPAN!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      <span>{isAlreadyShortlisted ? "DI SHORTLIST" : "+ SHORTLIST"}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Shortlist Notes Input Dropdown (Hanya Manager) */}
        {isManager && showNotesInput && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-2 animate-fadeIn">
            <label className="block text-xs font-gaming text-zinc-700 dark:text-zinc-300 uppercase">
              Catatan Scout (Opsional untuk rapat tim e-sport):
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pemain ini sangat kuat di late game, rotasi rapi, cocok untuk role Rusher..."
              className="w-full p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotesInput(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleAddShortlist}
                className="px-4 py-1.5 rounded-lg text-xs font-gaming font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Simpan ke Shortlist
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher: Vision Scout Card vs Technical Stats vs All Matches */}
        <div className="flex items-center gap-2 my-5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("vision")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-gaming font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "vision"
                ? "bg-red-600 text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>KARTU SCOUT VISION</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-gaming font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "stats"
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DETAIL STATISTIK TEKNIS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-gaming font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "matches"
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>SEMUA SESI MATCH ({candidateMatches.length})</span>
          </button>
        </div>

        {activeTab === "vision" ? (
          <div className="pt-2 animate-fadeIn">
            <PlayerVisionCard
              playerData={{
                ...activePlayer,
                ign: activePlayer.IGN || activePlayer.Player_ID,
                isCurrentUser: isCurrentCandidateUser,
                is_current_user: isCurrentCandidateUser,
              }}
              scoreResult={{
                player_score: activePlayer.Player_Score,
                score_category: activePlayer.Score_Category,
              }}
              customAvatar={isCurrentCandidateUser ? playerAvatar : null}
            />
          </div>
        ) : activeTab === "matches" ? (
          /* TAB RIWAYAT SELURUH SESI UPLOAD DARI KANDIDAT INI */
          <div className="pt-2 space-y-5 animate-fadeIn">
            {/* KPI Agregat Kandidat */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">Total Sesi Upload</span>
                <p className="text-xl font-gaming font-bold text-zinc-900 dark:text-white mt-0.5">{candidateMatches.length} Match</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">Rata-rata Skor ML</span>
                <p className="text-xl font-gaming font-bold text-red-600 mt-0.5">{avgScore} / 100</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">Rata-rata Kills</span>
                <p className="text-xl font-gaming font-bold text-zinc-900 dark:text-white mt-0.5">{avgKills}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">Rata-rata Damage</span>
                <p className="text-xl font-gaming font-bold text-zinc-900 dark:text-white mt-0.5">{avgDamage}</p>
              </div>
            </div>

            {/* Tabel Sesi Pertandingan */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950/70">
              <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h4 className="text-xs font-gaming font-bold text-zinc-900 dark:text-white tracking-wider uppercase flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>Daftar Sesi Pertandingan ({activePlayer.IGN || "Kandidat"})</span>
                </h4>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Klik 'Lihat Sesi' untuk memuat statistik sesi ke Kartu Vision
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">ID Sesi</th>
                      <th className="py-2.5 px-3">Tier &amp; Map</th>
                      <th className="py-2.5 px-3 text-right">Kills</th>
                      <th className="py-2.5 px-3 text-right">Damage</th>
                      <th className="py-2.5 px-3 text-right">Headshot</th>
                      <th className="py-2.5 px-3 text-center">Rank</th>
                      <th className="py-2.5 px-3 text-center">Skor XGBoost</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono">
                    {candidateMatches.map((m, idx) => {
                      const isSelected = m.Player_ID === activePlayer.Player_ID;
                      return (
                        <tr
                          key={m.Player_ID || idx}
                          className={`hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-colors ${
                            isSelected ? "bg-red-600/10 text-red-600 font-bold" : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                            <span>{m.Player_ID}</span>
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <span className="font-semibold text-zinc-900 dark:text-white">{m.Tier}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-1.5 font-mono">({m.Map})</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-600">{m.Kills}</td>
                          <td className="py-2.5 px-3 text-right text-zinc-700 dark:text-zinc-200">
                            {Number(m.Damage_Dealt).toFixed(1)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-600 dark:text-zinc-300">
                            {Number(m.Headshot_Percentage).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                m.Match_Rank === 1
                                  ? "bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/40"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              #{m.Match_Rank}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[11px]">
                              {Number(m.Player_Score).toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isSelected ? (
                              <span className="text-[10px] text-red-600 font-bold font-sans">
                                Sedang Dilihat
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePlayer(m);
                                  setActiveTab("vision");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-700 dark:text-zinc-300 text-[10px] font-sans font-bold transition-colors flex items-center gap-1 mx-auto"
                              >
                                <span>Lihat Sesi</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Content: Radar Chart & Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-zinc-200 dark:border-zinc-800">
              {/* Score Gauge */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <ScoreGauge score={player.Player_Score} category={player.Score_Category} size="lg" />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono text-center mt-3">
                  Kalkulasi Model XGBoost
                </p>
              </div>

              {/* Radar Chart */}
              <div className="md:col-span-2 flex flex-col justify-center p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-gaming font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 pl-2">
                  Multi-Axis Radar Performance
                </h4>
                <PlayerRadarChart players={[player]} height={220} />
              </div>
            </div>

            {/* 16 Attributes Detailed Grid */}
            <div className="pt-6">
              <h3 className="text-sm font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-600" />
                <span>16 ATRIBUT STATISTIK PERTANDINGAN</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Combat Stats */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Total Kills</span>
                  <p className="text-lg font-gaming font-bold text-red-600">{player.Kills}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Damage Dealt</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">
                    {Number(player.Damage_Dealt).toFixed(1)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Headshot %</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">
                    {Number(player.Headshot_Percentage).toFixed(1)}%
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Longest Kill</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">
                    {Number(player.Longest_Kill_meters).toFixed(1)} m
                  </p>
                </div>

                {/* Survival Stats */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Survival Time</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">
                    {Number(player.Survival_Time_Minutes).toFixed(1)} m
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Match Rank</span>
                  <p className="text-lg font-gaming font-bold text-red-600">#{player.Match_Rank}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Distance Travelled</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">
                    {Number(player.Distance_Travelled_km).toFixed(1)} km
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Match Outcome</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">
                    {player.Win === 1 || player.Match_Rank === 1 ? (
                      <span className="text-emerald-500 font-bold">WWCD (Win)</span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">Defeat</span>
                    )}
                  </p>
                </div>

                {/* Teamwork Stats */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Assists</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{player.Assists}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Revives</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{player.Revives}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Heals Used</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{player.Heals_Used}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Boosts Used</span>
                  <p className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{player.Boosts_Used}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Official AI Scouting Report Print Modal */}
      {showReportModal && (
        <ScoutingReportModal
          player={activePlayer}
          notes={notes}
          customAvatar={isCurrentCandidateUser ? playerAvatar : null}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
