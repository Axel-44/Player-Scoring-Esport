/**
 * frontend/src/layouts/MainLayout.jsx
 * Layout utama aplikasi PulseScout Monokrom Minimalis (Clean Dark & Light Mode):
 * - Skema warna monokrom murni:
 *   * Dark Mode: Background (#09090b), Card (#18181b), Border (#27272a), Teks (#ffffff)
 *   * Light Mode: Background (#ffffff), Card (#f4f4f5), Border (#e4e4e7), Teks (#09090b)
 *   * Aksen: Merah Crimson Solid (#dc2626)
 * - Header atas dilengkapi ThemeToggle (Matahari / Bulan) dengan animasi View Transition Circular Reveal.
 * - Sidebar collapsible dengan animasi transisi smooth.
 */

import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlayerStore } from "../context/PlayerStoreContext";
import { ThemeToggle } from "../components/common/ThemeToggle";
import {
  Crosshair,
  LayoutDashboard,
  Trophy,
  Users,
  BookmarkCheck,
  TrendingUp,
  Cpu,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  ChevronLeft,
  Globe,
  Bell,
  Trash2,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { ConfirmActionModal } from "../components/common/ConfirmActionModal";

const SIDEBAR_STORAGE_KEY = "pulse_scout_sidebar_collapsed";

export const MainLayout = () => {
  const { user, profile, role, logout, isSupabaseConfigured } = useAuth();
  const {
    playerAvatar,
    playerProfile,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    removeNotification,
  } = usePlayerStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // State sidebar collapsed (tersimpan di localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // State drawer mobile (buka / tutup di layar kecil)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Simpan state collapse ke localStorage saat berubah
  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // Cek konektivitas API backend FastAPI
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/health`);
        if (res.ok) {
          const data = await res.json();
          setBackendOnline(data.status === "ok");
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tutup drawer mobile otomatis saat rute berpindah
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Memicu modal konfirmasi keluar akun
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Eksekusi keluar akun setelah pengguna klik "Ya, Keluar Akun"
  const executeLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (err) {
      console.error("Gagal keluar:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Judul halaman aktif untuk breadcrumb top bar
  const getPageInfo = (pathname) => {
    if (pathname.includes("/player/dashboard"))
      return { title: "DASHBOARD KARIR ATLET", shortTitle: "DASHBOARD", tag: "MY CAREER" };
    if (pathname.includes("/player/profile"))
      return { title: "PROFIL ATLET & KARTU VISION", shortTitle: "PROFIL", tag: "PROFILE" };
    if (pathname.includes("/player/input"))
      return { title: "EVALUASI STATISTIK PERTANDINGAN", shortTitle: "KALKULASI SKOR", tag: "XGBOOST ML" };
    if (pathname.includes("/player/history"))
      return { title: "RIWAYAT SKOR & PERKEMBANGAN", shortTitle: "RIWAYAT SKOR", tag: "ANALYTICS" };
    if (pathname.includes("/manager/dashboard"))
      return { title: "DASHBOARD ANALITIK TALENTA", shortTitle: "DASHBOARD", tag: "MANAGEMENT" };
    if (pathname.includes("/manager/leaderboard"))
      return { title: "E-SPORTS ROSTER LEADERBOARD", shortTitle: "LEADERBOARD", tag: "SCOUTING" };
    if (pathname.includes("/manager/compare"))
      return { title: "KOMPARASI HEAD-TO-HEAD", shortTitle: "KOMPARASI", tag: "RADAR COMPARE" };
    if (pathname.includes("/manager/shortlists"))
      return { title: "SHORTLIST SQUAD KANDIDAT", shortTitle: "SHORTLIST", tag: "RECRUITMENT" };
    if (pathname.includes("/about-model"))
      return { title: "DOKUMENTASI MODEL MACHINE LEARNING", shortTitle: "TENTANG MODEL", tag: "DOCS" };
    if (pathname.includes("/esports"))
      return { title: "PORTAL ESPORTS & TOURNAMENT HUB", shortTitle: "ESPORTS HUB", tag: "LIQUIPEDIA" };
    if (pathname.includes("/manager/team-profile"))
      return { title: "MANAJEMEN PROFIL TIM & ROSTER", shortTitle: "PROFIL TIM", tag: "MY TEAM" };
    if (pathname.includes("/teams"))
      return { title: "DIREKTORI TIM ESPORTS & BURSA REKRUTMEN", shortTitle: "BURSA TIM", tag: "TEAM HUB" };
    return { title: "PULSE SCOUT TALENT SYSTEM", shortTitle: "PULSESCOUT", tag: "PUBG MOBILE" };
  };

  const currentPage = getPageInfo(location.pathname);

  // Kelompok navigasi Manager (Hanya Scouting, Leaderboard, Komparasi, Shortlist, Manajemen Tim, dan Sistem)
  const managerNavGroups = [
    {
      group: "SCOUTING & TALENTA",
      items: [
        { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/manager/leaderboard", label: "Leaderboard", icon: Trophy, badge: "Live" },
        { to: "/manager/compare", label: "Komparasi Pemain", icon: Users },
        { to: "/manager/shortlists", label: "Shortlist Squad", icon: BookmarkCheck },
        { to: "/esports", label: "Esports Hub", icon: Globe, badge: "PMSL" },
      ],
    },
    {
      group: "MANAJEMEN TIM",
      items: [
        { to: "/manager/team-profile", label: "Profil Tim Saya", icon: Shield, badge: "Roster" },
        { to: "/teams", label: "Direktori Tim", icon: Users },
      ],
    },
    {
      group: "SISTEM",
      items: [
        { to: "/about-model", label: "Tentang Model", icon: Cpu },
      ],
    },
  ];

  // Kelompok navigasi Player / Talent
  const playerNavGroups = [
    {
      group: "PROFIL & PERFORMA",
      items: [
        { to: "/player/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/player/profile", label: "Profil Saya", icon: User },
        { to: "/player/input", label: "Kalkulasi Skor", icon: Crosshair },
        { to: "/player/history", label: "Riwayat Skor", icon: TrendingUp },
      ],
    },
    {
      group: "SCOUTING & ESPORTS",
      items: [
        { to: "/manager/leaderboard", label: "Leaderboard", icon: Trophy, badge: "Top 20" },
        { to: "/teams", label: "Bursa & Roster Tim", icon: Shield, badge: "Trial" },
        { to: "/esports", label: "Esports Hub", icon: Globe, badge: "Live" },
      ],
    },
    {
      group: "SISTEM",
      items: [
        { to: "/about-model", label: "Tentang Model", icon: Cpu },
      ],
    },
  ];

  // Navigasi Guest
  const guestNavGroups = [
    {
      group: "PULSE SCOUT",
      items: [
        { to: "/esports", label: "Esports Hub", icon: Globe, badge: "Live" },
        { to: "/about-model", label: "Tentang Model", icon: Cpu },
        { to: "/login", label: "Masuk ke Akun", icon: User },
      ],
    },
  ];

  const currentNavGroups =
    role === "manager"
      ? managerNavGroups
      : role === "player" || role === "talent"
      ? playerNavGroups
      : guestNavGroups;

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* =========================================================================
          1. SIDEBAR NAVIGATION (DESKTOP)
          ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen z-40 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out shrink-0 select-none ${
          isCollapsed ? "w-20" : "w-64 lg:w-72"
        }`}
      >
        {/* Brand Header & Toggle Button */}
        <div
          className={`h-16 flex items-center border-b border-zinc-200 dark:border-zinc-800 transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {isCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Buka Sidebar Penuh (Expand)"
            >
              <ChevronLeft className="w-5 h-5 rotate-180 text-red-600" />
            </button>
          ) : (
            <>
              <Link to="/" className="flex items-center gap-3 overflow-hidden group">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Crosshair className="w-4 h-4 text-white font-bold" />
                </div>

                {/* Nama Brand */}
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="font-gaming font-bold text-lg tracking-wider text-zinc-900 dark:text-zinc-100">
                      PULSE<span className="text-red-600">SCOUT</span>
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-gaming uppercase tracking-wider">
                      PUBG
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight whitespace-nowrap -mt-0.5">
                    XGBoost Talent Analytics
                  </span>
                </div>
              </Link>

              {/* Toggle Button Collapse */}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Perkecil Sidebar (Collapse)"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-400" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {currentNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {/* Group Header Label */}
              <div
                className={`px-3 text-[10px] font-gaming font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase transition-all duration-200 ${
                  isCollapsed ? "opacity-0 h-0 overflow-hidden py-0" : "opacity-100 py-1"
                }`}
              >
                {group.group}
              </div>

              {/* Items in Group */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-gaming font-semibold tracking-wide transition-colors ${
                          isCollapsed ? "justify-center" : "justify-start"
                        } ${
                          isActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border-l-2 border-red-600"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-l-2 border-transparent"
                        }`
                      }
                    >
                      {/* Icon */}
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Label Text */}
                      <span
                        className={`truncate transition-all duration-200 whitespace-nowrap ${
                          isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Optional Badge */}
                      {item.badge && !isCollapsed && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                          {item.badge}
                        </span>
                      )}

                      {/* Hover Tooltip saat Sidebar Collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-gaming font-bold text-zinc-900 dark:text-zinc-100 tracking-wider whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Footer Area */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
          {user ? (
            <div className="space-y-2">
              {role === "manager" ? (
                <div
                  className={`flex items-center gap-3 p-2 rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 ${
                    isCollapsed ? "justify-center" : "justify-start"
                  }`}
                  title="Akun Manager Scout Aktif"
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-600/30 bg-red-600/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 border border-black" />
                  </div>

                  <div
                    className={`flex flex-col min-w-0 transition-all duration-200 overflow-hidden ${
                      isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                    }`}
                  >
                    <span className="text-xs font-gaming font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-gaming font-bold uppercase bg-red-600/15 text-red-600 border border-red-600/30">
                        MANAGER
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">SCOUT LEAD</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/player/profile"
                  className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors ${
                    isCollapsed ? "justify-center" : "justify-start"
                  }`}
                  title="Buka Profil Atlet & Kartu Vision"
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      {playerAvatar ? (
                        <img
                          src={playerAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <User className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 border border-black" />
                  </div>

                  <div
                    className={`flex flex-col min-w-0 transition-all duration-200 overflow-hidden ${
                      isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                    }`}
                  >
                    <span className="text-xs font-gaming font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {playerProfile?.ign || profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-gaming font-semibold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                        {role || "PLAYER"}
                      </span>
                      <span className="text-[10px] text-zinc-500">Profil &rarr;</span>
                    </div>
                  </div>
                </Link>
              )}

              {!isCollapsed ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-gaming font-semibold text-zinc-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>KELUAR DARI AKUN</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className={`space-y-1.5 ${isCollapsed ? "text-center" : ""}`}>
              <Link
                to="/login"
                className="w-full py-1.5 px-3 rounded-lg text-xs font-gaming font-bold bg-red-600 hover:bg-red-700 text-white block text-center uppercase tracking-wider transition-colors"
              >
                {isCollapsed ? "IN" : "MASUK"}
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE DRAWER NAVIGATION
          ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Crosshair className="w-4 h-4 font-bold" />
                </div>
                <span className="font-gaming font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  PULSE<span className="text-red-600">SCOUT</span>
                </span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {currentNavGroups.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[10px] font-gaming font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block px-2">
                    {group.group}
                  </span>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-gaming font-semibold transition-colors ${
                              isActive
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white border-l-2 border-red-600"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                            }`
                          }
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Bottom Profile & Theme Toggle */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
              {user ? (
                <>
                  {role === "manager" ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-600/30 bg-red-600/10 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                          {profile?.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-[10px] text-red-600 font-gaming font-semibold uppercase">MANAGER SCOUT</p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/player/profile"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center gap-2.5 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        {playerAvatar ? (
                          <img src={playerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                          {playerProfile?.ign || profile?.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-[10px] text-zinc-500">Profil Saya &rarr;</p>
                      </div>
                    </Link>
                  )}
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Keluar"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Mode Tampilan</span>
                  <ThemeToggle />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MAIN CONTENT CONTAINER
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-x-hidden transition-colors duration-300">
        {/* Offline Demo Banner */}
        {!isSupabaseConfigured && (
          <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-1 text-center text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>
              <strong>Mode Uji Coba:</strong> Supabase Cloud belum dihubungkan. Menggunakan autentikasi demo lokal untuk pengujian cepat.
            </span>
          </div>
        )}

        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#18181b]/95 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 cursor-pointer shrink-0"
              title="Buka Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Breadcrumb Title (Ringkas di HP, Lengkap di Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <h1 className="text-xs sm:text-sm font-gaming font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase truncate">
                <span className="inline sm:hidden">{currentPage.shortTitle || currentPage.title}</span>
                <span className="hidden sm:inline">{currentPage.title}</span>
              </h1>
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono border border-zinc-200 dark:border-zinc-700 shrink-0">
                {currentPage.tag}
              </span>
            </div>
          </div>

          {/* Right Header: Notifikasi, ThemeToggle, ML Status & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Notifikasi Rekrutmen & Pesan Manajer (Sisi Player & Talent) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                title="Pemberitahuan Rekrutmen & Pesan Tim"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Popover Dropdown Notifikasi */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-fadeIn text-zinc-900 dark:text-zinc-100">
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      <div>
                        <h4 className="text-xs font-gaming font-bold tracking-wider uppercase">
                          {role === "manager" ? "AKTIVITAS TALENTA & TIM" : "UNDANGAN REKRUTMEN"} ({notifications.length})
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {role === "manager" ? "Laporan radar scouting & interaksi atlet" : "Pesan resmi & tawaran trial dari manajer tim"}
                        </p>
                      </div>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] font-mono text-red-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Tandai Dibaca</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs font-mono text-zinc-400">
                        Belum ada notifikasi rekrutmen baru.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 text-xs space-y-1.5 transition-colors ${
                            !notif.read ? "bg-red-500/5 dark:bg-red-600/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                              )}
                              <span className="font-gaming font-bold text-xs text-zinc-900 dark:text-white uppercase leading-snug">
                                {notif.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>

                          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-zinc-500">
                              Dari: <strong className="text-zinc-800 dark:text-zinc-200">{notif.senderName} ({notif.teamTag})</strong>
                            </span>
                            <div className="flex items-center gap-2">
                              {notif.actionUrl && (
                                <Link
                                  to={notif.actionUrl}
                                  onClick={() => {
                                    markNotificationAsRead(notif.id);
                                    setShowNotificationsDropdown(false);
                                  }}
                                  className="text-red-600 font-bold hover:underline"
                                >
                                  {notif.actionLabel || "Buka"} &rarr;
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => removeNotification(notif.id)}
                                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                title="Hapus notifikasi"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 1. Switch Theme (Matahari / Bulan) dengan animasi Circular Reveal */}
            <ThemeToggle />

            {/* 2. FastAPI ML Backend Status (disembunyikan di HP agar navbar tidak sesak) */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              title={
                backendOnline
                  ? "FastAPI ML Server Online & Aktif (Port 8000)"
                  : "FastAPI ML Server Offline (Jalankan backend FastAPI di port 8000)"
              }
            >
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  backendOnline
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span
                className={`text-[11px] font-mono font-medium ${
                  backendOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                XGBoost ML {backendOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* 3. User Profile Header Chip */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                {role === "manager" ? (
                  <Link
                    to="/manager/dashboard"
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors text-xs font-gaming font-semibold group"
                    title="Dashboard Analitik Manager"
                  >
                    <div className="w-6 h-6 rounded overflow-hidden border border-red-600/30 bg-red-600/10 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <span className="hidden sm:inline group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {profile?.full_name || user.email?.split("@")[0] || "Manager"}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded font-gaming uppercase bg-red-600/15 text-red-600 border border-red-600/30">
                      MANAGER
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/player/profile"
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors text-xs font-gaming font-semibold group"
                    title="Buka Profil Atlet & Kartu Vision"
                  >
                    <div className="w-6 h-6 rounded overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      {playerAvatar ? (
                        <img src={playerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      )}
                    </div>
                    <span className="hidden sm:inline group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {playerProfile?.ign || profile?.full_name || "Profil"}
                    </span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-gaming font-bold bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content View with Error Boundary */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="bg-zinc-50 dark:bg-[#18181b] border-t border-zinc-200 dark:border-zinc-800 mt-auto py-6 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-gaming font-semibold text-zinc-900 dark:text-zinc-200 tracking-wider">
                PULSE<span className="text-red-600">SCOUT</span>
              </span>
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">|</span>
              <span>Talent Scouting Player Scoring PUBG Mobile Berbasis XGBoost</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-zinc-700 dark:text-zinc-300">
                Axel Juanito Parlindungan Sibarani (NPM 065122199)
              </p>
              <p className="text-zinc-500 dark:text-zinc-500">
                Program Studi Ilmu Komputer, FMIPA, Universitas Pakuan
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Dialog Konfirmasi Keluar Akun */}
      <ConfirmActionModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={executeLogout}
        title="Konfirmasi Keluar Akun"
        message="Apakah Anda yakin ingin keluar dari sesi akun Anda saat ini?"
        confirmText="Ya, Keluar Akun"
        cancelText="Batal"
        icon={LogOut}
        isLoading={isLoggingOut}
      />
    </div>
  );
};
