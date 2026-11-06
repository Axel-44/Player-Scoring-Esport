/**
 * frontend/src/pages/manager/LeaderboardPage.jsx
 * E-Sports Scouting Roster & Leaderboard terinspirasi oleh visual "Goal Rush - My Team".
 * Menampilkan:
 * 1. Top KPI Summary Cards (Kandidat Terpilih, Rata-rata Skor, Shortlist Squad)
 * 2. Role Filter Tabs (Semua Role, Fraggers, Snipers, Zone Controllers, Support/IGL)
 * 3. Roster Card Grid dengan foto atlet e-sports unik untuk setiap akun pemain
 * 4. Interactive Spotlight Panel di sisi kanan dengan foto beresolusi tinggi, quick stats, radar chart, dan aksi
 * 5. Toggle View Mode antara "Roster Grid" (Goal Rush) dan "Tabel Data" komprehensif
 */

import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { useAuth } from "../../context/AuthContext";
import { PlayerDetailModal } from "../../components/modals/PlayerDetailModal";
import { ScoutingReportModal } from "../../components/modals/ScoutingReportModal";
import { ShortlistInviteModal } from "../../components/modals/ShortlistInviteModal";
import { FeaturedPlayerHeroSlider } from "../../components/common/FeaturedPlayerHeroSlider";
import { getPlayerAvatar, getPlayerRoleInfo, getPlayerRecruitmentInfo } from "../../utils/avatarUtils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Trophy,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  BookmarkCheck,
  RotateCcw,
  ArrowUpDown,
  X,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Crosshair,
  Activity,
  ChevronRight as ChevronRightIcon,
  Target,
  Flame,
  BarChart3,
  Printer,
  Briefcase,
} from "lucide-react";

