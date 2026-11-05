/**
 * frontend/src/pages/common/TeamDirectoryPage.jsx
 * Direktori Tim E-Sports & Bursa Roster Terdaftar.
 * Desain Lengkap, Menarik, dan Bersih (Menampilkan Visi, Misi, & Catatan Scrim).
 * Font Poppins selaras, tanpa garis miring (no italic), tanpa huruf kekecilan.
 * Mode Gelap: Semua teks berwarna PUTIH.
 * Mode Terang: Semua teks berwarna HITAM.
 */

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import {
  Shield,
  Search,
  Heart,
  MapPin,
  Users,
  Edit3,
  Check,
  AlertCircle,
  Phone,
  Crosshair,
  Clock,
  Compass,
  Target,
  Gamepad2,
  Sparkles,
} from "lucide-react";

export const TeamDirectoryPage = () => {
  const { user, role } = useAuth();
  const {
    registeredTeams,
    fetchRegisteredTeams,
    playerWishlistTeams,
    toggleWishlistTeam,
    isTeamWishlisted,
    playerHistory,
    playerProfile,
  } = usePlayerStore();

  React.useEffect(() => {
    if (typeof fetchRegisteredTeams === "function") {
      fetchRegisteredTeams();
    }
  }, []);

  const isManager = String(role || user?.user_metadata?.role || "").toLowerCase().trim() === "manager";

  // Hitung skor terbaik pemain untuk evaluasi kelayakan tim
  const playerBestScore = useMemo(() => {
    if (playerHistory && playerHistory.length > 0) {
      const maxScore = Math.max(...playerHistory.map((h) => Number(h.player_score || 0)));
      return maxScore > 0 ? maxScore : 64.8;
    }
    return 64.8;
  }, [playerHistory]);

  const playerIGN = playerProfile?.ign || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player";

  // State Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [onlyOpenRecruit, setOnlyOpenRecruit] = useState(false);
  const [onlyWishlist, setOnlyWishlist] = useState(false);

  // Filter Data Tim
  const filteredTeams = useMemo(() => {
    return (registeredTeams || []).filter((team) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = team.name?.toLowerCase().includes(q);
        const matchesTag = team.tag?.toLowerCase().includes(q);
        const matchesCity = team.city?.toLowerCase().includes(q);
        const matchesVision = team.vision?.toLowerCase().includes(q);
        const matchesMission = team.mission?.toLowerCase().includes(q);
        const matchesNotes = team.trialNotes?.toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesCity && !matchesVision && !matchesMission && !matchesNotes) {
          return false;
        }
      }

      // 2. Role Filter (Multi-Role Check)
      if (roleFilter !== "all") {
        if (!team.openRecruitment) return false;
        const roles = Array.isArray(team.neededRoles) && team.neededRoles.length > 0
          ? team.neededRoles
          : [team.recruitmentRole || ""];
        const matchesRole = roles.some((r) => String(r).toLowerCase().includes(roleFilter.toLowerCase()));
        if (!matchesRole) return false;
      }

      // 3. Only Open Recruitment
      if (onlyOpenRecruit && !team.openRecruitment) {
        return false;
      }

      // 4. Only Wishlist
      if (onlyWishlist && !isTeamWishlisted(team.id)) {
        return false;
      }

      return true;
    });
  }, [registeredTeams, searchQuery, roleFilter, onlyOpenRecruit, onlyWishlist, playerWishlistTeams]);

  // Statistik Ringkas
  const openTrialCount = useMemo(() => {
    return (registeredTeams || []).filter((t) => t.openRecruitment).length;
  }, [registeredTeams]);

  // Format link WhatsApp langsung
  const formatWhatsAppLink = (phone, teamName, neededRoles) => {
    if (!phone) return "#";
    let cleanNumber = phone.replace(/[^0-9]/g, "");
    if (cleanNumber.startsWith("0")) {
      cleanNumber = "62" + cleanNumber.slice(1);
    }
    const rolesText = Array.isArray(neededRoles) ? neededRoles.join(", ") : neededRoles;
    const message = encodeURIComponent(
      `Halo Manajer ${teamName}, saya ${playerIGN} tertarik mengikuti proses trial untuk slot ${rolesText || "Roster"} di tim Anda. Berikut portofolio skor Pulse Scout saya: Skor Puncak ${playerBestScore.toFixed(1)}.`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-black dark:text-white">
      
      {/* =========================================================================
          BANNER UTAMA (Ramping, Tegas, Kontras Tinggi)
          ========================================================================= */}
      <div className="relative rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 sm:p-7 shadow-md overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-500" />
              <span>Bursa Rekrutmen & Direktori Tim E-Sports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-black dark:text-white">
              Direktori Tim E-Sports
            </h1>
            <p className="text-sm font-normal text-black dark:text-white max-w-2xl leading-relaxed">
              Daftar resmi organisasi PUBG Mobile dengan profil visi misi komprehensif, jadwal scrim trial, kapasitas roster, dan kriteria skor Machine Learning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isManager ? (
              <Link
                to="/manager/team-profile"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>Kelola Profil Tim Saya</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-4 py-2.5 rounded-xl shadow-sm">
                <div>
                  <span className="text-xs font-medium text-black dark:text-white block uppercase">Skor Puncak Anda</span>
                  <span className="text-2xl font-black text-red-600">{playerBestScore.toFixed(1)}</span>
                </div>
                <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-800" />
                <div>
                  <span className="text-xs font-medium text-black dark:text-white block uppercase">Open Trial</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{openTrialCount} Tim</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER & KONTROL PENCARIAN (Font Poppins Jelas)
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tim, tag, visi misi, kota, atau scrim..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          {/* Role Dropdown */}
          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-black dark:text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="all">Semua Kebutuhan Role</option>
              <option value="rusher">Rusher / Fragger</option>
              <option value="sniper">Sniper / Marksman</option>
              <option value="zone">Zone Controller</option>
              <option value="support">Support / IGL</option>
            </select>
          </div>

          {/* Toggle Buttons */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setOnlyOpenRecruit(!onlyOpenRecruit)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                onlyOpenRecruit
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500"
                  : "bg-zinc-100 dark:bg-zinc-950 text-black dark:text-white border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${onlyOpenRecruit ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
              <span>Hanya Open Trial</span>
            </button>

            {!isManager && (
              <button
                type="button"
                onClick={() => setOnlyWishlist(!onlyWishlist)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                  onlyWishlist
                    ? "bg-red-600/15 text-red-600 dark:text-red-400 border-red-500"
                    : "bg-zinc-100 dark:bg-zinc-950 text-black dark:text-white border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${onlyWishlist ? "fill-red-600 text-red-600" : "text-zinc-500"}`} />
                <span>Wishlist ({playerWishlistTeams.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter Info & Reset Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white">
          <span>
            Menampilkan <strong className="text-red-600 font-bold">{filteredTeams.length}</strong> tim e-sports terdaftar
          </span>
          {(searchQuery || roleFilter !== "all" || onlyOpenRecruit || onlyWishlist) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setOnlyOpenRecruit(false);
                setOnlyWishlist(false);
              }}
              className="text-red-600 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          DAFTAR KARTU TIM (LENGKAP: VISI, MISI, CATATAN SCRIM & ROSTER)
          ========================================================================= */}
      {filteredTeams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 space-y-3">
          <Shield className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-black dark:text-white uppercase">
            {registeredTeams.length === 0 ? "Belum Ada Tim E-Sports Terdaftar" : "Tidak Ada Tim yang Cocok"}
          </h3>
          <p className="text-sm text-black dark:text-white max-w-md mx-auto">
            {registeredTeams.length === 0
              ? isManager
                ? "Belum ada tim yang didaftarkan. Silakan daftarkan profil organisasi tim e-sports Anda untuk mulai merekrut atlet."
                : "Belum ada tim e-sports yang didaftarkan oleh akun manajer saat ini."
              : "Coba ubah kata kunci pencarian atau matikan filter pencarian di atas untuk melihat seluruh tim."}
          </p>
          {registeredTeams.length === 0 && isManager && (
            <div className="pt-2">
              <Link
                to="/manager/team-profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>Daftarkan Tim Sekarang</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeams.map((team) => {
            const isWishlisted = isTeamWishlisted(team.id);
            const isScoreEligible = playerBestScore >= (team.recruitmentMinScore || 70.0);
            const scoreGap = ((team.recruitmentMinScore || 70.0) - playerBestScore).toFixed(1);

            // Kapasitas Roster
            const activeCount = team.activeRosterCount !== undefined && team.activeRosterCount !== null ? Number(team.activeRosterCount) : 0;
            const maxCount = Number(team.maxRosterCount || 5);
            const openSlots = Math.max(0, maxCount - activeCount);
            const rosterPct = maxCount > 0 ? Math.min(100, Math.round((activeCount / maxCount) * 100)) : 0;

            // Roles array
            const neededRoles = Array.isArray(team.neededRoles) && team.neededRoles.length > 0
              ? team.neededRoles
              : [team.recruitmentRole || "Rusher / Fragger"];

            return (
              <div
                key={team.id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="space-y-4">
                  
                  {/* 1. Header Kartu: Logo Tim, Nama, Tag, Badges, Status & Wishlist */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {/* Logo Frame */}
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner p-1">
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className={`w-full h-full rounded-xl bg-gradient-to-br ${team.badgeColor || "from-red-600 to-zinc-900"} flex items-center justify-center text-white font-black text-sm`}>
                            {team.tag || "ESP"}
                          </div>
                        )}
                      </div>

                      {/* Info Pokok Tim */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-extrabold text-black dark:text-white uppercase tracking-tight leading-snug">
                            {team.name}
                          </h3>
                          {team.isVerifiedPro && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-xs font-bold uppercase">
                              PRO
                            </span>
                          )}
                          {team.isManagerCreated && (
                            <span className="px-2 py-0.5 rounded bg-red-600/15 text-red-600 dark:text-red-400 border border-red-600/30 text-xs font-bold uppercase">
                              MANAGER
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-black dark:text-white">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            {team.city}
                          </span>
                          <span>•</span>
                          <span>Est. {team.established || "2020"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Wishlist Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isManager && (
                        <button
                          type="button"
                          onClick={() => toggleWishlistTeam(team.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isWishlisted
                              ? "bg-red-600 text-white border-red-500 shadow-sm"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white border-zinc-300 dark:border-zinc-700"
                          }`}
                          title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist Tim Impian"}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
                        </button>
                      )}

                      {team.openRecruitment ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Open Trial
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                          Roster Full
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Visi & Misi Tim (Lengkap, Rapi, Tanpa Huruf Miring) */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                    {/* Visi */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1 rounded bg-red-600/10 text-red-600 shrink-0">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-xs uppercase tracking-wider text-red-600 dark:text-red-400 block mb-0.5">
                          Visi Tim:
                        </span>
                        <p className="text-black dark:text-white leading-relaxed font-normal">
                          {team.vision}
                        </p>
                      </div>
                    </div>

                    {/* Misi */}
                    <div className="flex items-start gap-2 pt-1">
                      <div className="mt-0.5 p-1 rounded bg-blue-600/10 text-blue-600 shrink-0">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                          Misi Tim:
                        </span>
                        <p className="text-black dark:text-white leading-relaxed font-normal">
                          {team.mission}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Catatan Scrim & Kriteria Trial (Fitur Baru: Tampil Menarik) */}
                  {team.trialNotes && (
                    <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>Catatan Scrim & Jadwal Trial:</span>
                      </div>
                      <p className="text-xs text-black dark:text-white leading-relaxed font-medium">
                        {team.trialNotes}
                      </p>
                    </div>
                  )}

                  {/* 4. Kapasitas Roster & Kebutuhan Role */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                    
                    {/* Bar Roster */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-black dark:text-white font-medium">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-red-600" />
                          <span>Kapasitas Roster:</span>
                        </span>
                        <span className="font-bold text-black dark:text-white">
                          {activeCount} / {maxCount} Pemain
                          <span className="ml-1.5 font-normal text-black dark:text-white">
                            ({openSlots > 0 ? `${openSlots} slot terbuka` : "Roster Penuh"})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full transition-all duration-300"
                          style={{ width: `${rosterPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Roles Dibutuhkan & Min Skor */}
                    {team.openRecruitment && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mr-1">
                            Role Dicari:
                          </span>
                          {neededRoles.map((r) => (
                            <span
                              key={r}
                              className="px-2.5 py-1 rounded-md bg-red-600/15 border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wide"
                            >
                              {r}
                            </span>
                          ))}
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                          Min Skor: {Number(team.recruitmentMinScore || 75.0).toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Evaluasi Kelayakan Player */}
                    {!isManager && team.openRecruitment && (
                      <div className="pt-2 flex items-center justify-between text-xs font-medium text-black dark:text-white">
                        <span>Evaluasi Talenta ML:</span>
                        {isScoreEligible ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/40 text-xs">
                            <Check className="w-3.5 h-3.5" />
                            Siap Trial ({playerBestScore.toFixed(1)} ≥ {team.recruitmentMinScore})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15 px-2.5 py-1 rounded-md border border-amber-500/40 text-xs">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Butuh +{scoreGap} Skor Lagi
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Footer Kartu: PIC & Tombol Kontak WhatsApp */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                  <div className="text-xs font-medium text-black dark:text-white truncate">
                    PIC: <strong className="text-black dark:text-white">{team.contactManager || "Manager"}</strong>
                    {team.instagram && <span className="ml-2 font-normal text-black dark:text-white">{team.instagram}</span>}
                  </div>

                  {team.contactPhone && team.openRecruitment && (
                    <a
                      href={formatWhatsAppLink(team.contactPhone, team.name, neededRoles)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5 text-white" />
                      <span>Daftar Trial (WA)</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamDirectoryPage;
