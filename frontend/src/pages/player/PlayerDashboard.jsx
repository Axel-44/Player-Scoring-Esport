/**
 * frontend/src/pages/player/PlayerDashboard.jsx
 * Dashboard Utama Personal Atlet / Player E-Sports:
 * 1. Bagian Atas: Featured Pro Hero Showcase Slider
 * 2. Welcome Banner Karir Atlet dengan IGN, ID Game, dan Status Verifikasi
 * 3. 4 Kartu Metrik Performa (Skor XGBoost Terkini, Skor Puncak, Total Match, Avg Damage)
 * 4. Grafik Tren Skor Historis (AreaChart) & Tombol Cepat Input Match
 * 5. Mini Leaderboard Preview (Top 5 Peringkat Teratas)
 * 6. Widget Agenda Turnamen Terkini (PMSL SEA & PMGC Hub)
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { FeaturedPlayerHeroSlider } from "../../components/common/FeaturedPlayerHeroSlider";
import { getPlayerAvatar } from "../../utils/avatarUtils";
import esportsData from "../../data/esportsNews.json";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  User,
  Crosshair,
  TrendingUp,
  Trophy,
  Sparkles,
  ArrowRight,
  Activity,
  Flame,
  Shield,
  Zap,
  Calendar,
  ChevronRight,
  Award,
  Globe,
  Gamepad2,
  CheckCircle,
  Bell,
} from "lucide-react";

export const PlayerDashboard = () => {
  const { user, profile } = useAuth();
  const isDemo = (user?.email || "").toLowerCase().trim() === "player@esports-talent.id";

  const {
    playerHistory,
    playerAvatar,
    playerProfile,
    players,
    notifications,
    unreadNotificationsCount,
  } = usePlayerStore();

  const activeIGN =
    playerProfile?.ign || profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || (isDemo ? "BTR_Ryzen" : "Player");
  const activeGameId = playerProfile?.gameId || (isDemo ? "5123984729" : "-");

  // Data match terbaru & agregat
  const totalMatches = playerHistory?.length || 0;
  const latestMatch = totalMatches > 0 ? playerHistory[0] : null;
  const latestScore = latestMatch?.player_score
    ? Number(latestMatch.player_score).toFixed(1)
    : (isDemo ? "84.5" : "-");
  const latestCategory = latestMatch?.score_category || (isDemo ? "Tinggi" : "Belum Ada Data");

  const bestScore =
    totalMatches > 0
      ? Math.max(...playerHistory.map((h) => Number(h.player_score) || 0)).toFixed(1)
      : (isDemo ? "84.5" : "-");

  const avgKills =
    totalMatches > 0
      ? (
          playerHistory.reduce((acc, curr) => acc + (Number(curr.kills) || 0), 0) /
          totalMatches
        ).toFixed(1)
      : (isDemo ? "6.0" : "0");

  const avgDamage =
    totalMatches > 0
      ? (
          playerHistory.reduce((acc, curr) => acc + (Number(curr.damage_dealt) || 0), 0) /
          totalMatches
        ).toFixed(0)
      : (isDemo ? "650" : "0");

  // Format data untuk AreaChart (kronologis dari match terlama ke terbaru)
  const chartData =
    totalMatches > 0
      ? [...playerHistory].reverse().map((h, i) => ({
          name: `M#${i + 1}`,
          date: h.date || `M${i + 1}`,
          score: Number(h.player_score) || 0,
          kills: Number(h.kills) || 0,
        }))
      : (isDemo
          ? [
              { name: "M#1", date: "Match 1", score: 72.0, kills: 4 },
              { name: "M#2", date: "Match 2", score: 78.5, kills: 5 },
              { name: "M#3", date: "Match 3", score: 84.5, kills: 6 },
            ]
          : []);

  // Cuplikan Top 5 Pemain di Leaderboard
  const topFivePlayers = [...players]
    .sort((a, b) => (Number(b.Player_Score) || 0) - (Number(a.Player_Score) || 0))
    .slice(0, 5);

  // Cuplikan Turnamen Aktif
  const activeTournament = esportsData?.tournaments?.[0] || null;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. HERO SHOWCASE SLIDER PRO ATHLETE */}
      <FeaturedPlayerHeroSlider />

      {/* 2. WELCOME BANNER KARIR ATLET */}
      <div className="rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5] dark:bg-[#18181b] relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left flex-1">
            {/* Foto Avatar Atlet */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0 shadow-sm flex items-center justify-center">
              {playerAvatar ? (
                <img
                  src={playerAvatar}
                  alt={activeIGN}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <User className="w-10 h-10 text-zinc-400" />
              )}
            </div>

            {/* Nama & Status */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 text-red-600 border border-red-600/30 text-[10px] font-gaming font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-red-600" />
                  <span>ATLET TERVERIFIKASI</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <Gamepad2 className="w-3.5 h-3.5 text-zinc-400" />
                  ID: {activeGameId}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                SELAMAT DATANG, {activeIGN}!
              </h1>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
                Pantau perkembangan skor evaluasi Machine Learning XGBoost Anda, siapkan portofolio
                Scout Vision, dan bersiaplah dilirik manajer tim e-sports profesional.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/player/input"
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Crosshair className="w-4 h-4" />
              <span>+ INPUT MATCH BARU</span>
            </Link>

            <Link
              to="/player/profile"
              className="py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <User className="w-4 h-4 text-red-600" />
              <span>PROFIL & KARTU VISION</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2b. ALERT NOTIFIKASI SCOUTING REKRUTMEN (JIKA ADA PESAN DARI MANAJER) */}
      {unreadNotificationsCount > 0 && notifications[0] && (
        <div className="p-4 rounded-2xl bg-red-600/10 border border-red-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-gaming font-bold text-red-600 dark:text-red-400 uppercase">
                  {notifications[0].title}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  • {notifications[0].timestamp}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 line-clamp-1 mt-0.5">
                {notifications[0].message}
              </p>
            </div>
          </div>
          <Link
            to={notifications[0].actionUrl || "/teams"}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>{notifications[0].actionLabel || "Buka Pesan"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. 4 KARTU METRIK KPI KARIR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skor Terakhir */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              SKOR AI TERAKHIR
            </span>
            <Sparkles className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-red-600">{latestScore}</span>
            <span className="text-xs font-mono text-zinc-400">/ 100 PTS</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Tingkat Klasifikasi:</span>
            <span className="font-gaming font-bold text-zinc-900 dark:text-white px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              {latestCategory}
            </span>
          </div>
        </div>

        {/* Skor Puncak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              SKOR PUNCAK (BEST)
            </span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
              {bestScore}
            </span>
            <span className="text-xs font-mono text-zinc-400">PTS</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Total Sesi Diinput:</span>
            <span className="font-gaming font-bold text-zinc-900 dark:text-white">
              {totalMatches} Pertandingan
            </span>
          </div>
        </div>

        {/* Rata-rata Kills */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              RATA-RATA ELIMINASI
            </span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
              {avgKills}
            </span>
            <span className="text-xs font-mono text-zinc-400">KILLS / MATCH</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Agresivitas Fragger:</span>
            <span className="font-gaming font-bold text-emerald-600">Optimal</span>
          </div>
        </div>

        {/* Rata-rata Damage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              RATA-RATA DAMAGE
            </span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
              {avgDamage}
            </span>
            <span className="text-xs font-mono text-zinc-400">DMG / MATCH</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Dampak Tempur:</span>
            <span className="font-gaming font-bold text-red-600">Tinggi</span>
          </div>
        </div>
      </div>

      {/* 4. DUA KOLOM UTAMA: GRAFIK TREN SKOR & PREVIEW TOP 5 LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri (7/12): Tren Skor Historis Recharts */}
        <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>TRAJEKTORI PERKEMBANGAN SKOR PERTANDINGAN</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Grafik skor inferensi XGBoost dari setiap sesi pertandingan yang Anda input.
              </p>
            </div>

            <Link
              to="/player/history"
              className="text-xs font-gaming font-bold text-red-600 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Riwayat Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Area Chart / State Kosong */}
          <div className="h-60 w-full pt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40">
                <Activity className="w-8 h-8 text-zinc-400 mb-2" />
                <p className="text-zinc-700 dark:text-zinc-300 font-gaming font-bold text-xs uppercase tracking-wider">
                  Belum Ada Riwayat Pertandingan
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  Trajektori performa akan otomatis digambar setelah Anda menginputkan data statistik match pertama.
                </p>
                <Link
                  to="/player/input"
                  className="mt-3 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-gaming font-bold uppercase rounded-xl transition-all shadow-sm"
                >
                  + Input Match Pertama
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="playerScoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    domain={[30, 100]}
                    tickLine={false}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-xl bg-zinc-900 text-white border border-zinc-700 text-xs shadow-xl font-mono">
                            <p className="font-bold font-gaming text-red-400">{data.date}</p>
                            <p className="mt-1">
                              Skor ML: <strong className="text-white">{data.score}</strong> Pts
                            </p>
                            <p>Kills: {data.kills}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#playerScoreGradient)"
                    dot={{ fill: "#dc2626", r: 4 }}
                    activeDot={{ r: 6, fill: "#ef4444" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">Status Tren Karir:</span>
            <span className="text-emerald-600 font-gaming font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>KONSISTENSI MENINGKAT (+12.5%)</span>
            </span>
          </div>
        </div>

        {/* Kolom Kanan (5/12): Mini Leaderboard Preview */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-red-600" />
                <span>TOP 5 KANDIDAT GLOBAL</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Tolok ukur standar skor persaingan di Leaderboard saat ini.
              </p>
            </div>

            <Link
              to="/manager/leaderboard"
              className="text-xs font-gaming font-bold text-red-600 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Semua Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Roster List Top 5 */}
          <div className="space-y-2.5">
            {topFivePlayers.map((p, idx) => {
              const avatar = getPlayerAvatar(p);
              return (
                <div
                  key={p.Player_ID}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-gaming font-bold text-xs shrink-0 ${
                        idx === 0
                          ? "bg-red-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-300 dark:border-zinc-700">
                      <img
                        src={avatar}
                        alt={p.IGN || p.Player_ID}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-gaming font-bold text-zinc-900 dark:text-white truncate">
                        {p.IGN || p.Player_ID}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 truncate">
                        {p.Tier} • {p.Favorite_Weapon || "M416"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-gaming font-black text-red-600 block">
                      {Number(p.Player_Score || 0).toFixed(1)}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {p.Kills} Kills
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/manager/leaderboard"
            className="w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>JELAJAHI 2.500+ PEMAIN DI LEADERBOARD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. WIDGET TURNAMEN ESPORTS HUB AKTIF */}
      {activeTournament && (
        <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5] dark:bg-[#18181b] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-600 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-gaming font-bold uppercase bg-red-600 text-white">
                  {activeTournament.status}
                </span>
                <span className="text-xs font-mono text-zinc-500">{activeTournament.dates}</span>
              </div>
              <h3 className="text-lg font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-wide mt-1">
                {activeTournament.title} — {activeTournament.subtitle}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl mt-1">
                {activeTournament.summary}
              </p>
            </div>
          </div>

          <Link
            to="/esports"
            className="py-2.5 px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all shadow-sm"
          >
            <span>BUKA ESPORTS HUB</span>
            <ArrowRight className="w-4 h-4 text-red-600" />
          </Link>
        </div>
      )}
    </div>
  );
};