export const LeaderboardPage = ({ hideHeroSlider = false }) => {
  const { role } = useAuth();
  const isManager = String(role || "").toLowerCase().trim() === "manager";
  const {
    players,
    addToShortlist,
    addToCompare,
    comparedPlayers,
    shortlist,
    removeFromCompare,
    managerTeam,
  } = usePlayerStore();

  // View Mode: "grid" (Goal Rush Roster) or "table" (Classic Data Table)
  const [viewMode, setViewMode] = useState("grid");

  // Sumber Data: "active" (Talenta Aktif Riil Terdaftar) | "benchmark" (Dataset Riset ML 2.500 Data Kaggle)
  const [dataSourceTab, setDataSourceTab] = useState("active");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleCategory, setSelectedRoleCategory] = useState("ALL");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedMap, setSelectedMap] = useState("ALL");
  const [selectedRecruitmentStatus, setSelectedRecruitmentStatus] = useState("ALL");
  const [minScore, setMinScore] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState("Player_Score");
  const [sortDirection, setSortDirection] = useState("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 12 cards per page fits 3x4 or 4x3 grid perfectly

  // Interactive Spotlight Player (for the Right Panel)
  const [spotlightPlayer, setSpotlightPlayer] = useState(null);

  // Modal State for Full Vision Card / Details
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [reportPlayer, setReportPlayer] = useState(null);
  const [shortlistTargetPlayer, setShortlistTargetPlayer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showTierDistribution, setShowTierDistribution] = useState(false);

  const tiers = ["ALL", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crown", "Ace", "Conqueror"];
  const maps = ["ALL", "Erangel", "Miramar", "Sanhok", "Livik", "Vikendi"];

  const roleCategories = [
    { id: "ALL", label: "Semua Role", icon: Trophy },
    { id: "Fraggers", label: "Rusher / Fragger" },
    { id: "Snipers", label: "Sniper / Marksman" },
    { id: "Zone Controllers", label: "Zone Controller" },
    { id: "Support / IGL", label: "Support / IGL" },
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Helper untuk memisahkan Talenta Riil Terdaftar vs Dataset Anonim CSV Kaggle
  const isRealActiveTalent = (p) => {
    return (
      p.is_current_user ||
      p.isCurrentUser ||
      Boolean(p.created_at) ||
      (p.Player_ID && String(p.Player_ID).startsWith("USR-")) ||
      p.isVerifiedPro ||
      ["BTR_Ryzen", "Zuxxy", "Luxxy", "Rosemary", "Ryzen"].includes(p.IGN)
    );
  };

  const activeTalentsCount = useMemo(() => {
    return players.filter(isRealActiveTalent).length;
  }, [players]);

  const benchmarkDatasetCount = useMemo(() => {
    return players.filter((p) => !isRealActiveTalent(p)).length;
  }, [players]);

  // Filter & Sort Logic
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        // 0. Filter Tab Sumber Data: "active" (Talenta Riil) vs "benchmark" (2.500 Data Kaggle)
        const isReal = isRealActiveTalent(p);
        if (dataSourceTab === "active" && !isReal) return false;
        if (dataSourceTab === "benchmark" && isReal) return false;

        // 1. Search IGN / Player_ID
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          !query ||
          (p.IGN && p.IGN.toLowerCase().includes(query)) ||
          p.Player_ID.toLowerCase().includes(query);

        // 2. Filter Role Category
        const roleInfo = getPlayerRoleInfo(p);
        const matchesRole =
          selectedRoleCategory === "ALL" || roleInfo.category === selectedRoleCategory;

        // 3. Filter Tier
        const matchesTier = selectedTier === "ALL" || p.Tier === selectedTier;

        // 4. Filter Map
        const matchesMap = selectedMap === "ALL" || p.Map === selectedMap;

        // 5. Filter Status Rekrutmen
        const recInfo = getPlayerRecruitmentInfo(p);
        let matchesRecruitment = true;
        if (selectedRecruitmentStatus === "FREE_AGENT") {
          matchesRecruitment = recInfo.isFreeAgent;
        } else if (selectedRecruitmentStatus === "OPEN_OFFERS") {
          matchesRecruitment = recInfo.isOpenOffers;
        } else if (selectedRecruitmentStatus === "CONTRACTED") {
          matchesRecruitment = recInfo.isContracted;
        }

        // 6. Filter Skor Min
        const matchesScore = (Number(p.Player_Score) || 0) >= minScore;

        return (
          matchesQuery &&
          matchesRole &&
          matchesTier &&
          matchesMap &&
          matchesRecruitment &&
          matchesScore
        );
      })
      .sort((a, b) => {
        const valA = Number(a[sortField]) || 0;
        const valB = Number(b[sortField]) || 0;
        return sortDirection === "desc" ? valB - valA : valA - valB;
      });
  }, [
    players,
    dataSourceTab,
    searchTerm,
    selectedRoleCategory,
    selectedTier,
    selectedMap,
    selectedRecruitmentStatus,
    minScore,
    sortField,
    sortDirection,
  ]);

  // Pagination calculations
  const totalItems = filteredPlayers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlayers.slice(start, start + pageSize);
  }, [filteredPlayers, currentPage, pageSize]);

  // Keep spotlightPlayer synchronized with the current candidate pool
  useEffect(() => {
    if (paginatedPlayers.length > 0) {
      const stillInList = paginatedPlayers.some(
        (p) => p.Player_ID === spotlightPlayer?.Player_ID
      );
      if (!stillInList || !spotlightPlayer) {
        setSpotlightPlayer(paginatedPlayers[0]);
      }
    } else {
      setSpotlightPlayer(null);
    }
  }, [paginatedPlayers, spotlightPlayer]);

  // Top KPI calculations
  const topStats = useMemo(() => {
    if (filteredPlayers.length === 0) return { avg: "0.0", top: "0.0" };
    const sum = filteredPlayers.reduce(
      (acc, p) => acc + (Number(p.Player_Score) || 0),
      0
    );
    const avg = (sum / filteredPlayers.length).toFixed(1);
    const top = Math.max(
      ...filteredPlayers.map((p) => Number(p.Player_Score) || 0)
    ).toFixed(1);
    return { avg, top };
  }, [filteredPlayers]);

  // Sebaran 5 Talent Tier Pemain untuk BarChart ML
  const tierDistributionData = useMemo(() => {
    if (!players || players.length === 0) return [];
    const counts = {
      Pemula: players.filter((p) => p.Score_Category === "Pemula" || p.Score_Category === "Rendah").length,
      Menengah: players.filter((p) => p.Score_Category === "Menengah").length,
      Mahir: players.filter((p) => p.Score_Category === "Mahir").length,
      Berpotensi: players.filter((p) => p.Score_Category === "Berpotensi" || p.Score_Category === "Tinggi").length,
      Master: players.filter((p) => p.Score_Category === "Master" || p.Score_Category === "Elite").length,
    };
    return [
      { name: "Pemula (0-20)", count: counts.Pemula, color: "#EF4444" },
      { name: "Menengah (20-40)", count: counts.Menengah, color: "#F59E0B" },
      { name: "Mahir (40-60)", count: counts.Mahir, color: "#3B82F6" },
      { name: "Berpotensi (60-80)", count: counts.Berpotensi, color: "#06B6D4" },
      { name: "Master (80-100)", count: counts.Master, color: "#10B981" },
    ];
  }, [players]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRoleCategory("ALL");
    setSelectedTier("ALL");
    setSelectedMap("ALL");
    setMinScore(0);
    setCurrentPage(1);
  };

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

  // Mini Chart Data for the Spotlight player
  const spotlightChartData = useMemo(() => {
    if (!spotlightPlayer) return [];
    const kills = Number(spotlightPlayer.Kills || 0);
    const damage = Number(spotlightPlayer.Damage_Dealt || 0);
    const hs = Number(spotlightPlayer.Headshot_Percentage || 0);
    const surv = Number(spotlightPlayer.Survival_Time_Minutes || 0);
    const rank = Number(spotlightPlayer.Match_Rank || 50);

    return [
      { metric: "Combat", value: Math.min(100, Math.round(damage / 10 + kills * 5)) },
      { metric: "Aim", value: Math.min(100, Math.round(hs * 2.2)) },
      { metric: "Survival", value: Math.min(100, Math.round(surv * 3.2)) },
      { metric: "Placement", value: Math.max(10, Math.round(100 - rank * 1.5)) },
      { metric: "Rating", value: Math.round(Number(spotlightPlayer.Player_Score || 70)) },
    ];
  }, [spotlightPlayer]);

  const activeSpotlightRole = spotlightPlayer ? getPlayerRoleInfo(spotlightPlayer) : null;
  const activeSpotlightRecruitment = spotlightPlayer ? getPlayerRecruitmentInfo(spotlightPlayer) : null;
  const isSpotlightShortlisted = spotlightPlayer
    ? shortlist.some((p) => p.Player_ID === spotlightPlayer.Player_ID)
    : false;
  const isSpotlightCompared = spotlightPlayer
    ? comparedPlayers.some((p) => p.Player_ID === spotlightPlayer.Player_ID)
    : false;

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-zinc-900 dark:text-zinc-200">
      {/* 1. Bagian Paling Atas: Featured Pro Hero Showcase Slider */}
      {!hideHeroSlider && <FeaturedPlayerHeroSlider />}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl glass-panel border border-red-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-red-600" />
          <span className="text-xs font-gaming font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Title & View Mode Switcher */}
      <div id="roster-grid" className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 scroll-mt-20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            SCOUTING ROSTER & TALENT GRID
          </div>
          <h1 className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide flex items-center gap-3">
            <span>LEADERBOARD KANDIDAT ATLET</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-600/10 border border-red-600/30 text-red-600 dark:text-red-400">
              {filteredPlayers.length} Kandidat
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Eksplorasi profil visual talenta PUBG Mobile berbasis Player Score (0-100) hasil inferensi XGBoost.
          </p>
        </div>

        {/* View Mode Toggle & Reset */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => {
                setViewMode("grid");
                setPageSize(12);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-gaming font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ROSTER GRID</span>
            </button>
            <button
              onClick={() => {
                setViewMode("table");
                setPageSize(25);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-gaming font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>TABEL DATA</span>
            </button>
          </div>

          <button
            onClick={() => setShowTierDistribution((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-gaming font-bold transition-all flex items-center gap-1.5 border ${
              showTierDistribution
                ? "bg-red-600/10 text-red-600 dark:text-red-400 border-red-600/30 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-red-600" />
            <span>DISTRIBUSI TIER</span>
          </button>

          <button
            onClick={resetFilters}
            className="px-3.5 py-2 rounded-xl text-xs font-gaming font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* DATA SOURCE SWITCHER: Talenta Aktif vs Dataset Riset ML Kaggle */}
      <div className="glass-panel rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Tab 1: Talenta Aktif & Terverifikasi */}
          <button
            type="button"
            onClick={() => {
              setDataSourceTab("active");
              setCurrentPage(1);
            }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
              dataSourceTab === "active"
                ? "bg-red-600/10 border-red-600/40 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-600/30"
                : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  dataSourceTab === "active"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-gaming font-bold text-sm text-zinc-900 dark:text-white truncate">
                    Talenta Aktif & Terverifikasi
                  </span>
                  <span className="text-[9px] font-gaming font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    LIVE SCOUTING
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  Atlet riil terdaftar & akun aktif yang siap di-trial tim esport
                </p>
              </div>
            </div>
            <div className="text-right pl-3 shrink-0">
              <span className="text-xl font-gaming font-black text-zinc-900 dark:text-white">
                {activeTalentsCount}
              </span>
              <span className="text-[10px] block text-zinc-500 uppercase font-gaming">Atlet</span>
            </div>
          </button>

          {/* Tab 2: Dataset Riset ML 2.500 Data Kaggle */}
          <button
            type="button"
            onClick={() => {
              setDataSourceTab("benchmark");
              setCurrentPage(1);
            }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
              dataSourceTab === "benchmark"
                ? "bg-red-600/10 border-red-600/40 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-600/30"
                : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  dataSourceTab === "benchmark"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-gaming font-bold text-sm text-zinc-900 dark:text-white truncate">
                    Dataset Riset Machine Learning
                  </span>
                  <span className="text-[9px] font-gaming font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    BENCHMARK
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  Arsip 2.500 data pemain CSV Kaggle untuk validasi model XGBoost
                </p>
              </div>
            </div>
            <div className="text-right pl-3 shrink-0">
              <span className="text-xl font-gaming font-black text-zinc-900 dark:text-white">
                {benchmarkDatasetCount}
              </span>
              <span className="text-[10px] block text-zinc-500 uppercase font-gaming">Data</span>
            </div>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Players Count */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              {dataSourceTab === "active" ? "Talenta Aktif Terdaftar" : "Dataset Riset ML (Kaggle)"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white">
                {paginatedPlayers.length}
              </span>
              <span className="text-sm font-gaming text-zinc-500 dark:text-zinc-400">
                / {filteredPlayers.length} (Total {players.length})
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              Halaman {currentPage} dari {totalPages}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Score Stats */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              Rata-rata Skor
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-gaming font-black text-red-600">
                {topStats.avg}
              </span>
              <span className="text-xs font-gaming text-zinc-500 dark:text-zinc-400">PTS</span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              Skor Tertinggi Terfilter: {topStats.top} PTS
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Shortlist Recruitment Squad */}
        <Link
          to="/manager/shortlists"
          className="glass-panel rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-red-600/50 transition-all group shadow-sm"
        >
          <div>
            <span className="text-[11px] font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              Shortlist Rekrutmen
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-gaming font-black text-zinc-900 dark:text-white group-hover:text-red-600 transition-colors">
                {shortlist.length}
              </span>
              <span className="text-sm font-gaming text-zinc-500 dark:text-zinc-400">/ 20 Target</span>
            </div>
            <span className="text-[10px] text-red-600 flex items-center gap-1 mt-1 font-semibold">
              <span>Buka Daftar Shortlist</span>
              <ChevronRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <BookmarkCheck className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* COLLAPSIBLE 5 TALENT TIER DISTRIBUTION BARCHART */}
      {showTierDistribution && (
        <div className="glass-panel rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Sebaran 5 Talent Tier PUBG Mobile (Total: {players.length} Pemain)
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Model XGBoost Regressor (R² ~ 83.45%)</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Pemula (0-20), Menengah (20-40), Mahir (40-60), Berpotensi (60-80), Master (80-100).
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  tick={{ fill: "#71717a", fontSize: 11, fontFamily: "Rajdhani" }}
                />
                <YAxis stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {tierDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ROLE FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {roleCategories.map((role) => {
          const Icon = role.icon;
          const isActive = selectedRoleCategory === role.id;
          return (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRoleCategory(role.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>

      {/* FILTER & SEARCH DRAWER */}
      <div className="glass-panel rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari IGN atau Player ID (cth: P1, P922, Max)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          {/* Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              {tiers.map((t) => (
                <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  Tier: {t}
                </option>
              ))}
            </select>
          </div>

          {/* Map Filter */}
          <div>
            <select
              value={selectedMap}
              onChange={(e) => {
                setSelectedMap(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              {maps.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  Map: {m}
                </option>
              ))}
            </select>
          </div>

          {/* Recruitment Status Filter */}
          <div>
            <select
              value={selectedRecruitmentStatus}
              onChange={(e) => {
                setSelectedRecruitmentStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer font-medium"
            >
              <option value="ALL" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                Status: Semua Transfer
              </option>
              <option value="FREE_AGENT" className="bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-bold">
                ● Free Agent (Siap Trial)
              </option>
              <option value="OPEN_OFFERS" className="bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400">
                ● Open to Offers
              </option>
              <option value="CONTRACTED" className="bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400">
                ● Under Contract
              </option>
            </select>
          </div>
        </div>

        {/* Secondary Filter: Min Score Slider */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              Min Skor ML: <strong className="text-red-600 font-gaming">{minScore}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => {
                setMinScore(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:inline font-mono">
            Rentang Skor Model XGBoost (0 - 100)
          </span>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT AREA: GOAL RUSH ROSTER GRID OR TABLE VIEW
          ========================================================================= */}
      {viewMode === "grid" ? (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* LEFT SECTION: 3-4 Column Roster Cards Grid */}
          <div className="w-full lg:flex-1 space-y-4">
            {paginatedPlayers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {paginatedPlayers.map((player, idx) => {
                  const isSelected = spotlightPlayer?.Player_ID === player.Player_ID;
                  const roleInfo = getPlayerRoleInfo(player);
                  const recruitmentInfo = getPlayerRecruitmentInfo(player);
                  const playerAvatar = getPlayerAvatar(player);
                  const isShortlisted = shortlist.some(
                    (p) => p.Player_ID === player.Player_ID
                  );
                  const globalRank = (currentPage - 1) * pageSize + idx + 1;

                  const candidateMatchCount = players.filter(
                    (p) =>
                      (p.IGN || "").toLowerCase().trim() ===
                      (player.IGN || "").toLowerCase().trim()
                  ).length;

                  return (
                    <div
                      key={player.Player_ID}
                      onClick={() => setSpotlightPlayer(player)}
                      className={`group relative rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-red-600 border-red-600 shadow-md bg-zinc-100 dark:bg-zinc-800/90"
                          : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      {/* Top Bar on Card: Rank Badge & Score Badge */}
                      <div className="w-full flex items-center justify-between text-[10px] mb-2 z-10">
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full font-mono bg-zinc-100 dark:bg-black/60 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 font-bold">
                            #{globalRank}
                          </span>
                          {candidateMatchCount > 1 && (
                            <span
                              className="px-1.5 py-0.5 rounded-full font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 text-[9px]"
                              title={`${candidateMatchCount} sesi pertandingan di-upload oleh pemain ini`}
                            >
                              {candidateMatchCount}M
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-gaming font-bold ${getBadgeClass(
                            player.Score_Category
                          )}`}
                        >
                          {Number(player.Player_Score).toFixed(1)}
                        </span>
                      </div>

                      {/* Player Cutout / Portrait Photo */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-2 flex items-center justify-center">
                        {/* Player Image */}
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={playerAvatar}
                            alt={player.IGN || player.Player_ID}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                          />
                        </div>

                        {/* Shortlist Icon Indicator */}
                        {isShortlisted && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <BookmarkCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Player Name (IGN) */}
                      <h3
                        className={`text-sm font-gaming font-bold truncate w-full tracking-wide transition-colors ${
                          isSelected
                            ? "text-red-600"
                            : "text-zinc-900 dark:text-white group-hover:text-red-600"
                        }`}
                      >
                        {player.IGN || player.Player_ID}
                      </h3>

                      {/* Recruitment Status & Team Pill */}
                      <div className="my-1 flex items-center justify-center w-full">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-gaming font-bold uppercase tracking-wider flex items-center gap-1 border truncate max-w-full shadow-xs ${recruitmentInfo.badgeColor}`}
                          title={`Status: ${recruitmentInfo.status} | Tim: ${recruitmentInfo.team}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${recruitmentInfo.dotColor}`} />
                          <span className="truncate">{recruitmentInfo.team}</span>
                        </span>
                      </div>

                      {/* Role & Position Subtitle */}
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate w-full">
                        {roleInfo.title.split("/")[0].trim()},{" "}
                        {player.Favorite_Weapon || player.Tier}
                      </p>

                      {/* Tier Pill */}
                      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 w-full flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-gaming text-zinc-700 dark:text-zinc-300 font-bold">{player.Tier}</span>
                        <span className="font-mono text-red-600 font-bold">
                          {player.Kills} Kills
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                Tidak ada kandidat pemain yang cocok dengan filter pencarian.
              </div>
            )}

            {/* Pagination Controls */}
            <div className="p-4 glass-panel rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <div>
                Halaman <strong className="text-zinc-900 dark:text-white">{currentPage}</strong> dari{" "}
                <strong className="text-zinc-900 dark:text-white">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 dark:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-mono text-zinc-900 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 dark:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: STICKY SPOTLIGHT PANEL (Like Goal Rush's "Leo Lawrence" spotlight) */}
          <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 sticky top-20 space-y-4">
            {spotlightPlayer ? (
              <div className="glass-panel rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
                {/* Header Subtitle */}
                <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-200 dark:border-zinc-800/80">
                  <span className="font-gaming font-bold text-red-600 tracking-wider flex items-center gap-1.5 uppercase">
                    <Target className="w-3.5 h-3.5" />
                    KANDIDAT SPOTLIGHT
                  </span>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400">
                    ID: {spotlightPlayer.Player_ID}
                  </span>
                </div>

                {/* Large Player Portrait Box */}
                <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <img
                    src={getPlayerAvatar(spotlightPlayer)}
                    alt={spotlightPlayer.IGN || spotlightPlayer.Player_ID}
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Gradient Fade at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-900/60 via-zinc-900/20 to-transparent pointer-events-none" />

                  {/* Score Pill Overlay */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-gaming font-black text-sm shadow-sm flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-red-600" />
                    <span>{Number(spotlightPlayer.Player_Score).toFixed(1)}</span>
                  </div>

                  {/* Role Tag Pill */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-gaming font-bold uppercase border shadow-sm ${activeSpotlightRole?.bgBadge}`}
                    >
                      {activeSpotlightRole?.tag}
                    </span>
                  </div>
                </div>

                {/* Player Name & Role */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
                      {spotlightPlayer.IGN || spotlightPlayer.Player_ID}
                    </h2>
                    {players.filter(
                      (p) =>
                        (p.IGN || "").toLowerCase().trim() ===
                        (spotlightPlayer.IGN || "").toLowerCase().trim()
                    ).length > 1 && (
                      <span className="text-[10px] font-gaming font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                        {
                          players.filter(
                            (p) =>
                              (p.IGN || "").toLowerCase().trim() ===
                              (spotlightPlayer.IGN || "").toLowerCase().trim()
                          ).length
                        }{" "}
                        Sesi Match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span className="text-red-600 font-gaming font-semibold">
                      {activeSpotlightRole?.title}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                      {spotlightPlayer.Tier}
                    </span>
                  </div>
                </div>

                {/* Team & Transfer Status in Spotlight */}
                {activeSpotlightRecruitment && (
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-mono">
                          Tim Organisasi
                        </span>
                        <span className="font-gaming font-bold text-zinc-900 dark:text-white text-sm truncate block">
                          {activeSpotlightRecruitment.team}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-xs shrink-0 ${activeSpotlightRecruitment.badgeColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeSpotlightRecruitment.dotColor}`} />
                      <span>{activeSpotlightRecruitment.status}</span>
                    </span>
                  </div>
                )}

                {/* Team, Map & Weapon Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase">Senjata</span>
                      <span className="font-gaming font-bold text-zinc-900 dark:text-white truncate block">
                        {spotlightPlayer.Favorite_Weapon || "M416"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase">Map Favorit</span>
                      <span className="font-gaming font-bold text-zinc-900 dark:text-white truncate block">
                        {spotlightPlayer.Map || "Erangel"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Quick Stats */}
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/90 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span className="font-gaming uppercase">TOTAL KILLS:</span>
                    <span className="font-gaming font-bold text-zinc-900 dark:text-white text-sm">
                      {spotlightPlayer.Kills} <span className="text-zinc-500 text-xs">Eliminasi</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span className="font-gaming uppercase">DAMAGE DEALT:</span>
                    <span className="font-mono font-bold text-red-600 text-sm">
                      {Number(spotlightPlayer.Damage_Dealt).toFixed(0)} HP
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span className="font-gaming uppercase">HEADSHOT ACCURACY:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                      {Number(spotlightPlayer.Headshot_Percentage).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span className="font-gaming uppercase">SURVIVAL DURATION:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                      {Number(spotlightPlayer.Survival_Time_Minutes).toFixed(1)} Menit
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
                    <span className="font-gaming uppercase">MATCH RANK:</span>
                    <span className="font-gaming font-bold text-zinc-900 dark:text-white text-sm">
                      #{spotlightPlayer.Match_Rank}
                    </span>
                  </div>
                </div>

                {/* Mini Performance Curve Chart */}
                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-gaming uppercase text-zinc-500 dark:text-zinc-400">
                      Kurva Metrik Performa
                    </span>
                    <span className="font-mono text-red-600 font-bold">
                      {Number(spotlightPlayer.Player_Score).toFixed(1)} PTS
                    </span>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={spotlightChartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="redCurve" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="metric"
                          tick={{ fill: "#71717a", fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#dc2626",
                            borderRadius: "8px",
                            fontSize: "11px",
                            color: "#ffffff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#dc2626"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#redCurve)"
                          dot={{ fill: "#dc2626", r: 3 }}
                          activeDot={{ r: 5, fill: "#ef4444" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Full Statistics Button */}
                <button
                  onClick={() => setSelectedPlayer(spotlightPlayer)}
                  className="w-full py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-white" />
                  <span>LIHAT KARTU VISION LENGKAP & STATS</span>
                  <ChevronRightIcon className="w-3.5 h-3.5 text-white/80" />
                </button>

                {/* Direct PDF Download Button */}
                <button
                  onClick={() => setReportPlayer(spotlightPlayer)}
                  className="w-full py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-zinc-700 dark:border-zinc-300"
                  title="Unduh Laporan Scouting Resmi (A4 PDF)"
                >
                  <Printer className="w-4 h-4 text-red-600" />
                  <span>DOWNLOAD LAPORAN SCOUTING (PDF)</span>
                </button>

                {/* Action Buttons Khusus Manager: Shortlist & Compare */}
                {isManager && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (isSpotlightShortlisted) {
                          showToast("Pemain sudah ada di dalam shortlist.");
                        } else {
                          setShortlistTargetPlayer(spotlightPlayer);
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSpotlightShortlisted
                          ? "bg-zinc-100 dark:bg-zinc-800 text-red-600 border border-red-600/40"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 shadow-sm"
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>{isSpotlightShortlisted ? "TERDAFTAR" : "+ SHORTLIST"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isSpotlightCompared) {
                          removeFromCompare(spotlightPlayer.Player_ID);
                        } else {
                          addToCompare(spotlightPlayer);
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSpotlightCompared
                          ? "bg-zinc-100 dark:bg-zinc-800 text-red-600 border border-red-600/40"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 shadow-sm"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isSpotlightCompared ? "DIKOMPARASI" : "KOMPARASI"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* =========================================================================
            TABLE VIEW (Classic Detailed View with individual avatar portraits)
           ========================================================================= */
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-100 dark:bg-zinc-900/90 text-xs font-gaming uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Pemain / ID</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                    onClick={() => handleSort("Tier")}
                  >
                    Tier
                  </th>
                  <th className="py-3.5 px-4">STATUS & TIM</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-red-600"
                    onClick={() => handleSort("Player_Score")}
                  >
                    <div className="flex items-center gap-1">
                      <span>PLAYER SCORE</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                    onClick={() => handleSort("Kills")}
                  >
                    <div className="flex items-center gap-1">
                      <span>KILLS</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                    onClick={() => handleSort("Damage_Dealt")}
                  >
                    <div className="flex items-center gap-1">
                      <span>DAMAGE</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                    onClick={() => handleSort("Match_Rank")}
                  >
                    <div className="flex items-center gap-1">
                      <span>RANK</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">MAP & SENJATA</th>
                  <th className="py-3.5 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {paginatedPlayers.length > 0 ? (
                  paginatedPlayers.map((player, idx) => {
                    const globalRank = (currentPage - 1) * pageSize + idx + 1;
                    const isCompared = comparedPlayers.some(
                      (p) => p.Player_ID === player.Player_ID
                    );
                    const isShortlisted = shortlist.some(
                      (p) => p.Player_ID === player.Player_ID
                    );
                    const roleInfo = getPlayerRoleInfo(player);
                    const recruitmentInfo = getPlayerRecruitmentInfo(player);
                    const playerAvatar = getPlayerAvatar(player);

                    return (
                      <tr
                        key={player.Player_ID}
                        className="hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center font-gaming font-bold text-zinc-500 dark:text-zinc-400">
                          {globalRank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white inline-flex items-center justify-center text-xs font-bold">
                              1
                            </span>
                          ) : globalRank <= 3 ? (
                            <span className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white inline-flex items-center justify-center text-xs font-bold">
                              {globalRank}
                            </span>
                          ) : (
                            globalRank
                          )}
                        </td>

                        {/* Player IGN, Avatar Thumbnail & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-950 shrink-0 relative">
                              <img
                                src={playerAvatar}
                                alt={player.IGN || player.Player_ID}
                                className="w-full h-full object-cover object-top"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-gaming font-bold text-zinc-900 dark:text-white text-base group-hover:text-red-600 transition-colors">
                                {player.IGN || player.Player_ID}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-500">
                                {player.Player_ID} • {roleInfo.title}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-gaming font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {player.Tier}
                          </span>
                        </td>

                        {/* Status Rekrutmen & Tim */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-gaming font-bold uppercase border whitespace-nowrap ${recruitmentInfo.badgeColor}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${recruitmentInfo.dotColor}`} />
                            <span>{recruitmentInfo.team}</span>
                          </span>
                        </td>

                        {/* Player Score & Category */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-gaming font-bold text-lg text-zinc-900 dark:text-white">
                              {Number(player.Player_Score).toFixed(1)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-gaming font-bold uppercase ${getBadgeClass(
                                player.Score_Category
                              )}`}
                            >
                              {player.Score_Category}
                            </span>
                          </div>
                        </td>

                        {/* Kills */}
                        <td className="py-3.5 px-4 font-gaming font-semibold text-zinc-900 dark:text-white">
                          {player.Kills}
                        </td>

                        {/* Damage */}
                        <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300 text-xs">
                          {Number(player.Damage_Dealt).toFixed(1)}
                        </td>

                        {/* Rank */}
                        <td className="py-3.5 px-4 font-gaming font-bold text-zinc-900 dark:text-white">
                          #{player.Match_Rank}
                        </td>

                        {/* Map & Weapon */}
                        <td className="py-3.5 px-4 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>{player.Map}</span> •{" "}
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {player.Favorite_Weapon || "-"}
                          </span>
                        </td>

                        {/* Quick Action Buttons */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Detail button */}
                            <button
                              onClick={() => setSelectedPlayer(player)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Lihat Detail Statistik"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Download / Print PDF button */}
                            <button
                              onClick={() => setReportPlayer(player)}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Download Laporan Scouting PDF Resmi (A4)"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Actions Khusus Manager: Compare & Shortlist */}
                            {isManager && (
                              <>
                                <button
                                  onClick={() => {
                                    if (isCompared) {
                                      removeFromCompare(player.Player_ID);
                                    } else {
                                      addToCompare(player);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isCompared
                                      ? "text-red-600 bg-red-600/10"
                                      : "text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  }`}
                                  title={
                                    isCompared
                                      ? "Keluarkan dari komparasi"
                                      : "Tambahkan ke komparasi"
                                  }
                                >
                                  <Users className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (isShortlisted) {
                                      showToast("Pemain sudah ada di dalam shortlist.");
                                    } else {
                                      setShortlistTargetPlayer(player);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isShortlisted
                                      ? "text-red-600 bg-red-600/10"
                                      : "text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  }`}
                                  title="Tambah ke Shortlist"
                                >
                                  <BookmarkCheck className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                      Tidak ada kandidat pemain yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Navigation */}
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div>
              Halaman <strong className="text-zinc-900 dark:text-white">{currentPage}</strong> dari{" "}
              <strong className="text-zinc-900 dark:text-white">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 dark:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-mono text-zinc-900 dark:text-white font-bold">{currentPage}</span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 dark:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Dock (Khusus Manager - Muncul saat ada pemain yang dipilih untuk dikomparasi) */}
      {isManager && comparedPlayers.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 max-w-2xl mx-auto px-4 animate-slideUp">
          <div className="glass-panel rounded-2xl p-4 border border-red-600/40 bg-zinc-950/95 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/15 text-red-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-gaming font-bold text-white uppercase">
                  KOMPARASI AKTIF ({comparedPlayers.length}/3 PEMAIN)
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {comparedPlayers.map((p) => (
                    <span
                      key={p.Player_ID}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300"
                    >
                      {p.IGN || p.Player_ID}
                      <button
                        onClick={() => removeFromCompare(p.Player_ID)}
                        className="hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/manager/compare"
              className="px-4 py-2 rounded-xl text-xs font-gaming font-bold text-white bg-red-600 hover:bg-red-700 uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              <span>BUKA KOMPARASI</span>
            </Link>
          </div>
        </div>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Official AI Scouting Report Modal (PDF / Print A4) */}
      {reportPlayer && (
        <ScoutingReportModal
          player={reportPlayer}
          notes={reportPlayer.notes || "Laporan performa atlet resmi berdasarkan analisis statistik dan evaluasi model Machine Learning XGBoost."}
          onClose={() => setReportPlayer(null)}
        />
      )}

      {/* Shortlist Personal Invitation Modal (Manager Custom Message) */}
      {shortlistTargetPlayer && (
        <ShortlistInviteModal
          isOpen={Boolean(shortlistTargetPlayer)}
          onClose={() => setShortlistTargetPlayer(null)}
          player={shortlistTargetPlayer}
          managerTeam={managerTeam}
          onConfirm={(player, customMessage) => {
            const res = addToShortlist(player, customMessage);
            showToast(res.message);
          }}
        />
      )}
    </div>
  );
};
