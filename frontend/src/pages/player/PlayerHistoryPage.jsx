/**
 * frontend/src/pages/player/PlayerHistoryPage.jsx
 * Halaman Riwayat Perkembangan Skor Pemain dengan grafik Recharts LineChart dan tabel riwayat (FR-10).
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { PlayerVisionCard } from "../../components/player/PlayerVisionCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Crosshair,
  Calendar,
  Award,
  ArrowRight,
  Zap,
  Eye,
  X,
  Sparkles,
  Printer,
  Trophy,
  Lock,
  Upload,
  EyeOff,
  Trash2,
} from "lucide-react";
import { ScoutingReportModal } from "../../components/modals/ScoutingReportModal";

export const PlayerHistoryPage = () => {
  const {
    playerHistory,
    playerProfile,
    playerAvatar,
    publishMatchToLeaderboard,
    unpublishMatchFromLeaderboard,
    deleteMatchHistory,
  } = usePlayerStore();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [reportMatch, setReportMatch] = useState(null);

  const getBadgeClass = (category) => {
    switch (category) {
      case "Master":
      case "Elite":
        return "badge-master";
      case "Berpotensi":
      case "Tinggi":
        return "badge-berpotensi";
      case "Mahir":
        return "badge-mahir";
      case "Menengah":
        return "badge-menengah";
      case "Pemula":
      case "Rendah":
      default:
        return "badge-pemula";
    }
  };

  // Format data untuk grafik (urutan kronologis dari terlama ke terbaru)
  const chartData = [...playerHistory].reverse().map((item, idx) => ({
    match: `Match ${idx + 1}`,
    date: item.date,
    score: Number(item.player_score) || 0,
    kills: item.kills,
  }));

  const avgScore =
    playerHistory.length > 0
      ? (
          playerHistory.reduce((acc, curr) => acc + (Number(curr.player_score) || 0), 0) /
          playerHistory.length
        ).toFixed(1)
      : 0;

  const highestScore =
    playerHistory.length > 0
      ? Math.max(...playerHistory.map((h) => Number(h.player_score) || 0)).toFixed(1)
      : 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            PERFORMANCE EVOLUTION TRACKER (FR-10)
          </div>
          <h1 className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
            RIWAYAT PERKEMBANGAN SKOR
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Lacak konsistensi dan grafik kenaikan Player Score Anda dari setiap sesi pertandingan yang Anda masukkan.
          </p>
        </div>

        <Link
          to="/player/input"
          className="px-5 py-2.5 rounded-xl text-xs font-gaming font-bold tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-sm flex items-center gap-2 uppercase transition-all"
        >
          <Crosshair className="w-4 h-4" />
          <span>+ INPUT MATCH BARU</span>
        </Link>
      </div>

      {playerHistory.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-600/30">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white mb-2">
            BELUM ADA RIWAYAT PERTANDINGAN
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
            Masukkan statistik match PUBG Mobile Anda pada modul kalkulator skor untuk mulai melacak grafik performa Anda.
          </p>
          <Link
            to="/player/input"
            className="px-6 py-2.5 rounded-xl text-xs font-gaming font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm inline-flex items-center gap-2 uppercase"
          >
            <span>HITUNG SKOR PERTAMA SAYA</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Match Tercatat</span>
              <p className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white mt-1">{playerHistory.length}</p>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Sesi Pertandingan</span>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Rata-rata Skor Saya</span>
              <p className="text-3xl font-gaming font-bold text-red-600 mt-1">{avgScore}</p>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Skala 0 s/d 100</span>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Skor Tertinggi (Peak)</span>
              <p className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white mt-1">{highestScore}</p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <Award className="w-3.5 h-3.5" /> Rekor Pribadi Terbaik
              </span>
            </div>
          </div>

          {/* Recharts LineChart: Score Progression */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Grafik Progres Player Score
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
              Tren perkembangan skor kemampuan pemain dari waktu ke waktu:
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(113, 113, 122, 0.2)" />
                  <XAxis
                    dataKey="match"
                    stroke="#71717a"
                    tick={{ fill: "#71717a", fontSize: 11, fontFamily: "Rajdhani" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#71717a"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "Outfit",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Player Score"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: "#dc2626", stroke: "#ffffff", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Tabel Riwayat Pertandingan Sebelumnya
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-gaming uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                  <tr>
                    <th className="py-3 px-3.5">Tanggal Input</th>
                    <th className="py-3 px-3.5">Tier</th>
                    <th className="py-3 px-3.5">Kills</th>
                    <th className="py-3 px-3.5">Damage</th>
                    <th className="py-3 px-3.5">Rank</th>
                    <th className="py-3 px-3.5">Player Score</th>
                    <th className="py-3 px-3.5">Kategori</th>
                    <th className="py-3 px-3.5">Status Leaderboard</th>
                    <th className="py-3 px-3.5 text-center">Aksi Pertandingan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono text-xs whitespace-nowrap">
                  {playerHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-sans flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        <span>{item.date}</span>
                      </td>
                      <td className="py-3 px-4 font-gaming font-bold text-zinc-800 dark:text-zinc-300">{item.tier}</td>
                      <td className="py-3 px-4 text-zinc-900 dark:text-white font-bold">{item.kills}</td>
                      <td className="py-3 px-4 text-zinc-800 dark:text-zinc-300">{Number(item.damage_dealt).toFixed(1)}</td>
                      <td className="py-3 px-4 text-red-600 font-bold">#{item.match_rank}</td>
                      <td className="py-3 px-4 text-zinc-900 dark:text-white font-bold text-sm">
                        {Number(item.player_score).toFixed(1)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-gaming font-bold uppercase ${getBadgeClass(item.score_category)}`}>
                          {item.score_category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.is_published ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-gaming font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>PUBLIK</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-gaming font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>PRIBADI</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedMatch(item)}
                            className="py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[10px] font-gaming font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Lihat Kartu Scout Vision"
                          >
                            <Eye className="w-3 h-3 text-red-600" />
                            <span>KARTU</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReportMatch(item)}
                            className="py-1 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-gaming font-bold flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                            title="Unduh / Cetak Laporan Scouting Resmi (A4 PDF)"
                          >
                            <Printer className="w-3 h-3 text-white" />
                            <span>PDF</span>
                          </button>

                          {/* Tombol Tampilkan / Sembunyikan dari Leaderboard */}
                          {item.is_published ? (
                            <button
                              type="button"
                              onClick={() => unpublishMatchFromLeaderboard(item.id)}
                              className="py-1 px-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px] font-gaming font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Sembunyikan dari Leaderboard (jadikan catatan pribadi)"
                            >
                              <EyeOff className="w-3 h-3 text-zinc-500" />
                              <span>SEMBUNYIKAN</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => publishMatchToLeaderboard(item.id)}
                              className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-gaming font-bold flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                              title="Tampilkan sesi ini ke Scouting Leaderboard Manajer"
                            >
                              <Upload className="w-3 h-3 text-white" />
                              <span>TAMPILKAN</span>
                            </button>
                          )}

                          {/* Tombol Hapus Match */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Hapus catatan statistik pertandingan ini dari riwayat?")) {
                                deleteMatchHistory(item.id);
                              }
                            }}
                            className="py-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-[10px] font-gaming font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Hapus pertandingan ini"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>HAPUS</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Kartu Scout Vision untuk Match Terpilih */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl bg-[#09090b] dark:bg-[#09090b] light:bg-[#ffffff]">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 border border-zinc-700 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <PlayerVisionCard
              playerData={{
                ...selectedMatch,
                ign: selectedMatch.ign || playerProfile?.ign || "HIRAKO SHINJI",
                IGN: selectedMatch.ign || playerProfile?.ign || "HIRAKO SHINJI",
                gameId: playerProfile?.gameId || selectedMatch.gameId || "5123984729",
                Player_ID: selectedMatch.Player_ID || `MATCH-${selectedMatch.id}`,
                isCurrentUser: true,
                is_current_user: true,
              }}
              scoreResult={{
                player_score: selectedMatch.player_score,
                score_category: selectedMatch.score_category,
              }}
              customAvatar={playerAvatar}
            />
          </div>
        </div>
      )}

      {/* Official AI Scouting Report Modal (PDF / Print A4) */}
      {reportMatch && (
        <ScoutingReportModal
          player={{
            ...reportMatch,
            IGN: reportMatch.ign || playerProfile?.ign || "HIRAKO SHINJI",
            gameId: playerProfile?.gameId || reportMatch.gameId || "5123984729",
            Player_ID: reportMatch.Player_ID || `MATCH-${reportMatch.id}`,
            Player_Score: reportMatch.player_score,
            Score_Category: reportMatch.score_category,
            Tier: reportMatch.tier,
            Kills: reportMatch.kills,
            Damage_Dealt: reportMatch.damage_dealt,
            Survival_Time_Minutes: reportMatch.survival_time_minutes,
            Headshot_Percentage: reportMatch.headshot_percentage,
            Assists: reportMatch.assists,
            Revives: reportMatch.revives,
            Distance_Travelled_km: reportMatch.distance_travelled_km,
            Longest_Kill_meters: reportMatch.longest_kill_meters,
            Heals_Used: reportMatch.heals_used,
            Boosts_Used: reportMatch.boosts_used,
            Match_Rank: reportMatch.match_rank,
            Map: reportMatch.map,
            Favorite_Weapon: reportMatch.favorite_weapon,
            isCurrentUser: true,
            is_current_user: true,
          }}
          customAvatar={playerAvatar}
          notes={`Laporan Resmi Pertandingan tanggal ${reportMatch.date} terverifikasi model Machine Learning XGBoost.`}
          onClose={() => setReportMatch(null)}
        />
      )}
    </div>
  );
};
