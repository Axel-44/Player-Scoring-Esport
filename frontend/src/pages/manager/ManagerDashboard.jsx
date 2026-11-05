/**
 * frontend/src/pages/manager/ManagerDashboard.jsx
 * Dashboard Pusat Komando & Analitik Scouting Manager E-Sports:
 * 1. Bagian Atas: Featured Pro Hero Showcase Slider
 * 2. Header Eksekutif: Overview Status Rekrutmen & Scouting
 * 3. 4 Kartu KPI Utama: Total Talenta, Jumlah Shortlist, Rata-rata Skor ML, Prospek Tertinggi
 * 4. Analisis Sebaran Role & Komposisi Squad
 * 5. Widget Quick Shortlist Squad (Kandidat Prioritas Terkini)
 * 6. Top 5 Prospek Rekomendasi Sistem Machine Learning
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { FeaturedPlayerHeroSlider } from "../../components/common/FeaturedPlayerHeroSlider";
import { getPlayerAvatar, getPlayerRoleInfo } from "../../utils/avatarUtils";
import {
  Users,
  Trophy,
  BookmarkCheck,
  TrendingUp,
  Crosshair,
  Shield,
  Activity,
  Flame,
  ArrowRight,
  ChevronRight,
  Award,
  ExternalLink,
  Target,
  BarChart3,
} from "lucide-react";

export const ManagerDashboard = () => {
  const { user, profile } = useAuth();
  const { players, shortlist } = usePlayerStore();

  const managerName = profile?.full_name || user?.email?.split("@")[0] || "Manager";

  // Agregasi Data Pemain
  const totalTalents = players.length;
  const shortlistCount = shortlist.length;

  const avgMLScore =
    totalTalents > 0
      ? (
          players.reduce((acc, curr) => acc + (Number(curr.Player_Score) || 0), 0) /
          totalTalents
        ).toFixed(1)
      : "74.2";

  const topProspect =
    totalTalents > 0
      ? [...players].sort(
          (a, b) => (Number(b.Player_Score) || 0) - (Number(a.Player_Score) || 0)
        )[0]
      : null;

  // Sebaran Role Pemain
  const roleCounts = players.reduce(
    (acc, p) => {
      const info = getPlayerRoleInfo(p);
      if (info.category === "Fraggers") acc.fraggers++;
      else if (info.category === "Snipers") acc.snipers++;
      else if (info.category === "Zone Controllers") acc.controllers++;
      else acc.support++;
      return acc;
    },
    { fraggers: 0, snipers: 0, controllers: 0, support: 0 }
  );

  // Top 5 Rekomendasi Prospek
  const topFiveProspects = [...players]
    .sort((a, b) => (Number(b.Player_Score) || 0) - (Number(a.Player_Score) || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. HERO SHOWCASE SLIDER PRO ATHLETE */}
      <FeaturedPlayerHeroSlider />

      {/* 2. HEADER EKSEKUTIF MANAGER */}
      <div className="rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5] dark:bg-[#18181b] relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 text-red-600 border border-red-600/30 text-[10px] font-gaming font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-600" />
                <span>EXECUTIVE SCOUT PORTAL</span>
              </span>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                PULSE SCOUT TALENT HUB
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-wide">
              PUSAT KOMANDO SCOUTING & ANALITIK
            </h1>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Selamat datang kembali, <strong>{managerName}</strong>. Pantau database 2.500+ atlet
              e-sports, tinjau hasil inferensi model Machine Learning XGBoost, dan kelola shortlist
              kandidat prioritas squad Anda.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/manager/leaderboard"
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Trophy className="w-4 h-4" />
              <span>BUKA LEADERBOARD</span>
            </Link>

            <Link
              to="/manager/shortlists"
              className="py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <BookmarkCheck className="w-4 h-4 text-red-600" />
              <span>SHORTLIST ({shortlistCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 4 KARTU METRIK KPI UTAMA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Talenta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              TOTAL ATLET TERPANTAU
            </span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
              {totalTalents.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-mono text-zinc-400">PEMAIN</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Dataset ML:</span>
            <span className="font-gaming font-bold text-zinc-900 dark:text-white">Kaggle Benchmark</span>
          </div>
        </div>

        {/* Shortlist Squad */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              KANDIDAT DI SHORTLIST
            </span>
            <BookmarkCheck className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-red-600">{shortlistCount}</span>
            <span className="text-xs font-mono text-zinc-400">KANDIDAT</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Status Rekrutmen:</span>
            <Link to="/manager/shortlists" className="font-gaming font-bold text-red-600 hover:underline">
              Kelola Squad &rarr;
            </Link>
          </div>
        </div>

        {/* Rata-rata Skor ML */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              RATA-RATA SKOR TALENTA
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
              {avgMLScore}
            </span>
            <span className="text-xs font-mono text-zinc-400">/ 100 PTS</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Evaluasi AI:</span>
            <span className="font-gaming font-bold text-emerald-600">Model XGBoost</span>
          </div>
        </div>

        {/* Top Scorer Prospek */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-[11px] font-gaming font-bold uppercase tracking-wider">
              PROSPEK TERTINGGI (#1)
            </span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
              {topProspect ? Number(topProspect.Player_Score).toFixed(1) : "96.2"}
            </span>
            <span className="text-xs font-mono text-zinc-400">PTS</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono truncate max-w-[100px]">
              {topProspect?.IGN || "BTR_Zuxxy"}
            </span>
            <span className="font-gaming font-bold text-red-600">Rank #1</span>
          </div>
        </div>
      </div>

      {/* 4. DUA KOLOM: SEBARAN ROLE TALENTA & QUICK SHORTLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri (7/12): Sebaran Role & Komposisi Squad */}
        <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-600" />
                <span>KOMPOSISI PERAN TALENTA (ROLE BREAKDOWN)</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Sebaran role e-sports 2.500 kandidat berdasarkan kalkulasi gaya bermain.
              </p>
            </div>

            <Link
              to="/manager/leaderboard"
              className="text-xs font-gaming font-bold text-red-600 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Filter Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Role Progress Bars */}
          <div className="space-y-4 pt-1">
            {/* Fraggers / Rusher */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-gaming font-bold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Flame className="w-3.5 h-3.5 text-red-600" />
                  <span>FRAGGER / RUSHER</span>
                </span>
                <span className="text-zinc-500 font-mono">
                  {roleCounts.fraggers} Pemain (
                  {totalTalents > 0 ? ((roleCounts.fraggers / totalTalents) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full"
                  style={{
                    width: `${totalTalents > 0 ? (roleCounts.fraggers / totalTalents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Snipers / Marksman */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-gaming font-bold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>SNIPER / MARKSMAN</span>
                </span>
                <span className="text-zinc-500 font-mono">
                  {roleCounts.snipers} Pemain (
                  {totalTalents > 0 ? ((roleCounts.snipers / totalTalents) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${totalTalents > 0 ? (roleCounts.snipers / totalTalents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Zone Controllers */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-gaming font-bold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Shield className="w-3.5 h-3.5 text-cyan-500" />
                  <span>ZONE CONTROLLER</span>
                </span>
                <span className="text-zinc-500 font-mono">
                  {roleCounts.controllers} Pemain (
                  {totalTalents > 0 ? ((roleCounts.controllers / totalTalents) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{
                    width: `${totalTalents > 0 ? (roleCounts.controllers / totalTalents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Support / IGL */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-gaming font-bold">
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SUPPORT / IGL</span>
                </span>
                <span className="text-zinc-500 font-mono">
                  {roleCounts.support} Pemain (
                  {totalTalents > 0 ? ((roleCounts.support / totalTalents) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${totalTalents > 0 ? (roleCounts.support / totalTalents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">Fitur Pencarian:</span>
            <Link
              to="/manager/leaderboard"
              className="text-zinc-900 dark:text-white hover:text-red-600 font-gaming font-bold flex items-center gap-1 transition-colors"
            >
              <span>BUKA KATALOG LEADERBOARD LENGKAP &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan (5/12): Quick Shortlist Panel */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-red-600" />
                <span>SHORTLIST PRIORITAS SQUAD</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kandidat yang sedang Anda pantau untuk rekrutmen.
              </p>
            </div>

            <Link
              to="/manager/shortlists"
              className="text-xs font-gaming font-bold text-red-600 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Kelola Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Shortlist Items or Empty State */}
          {shortlist.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <BookmarkCheck className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-gaming font-bold text-zinc-700 dark:text-zinc-300">
                BELUM ADA KANDIDAT DI SHORTLIST
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 mb-4">
                Buka Leaderboard untuk menambahkan kandidat potensial ke dalam daftar pantauan.
              </p>
              <Link
                to="/manager/leaderboard"
                className="py-1.5 px-4 rounded-xl bg-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>CARI KANDIDAT</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shortlist.slice(0, 4).map((item) => {
                const avatar = getPlayerAvatar(item);
                return (
                  <div
                    key={item.Player_ID}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-300 dark:border-zinc-700">
                        <img
                          src={avatar}
                          alt={item.IGN || item.Player_ID}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-gaming font-bold text-zinc-900 dark:text-white truncate">
                          {item.IGN || item.Player_ID}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate italic">
                          "{item.notes || 'Kandidat potensial'}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-gaming font-black text-red-600 block">
                        {Number(item.Player_Score || 0).toFixed(1)}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">
                        {item.Tier}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            to="/manager/shortlists"
            className="w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>BUKA SHORTLIST LENGKAP ({shortlistCount} KANDIDAT)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. TOP 5 PROSPEK REKOMENDASI MACHINE LEARNING */}
      <div className="rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-red-600" />
              <span>TOP 5 KANDIDAT SKOR TERTINGGI (XGBOOST ML HIGHEST RANKED)</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Kandidat dengan performa indeks Machine Learning tertinggi dari 2.500 data pemain.
            </p>
          </div>

          <Link
            to="/manager/leaderboard"
            className="py-1.5 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-gaming font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
          >
            <span>LIHAT 2.500+ DI LEADERBOARD</span>
            <ExternalLink className="w-3.5 h-3.5 text-red-600" />
          </Link>
        </div>

        {/* Top 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          {topFiveProspects.map((p, idx) => {
            const avatar = getPlayerAvatar(p);
            const roleInfo = getPlayerRoleInfo(p);
            return (
              <div
                key={p.Player_ID}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-gaming font-bold text-xs ${
                        idx === 0
                          ? "bg-red-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-gaming font-bold uppercase px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {p.Tier}
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-3 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                    <img
                      src={avatar}
                      alt={p.IGN || p.Player_ID}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <h3 className="text-sm font-gaming font-bold text-zinc-900 dark:text-white text-center truncate">
                    {p.IGN || p.Player_ID}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono text-center truncate mt-0.5">
                    {roleInfo.title.split("/")[0]} • {p.Favorite_Weapon || "M416"}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[10px]">Skor AI:</span>
                  <span className="text-base font-gaming font-black text-red-600">
                    {Number(p.Player_Score || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
