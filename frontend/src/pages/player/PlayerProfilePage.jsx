/**
 * frontend/src/pages/player/PlayerProfilePage.jsx
 * Halaman Profil Atlet Pemain dengan fitur:
 * 1. Upload dan manajemen Foto Atlet asli (tersimpan di localStorage & tercermin di Kartu Vision).
 * 2. Kustomisasi Profil Atlet: Edit Nickname (IGN), ID Game PUBG Mobile, dan Bio pribadi.
 * 3. Visualisasi Kartu Scout Vision resmi berbasis statistik pertandingan riil dan inferensi XGBoost.
 * 4. Ringkasan performa dan pemilih match historis.
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { PlayerVisionCard } from "../../components/player/PlayerVisionCard";
import { SimpleToastNotification } from "../../components/common/SimpleToastNotification";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import {
  User,
  Camera,
  Trash2,
  Upload,
  Trophy,
  Activity,
  TrendingUp,
  Crosshair,
  Shield,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Maximize2,
  X,
  Edit3,
  Save,
  Gamepad2,
  Hash,
  FileText,
  Check,
  Copy,
  RotateCcw,
  Printer,
  Smartphone,
  MapPin,
  Calendar,
  Briefcase,
  Share2,
  Phone,
  MessageCircle,
  ExternalLink,
  Lock,
  EyeOff,
} from "lucide-react";
import { ScoutingReportModal } from "../../components/modals/ScoutingReportModal";

// Logo Resmi Brand Media Sosial (SVG Asli)
const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ps-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="10%" stopColor="#fdf497" />
        <stop offset="50%" stopColor="#fd5949" />
        <stop offset="65%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ps-ig-gradient)" />
    <circle cx="12" cy="12" r="4.3" stroke="#ffffff" strokeWidth="2" fill="none" />
    <circle cx="17.3" cy="6.7" r="1.3" fill="#ffffff" />
  </svg>
);

const DiscordIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#25D366">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.49 0-2.95-.4-4.22-1.15l-.3-.18-3.13.82.83-3.05-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.19 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
  </svg>
);

export const PlayerProfilePage = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const isDemo = (user?.email || "").toLowerCase().trim() === "player@esports-talent.id";
  const isFirstTime = Boolean(location.state?.isFirstTime);

  const {
    playerHistory,
    playerAvatar,
    updatePlayerAvatar,
    players,
    playerProfile,
    updatePlayerProfile,
    publishMatchToLeaderboard,
    unpublishMatchFromLeaderboard,
    deleteMatchHistory,
  } = usePlayerStore();
  const fileInputRef = useRef(null);

  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showFullscreenCard, setShowFullscreenCard] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0); // 0 = match terbaru

  // Modal State untuk Edit Profil (IGN, Nama Asli, ID Game, Role, Bio, Status Transfer, Biodata & Kontak)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formIGN, setFormIGN] = useState(
    playerProfile?.ign || (isDemo ? "BTR_Ryzen" : (user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""))
  );
  const [formRealName, setFormRealName] = useState(
    playerProfile?.real_name || (isDemo ? "Muhammad Albi" : (user?.user_metadata?.full_name || ""))
  );
  const [formGameId, setFormGameId] = useState(playerProfile?.gameId || (isDemo ? "5123984729" : ""));
  const [formRole, setFormRole] = useState(playerProfile?.role || (isDemo ? "Rusher / Fragger" : "Rusher / Fragger"));
  const [formBio, setFormBio] = useState(
    playerProfile?.bio ||
    (isDemo
      ? "Rusher agresif PUBG Mobile dengan spesialisasi close-combat M416. Berorientasi pada rotasi cepat zona akhir dan siap uji tanding turnamen."
      : "")
  );
  const [formRecruitmentStatus, setFormRecruitmentStatus] = useState(
    playerProfile?.recruitment_status || "Open to Trial / Free Agent"
  );
  const [formTeamName, setFormTeamName] = useState(
    playerProfile?.team_name || "Free Agent"
  );
  const [formAge, setFormAge] = useState(playerProfile?.age || (isDemo ? "21" : ""));
  const [formOriginCity, setFormOriginCity] = useState(
    playerProfile?.origin_city || (isDemo ? "Jakarta, Indonesia" : "")
  );
  const [formDevice, setFormDevice] = useState(
    playerProfile?.device || (isDemo ? "iPhone 13 Pro Max" : "")
  );
  const [formInstagram, setFormInstagram] = useState(
    playerProfile?.instagram || (isDemo ? "@btr_ryzen" : "")
  );
  const [formDiscord, setFormDiscord] = useState(
    playerProfile?.discord || (isDemo ? "ryzen#5512" : "")
  );
  const [formWhatsapp, setFormWhatsapp] = useState(
    playerProfile?.whatsapp || (isDemo ? "0812-3456-7890" : "")
  );
  const [copiedId, setCopiedId] = useState(false);
  const [copiedContact, setCopiedContact] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sinkronkan form state saat playerProfile berubah
  useEffect(() => {
    if (playerProfile) {
      setFormIGN(playerProfile.ign || (isDemo ? "BTR_Ryzen" : (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "")));
      setFormRealName(playerProfile.real_name || (isDemo ? "Muhammad Albi" : (user?.user_metadata?.full_name || "")));
      setFormGameId(playerProfile.gameId || (isDemo ? "5123984729" : ""));
      setFormRole(playerProfile.role || (isDemo ? "Rusher / Fragger" : "Rusher / Fragger"));
      setFormBio(
        playerProfile.bio ||
        (isDemo
          ? "Rusher agresif PUBG Mobile dengan spesialisasi close-combat M416. Berorientasi pada rotasi cepat zona akhir dan siap uji tanding turnamen."
          : "")
      );
      setFormRecruitmentStatus(playerProfile.recruitment_status || "Open to Trial / Free Agent");
      setFormTeamName(playerProfile.team_name || "Free Agent");
      setFormAge(playerProfile.age || (isDemo ? "21" : ""));
      setFormOriginCity(playerProfile.origin_city || (isDemo ? "Jakarta, Indonesia" : ""));
      setFormDevice(playerProfile.device || (isDemo ? "iPhone 13 Pro Max" : ""));
      setFormInstagram(playerProfile.instagram || (isDemo ? "@btr_ryzen" : ""));
      setFormDiscord(playerProfile.discord || (isDemo ? "ryzen#5512" : ""));
      setFormWhatsapp(playerProfile.whatsapp || (isDemo ? "0812-3456-7890" : ""));
    }
  }, [playerProfile, isDemo, user]);

  // Nama IGN & Identitas Atlet Lengkap
  const activeIGN = playerProfile?.ign || user?.user_metadata?.full_name || user?.email?.split("@")[0] || (isDemo ? "BTR_Ryzen" : "Player");
  const activeRealName = playerProfile?.real_name || (isDemo ? "Muhammad Albi" : "-");
  const activeGameId = playerProfile?.gameId || (isDemo ? "5123984729" : "-");
  const activeRole = playerProfile?.role || (isDemo ? "Rusher / Fragger" : "Belum Ditentukan");
  const activeBio = playerProfile?.bio || (isDemo ? "Rusher agresif PUBG Mobile dengan spesialisasi close-combat M416." : "Belum ada bio profil atlet. Silakan klik tombol 'Lengkapi / Edit Profil' di atas.");
  const activeRecruitmentStatus = playerProfile?.recruitment_status || "Open to Trial / Free Agent";
  const activeTeamName = playerProfile?.team_name || "Free Agent";
  const activeAge = playerProfile?.age || (isDemo ? "21" : "-");
  const activeOriginCity = playerProfile?.origin_city || (isDemo ? "Jakarta, Indonesia" : "-");
  const activeDevice = playerProfile?.device || (isDemo ? "iPhone 13 Pro Max" : "-");
  const activeInstagram = playerProfile?.instagram || (isDemo ? "@btr_ryzen" : "-");
  const activeDiscord = playerProfile?.discord || (isDemo ? "ryzen#5512" : "-");
  const activeWhatsapp = playerProfile?.whatsapp || (isDemo ? "0812-3456-7890" : "-");

  // Data match terpilih (terbaru atau berdasarkan pilihan)
  const currentMatch = playerHistory && playerHistory.length > 0 ? playerHistory[selectedMatchIndex] : null;

  // Temukan data lengkap match di daftar players jika ada
  const matchedPlayerDetail = currentMatch
    ? players.find((p) => p.Player_ID === currentMatch.id) || currentMatch
    : null;

  // Format data untuk PlayerVisionCard langsung dari statistik pertandingan aktual pemain
  const cardPlayerData = currentMatch
    ? {
      ign: activeIGN,
      real_name: activeRealName,
      gameId: activeGameId,
      Player_ID: activeGameId,
      bio: activeBio,
      tier: currentMatch.tier || currentMatch.Tier || "Crown",
      kills: currentMatch.kills ?? currentMatch.Kills ?? 0,
      damage_dealt: currentMatch.damage_dealt ?? currentMatch.Damage_Dealt ?? 0,
      survival_time_minutes:
        currentMatch.survival_time_minutes ??
        currentMatch.Survival_Time_Minutes ??
        matchedPlayerDetail?.Survival_Time_Minutes ??
        0,
      headshot_percentage:
        currentMatch.headshot_percentage ??
        currentMatch.Headshot_Percentage ??
        matchedPlayerDetail?.Headshot_Percentage ??
        0,
      assists: currentMatch.assists ?? currentMatch.Assists ?? matchedPlayerDetail?.Assists ?? 0,
      revives: currentMatch.revives ?? currentMatch.Revives ?? matchedPlayerDetail?.Revives ?? 0,
      distance_travelled_km:
        currentMatch.distance_travelled_km ??
        currentMatch.Distance_Travelled_km ??
        matchedPlayerDetail?.Distance_Travelled_km ??
        0,
      longest_kill_meters:
        currentMatch.longest_kill_meters ??
        currentMatch.Longest_Kill_meters ??
        matchedPlayerDetail?.Longest_Kill_meters ??
        0,
      heals_used: currentMatch.heals_used ?? currentMatch.Heals_Used ?? matchedPlayerDetail?.Heals_Used ?? 0,
      boosts_used: currentMatch.boosts_used ?? currentMatch.Boosts_Used ?? matchedPlayerDetail?.Boosts_Used ?? 0,
      match_rank: currentMatch.match_rank ?? currentMatch.Match_Rank ?? 0,
      map: currentMatch.map || currentMatch.Map || matchedPlayerDetail?.Map || "Erangel",
      favorite_weapon:
        currentMatch.favorite_weapon ||
        currentMatch.Favorite_Weapon ||
        matchedPlayerDetail?.Favorite_Weapon ||
        "M416",
      match_screenshot_url:
        currentMatch.match_screenshot_url ||
        currentMatch.matchScreenshotUrl ||
        matchedPlayerDetail?.match_screenshot_url ||
        null,
      avatar: playerAvatar,
      isCurrentUser: true,
    }
    : (isDemo ? {
      ign: "BTR_Ryzen",
      real_name: "Muhammad Albi",
      gameId: "5123984729",
      Player_ID: "5123984729",
      bio: "Rusher agresif PUBG Mobile dengan spesialisasi close-combat M416.",
      tier: "Crown",
      kills: 6,
      damage_dealt: 650.0,
      survival_time_minutes: 24.5,
      headshot_percentage: 32.0,
      assists: 3,
      revives: 2,
      distance_travelled_km: 5.4,
      longest_kill_meters: 175.0,
      heals_used: 4,
      boosts_used: 5,
      match_rank: 2,
      map: "Erangel",
      favorite_weapon: "M416",
      avatar: playerAvatar,
      isCurrentUser: true,
    } : {
      ign: activeIGN,
      real_name: activeRealName,
      gameId: activeGameId,
      Player_ID: activeGameId,
      bio: activeBio,
      tier: "Unranked",
      kills: 0,
      damage_dealt: 0,
      survival_time_minutes: 0,
      headshot_percentage: 0,
      assists: 0,
      revives: 0,
      distance_travelled_km: 0,
      longest_kill_meters: 0,
      heals_used: 0,
      boosts_used: 0,
      match_rank: 0,
      map: "-",
      favorite_weapon: "-",
      avatar: playerAvatar,
      isCurrentUser: true,
    });

  const cardScoreResult = currentMatch
    ? {
      player_score: currentMatch.player_score ?? currentMatch.Player_Score ?? 0,
      score_category: currentMatch.score_category ?? currentMatch.Score_Category ?? "-",
    }
    : (isDemo
      ? { player_score: 84.5, score_category: "Tinggi" }
      : { player_score: 0, score_category: "Belum Ada Data" });

  // Statistik agregat
  const totalMatches = playerHistory?.length || 0;
  const bestScore =
    totalMatches > 0
      ? Math.max(...playerHistory.map((h) => Number(h.player_score) || 0)).toFixed(1)
      : (isDemo ? "84.5" : "-");
  const avgScore =
    totalMatches > 0
      ? (
        playerHistory.reduce((acc, curr) => acc + (Number(curr.player_score) || 0), 0) /
        totalMatches
      ).toFixed(1)
      : (isDemo ? "84.5" : "-");
  const totalKills =
    totalMatches > 0
      ? playerHistory.reduce((acc, curr) => acc + (Number(curr.kills) || 0), 0)
      : (isDemo ? 6 : 0);

  // Handler Upload Foto dari Perangkat Pengguna
  const handlePhotoSelect = (e) => {
    setUploadError("");
    setUploadSuccess("");

    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setUploadError("Format file tidak didukung. Harap pilih gambar (JPG, PNG, atau WebP).");
      return;
    }

    // Validasi ukuran (maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran foto terlalu besar. Maksimal ukuran gambar adalah 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      updatePlayerAvatar(base64String);
      setUploadSuccess("Foto profil atlet berhasil diunggah! Kartu Scout Vision kini menampilkan wajah Anda.");
      setTimeout(() => setUploadSuccess(""), 4000);
    };
    reader.onerror = () => {
      setUploadError("Gagal membaca file gambar. Silakan coba gambar lain.");
    };
    reader.readAsDataURL(file);
  };

  // Handler Hapus Foto (Kembali ke default hero)
  const handleRemovePhoto = () => {
    updatePlayerAvatar(null);
    setUploadSuccess("Foto atlet direset ke siluet default e-sports.");
    setTimeout(() => setUploadSuccess(""), 3000);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validasi Formulir sebelum Menampilkan Dialog Konfirmasi
  const handlePromptSaveProfile = (e) => {
    e.preventDefault();
    setUploadError("");

    if (!formIGN.trim()) {
      setUploadError("Nickname (IGN) tidak boleh kosong.");
      return;
    }
    const cleanedGameId = formGameId.replace(/\D/g, "").trim();
    if (!cleanedGameId) {
      setUploadError("ID PUBG Mobile wajib diisi dan hanya boleh berupa angka.");
      return;
    }
    if (cleanedGameId.length < 5 || cleanedGameId.length > 15) {
      setUploadError("Panjang ID PUBG Mobile harus berupa 5 hingga 15 digit angka.");
      return;
    }

    // Tampilkan modal konfirmasi
    setShowConfirmModal(true);
  };

  // Eksekusi Simpan Perubahan Profil setelah Pengguna Konfirmasi "Ya"
  const handleConfirmSaveProfile = async () => {
    const cleanedGameId = formGameId.replace(/\D/g, "").trim();

    await updatePlayerProfile({
      ign: formIGN.trim(),
      real_name: formRealName.trim(),
      gameId: cleanedGameId,
      role: formRole,
      bio: formBio.trim(),
      recruitment_status: formRecruitmentStatus,
      team_name: formTeamName.trim() || "Free Agent",
      age: formAge.trim() || "21",
      origin_city: formOriginCity.trim() || "Indonesia",
      device: formDevice.trim() || "Smartphone",
      instagram: formInstagram.trim(),
      discord: formDiscord.trim(),
      whatsapp: formWhatsapp.trim(),
    });

    setShowConfirmModal(false);
    setIsEditingProfile(false);
    setUploadSuccess("Data profil berhasil diperbarui!");
    setShowSuccessModal(true);
    setTimeout(() => setUploadSuccess(""), 3500);
  };

  const copyGameIdToClipboard = () => {
    navigator.clipboard?.writeText(activeGameId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyContactToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(""), 2000);
  };

  // Helper Resolver URL Sosmed (Buka Langsung ke Aplikasi/Web)
  const resolveInstagramUrl = (handle) => {
    if (!handle) return "#";
    const clean = handle.trim().replace(/^@/, "");
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    return `https://instagram.com/${clean}`;
  };

  const resolveWhatsAppUrl = (phone) => {
    if (!phone) return "#";
    let clean = phone.trim().replace(/[^0-9+]/g, "");
    if (clean.startsWith("+62")) {
      clean = clean.substring(1);
    } else if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    } else if (clean.startsWith("+")) {
      clean = clean.substring(1);
    }
    return `https://wa.me/${clean}`;
  };

  const resolveDiscordUrl = (tag) => {
    if (!tag) return "https://discord.com/app";
    const clean = tag.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    if (clean.startsWith("discord.gg/")) return `https://${clean}`;
    return "https://discord.com/channels/@me";
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* =========================================================================
          BANNER PENYAMBUTAN ONBOARDING (PENGGUNA BARU DAFTAR)
          ========================================================================= */}
      {(!playerProfile?.isProfileCompleted || isFirstTime) && (
        <div className="rounded-3xl p-6 sm:p-7 border border-red-500/40 bg-gradient-to-r from-red-600/10 via-amber-500/10 to-transparent dark:from-red-950/40 dark:via-zinc-900 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-gaming font-bold uppercase tracking-wider">
                  LANGKAH 1: LENGKAPI PROFIL ATLET
                </span>
                <span className="text-xs font-gaming text-zinc-500 dark:text-zinc-400">
                  ONBOARDING ATLET RESMI
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                Selamat Datang di PulseScout! Silakan Lengkapi Data Diri & Profil Atlet
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                Sebagai atlet baru, Anda wajib melengkapi Nickname (IGN), ID Game PUBG Mobile, Role spesialisasi, dan kontak Anda terlebih dahulu. Setelah disimpan, Anda dapat menginput statistik pertandingan dan pada login berikutnya Anda akan langsung otomatis diarahkan ke Dashboard utama.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold uppercase rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                  <span>Buka Formulir Pengisian Profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOP BANNER: PROFIL & IDENTITAS ATLET
          ========================================================================= */}
      <div className="rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5] dark:bg-[#18181b] relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left flex-1">
            {/* Avatar Frame with Upload Action */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center relative">
                {playerAvatar ? (
                  <img
                    src={playerAvatar}
                    alt={activeIGN}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <User className="w-12 h-12" />
                    <span className="text-[10px] font-gaming mt-1 tracking-wider">FOTO DEFAULT</span>
                  </div>
                )}

                {/* Overlay hover to change photo */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-gaming font-bold gap-1 cursor-pointer"
                  title="Ganti Foto Atlet"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>GANTI FOTO</span>
                </button>
              </div>
            </div>

            {/* Player Names, ID Game, Role & Bio */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px] font-gaming font-bold uppercase tracking-wider">
                  PUBG MOBILE PRO ATHLETE
                </span>

                {/* Role Spesialisasi Pill */}
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-600 border border-red-600/30 text-[10px] font-gaming font-bold uppercase tracking-wider">
                  {activeRole}
                </span>

                {/* Game ID Pill */}
                <button
                  onClick={copyGameIdToClipboard}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-red-600 transition-colors text-xs font-mono"
                  title="Klik untuk salin ID PUBG Mobile"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-red-600" />
                  <span>ID: {activeGameId}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-500" />
                  )}
                </button>

                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {user?.email}
                </span>
              </div>

              {/* IGN Headline & Nama Lengkap */}
              <div>
                <h1 className="text-3xl font-gaming font-black text-zinc-900 dark:text-white tracking-wide uppercase leading-tight">
                  {activeIGN}
                </h1>
                {activeRealName && (
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Nama Asli: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{activeRealName}</span>
                  </p>
                )}
              </div>

              {/* Player Bio Quote Box */}
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 max-w-xl text-left">
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                  "{activeBio}"
                </p>
              </div>

              {/* Action Buttons: Edit Profile, Upload, Remove Photo */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {/* Edit Profile Button */}
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="py-1.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white" />
                  <span>EDIT NICKNAME, ID & BIO</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{playerAvatar ? "GANTI FOTO" : "UPLOAD FOTO"}</span>
                </button>

                {playerAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="py-1.5 px-3 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 hover:bg-red-100 dark:hover:bg-red-950/40 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-300 dark:border-zinc-700 hover:border-red-600 text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center gap-1"
                    title="Hapus foto dan kembali ke siluet bawaan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>HAPUS FOTO</span>
                  </button>
                )}

                {/* Tombol Download Laporan Scouting Resmi (A4 PDF) */}
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="py-1.5 px-4 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 border border-zinc-700 dark:border-zinc-200 text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  title="Unduh Dokumen Laporan Scouting Resmi (Format A4 PDF)"
                >
                  <Printer className="w-4 h-4 text-red-600" />
                  <span>DOWNLOAD LAPORAN (PDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick KPI Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0">
            <div className="p-3.5 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                SKOR PUNCAK
              </span>
              <span className="text-2xl font-gaming font-black text-zinc-900 dark:text-white">
                {bestScore}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                RATA-RATA
              </span>
              <span className="text-2xl font-gaming font-black text-zinc-900 dark:text-white">
                {avgScore}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                MATCH INPUT
              </span>
              <span className="text-2xl font-gaming font-black text-zinc-900 dark:text-white">
                {totalMatches}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                TOTAL KILLS
              </span>
              <span className="text-2xl font-gaming font-black text-red-600">
                {totalKills}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            E-SPORTS ATHLETE DOSSIER & OFFICIAL SCOUTING CHANNELS
            ========================================================================= */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Metadata Specs: Status, Tim, Usia, Domisili, Device */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Rekrutmen */}
            <div className={`px-3 py-1.5 rounded-xl font-gaming font-bold uppercase tracking-wider flex items-center gap-2 border shadow-sm ${
              activeRecruitmentStatus.toLowerCase().includes("open to trial")
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : activeRecruitmentStatus.toLowerCase().includes("offers")
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                activeRecruitmentStatus.toLowerCase().includes("open to trial")
                  ? "bg-emerald-500 animate-pulse"
                  : activeRecruitmentStatus.toLowerCase().includes("offers")
                  ? "bg-amber-500"
                  : "bg-blue-500"
              }`} />
              <span>{activeRecruitmentStatus}</span>
            </div>

            {/* Nama Lengkap / Asli */}
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-mono text-xs flex items-center gap-1.5 shadow-sm">
              <User className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-gaming uppercase">NAMA:</span>
              <span className="font-bold">{activeRealName}</span>
            </div>

            {/* Tim */}
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">TIM:</span>
              <span>{activeTeamName}</span>
            </div>

            {/* Usia */}
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-mono text-xs flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{activeAge} Tahun</span>
            </div>

            {/* Domisili / Kota */}
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-mono text-xs flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{activeOriginCity}</span>
            </div>

            {/* Device */}
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-mono text-xs flex items-center gap-1.5 shadow-sm">
              <Smartphone className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-gaming uppercase">DEVICE:</span>
              <span className="font-bold">{activeDevice}</span>
            </div>
          </div>

          {/* Social Channels: Direct Link with Real Logos */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-[10px] font-gaming font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mr-1">
              SCOUTING CHANNELS:
            </span>

            {/* Instagram Link Button */}
            <a
              href={resolveInstagramUrl(activeInstagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 hover:border-pink-500/50 text-zinc-800 dark:text-zinc-200 text-xs font-mono flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
              title={`Buka Instagram ${activeInstagram}`}
            >
              <InstagramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{activeInstagram}</span>
              <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-pink-500 transition-colors" />
            </a>

            {/* Discord Link / Copy Button */}
            <a
              href={resolveDiscordUrl(activeDiscord)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => copyContactToClipboard(activeDiscord, "Discord")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 hover:border-[#5865F2]/50 text-zinc-800 dark:text-zinc-200 text-xs font-mono flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
              title="Klik untuk salin tag & buka Discord"
            >
              <DiscordIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{activeDiscord}</span>
              {copiedContact === "Discord" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
              ) : (
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-[#5865F2] transition-colors" />
              )}
            </a>

            {/* WhatsApp Link Button */}
            <a
              href={resolveWhatsAppUrl(activeWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 hover:border-[#25D366]/50 text-zinc-800 dark:text-zinc-200 text-xs font-mono flex items-center gap-2 transition-all shadow-sm group cursor-pointer"
              title={`Chat WhatsApp dengan ${activeIGN}`}
            >
              <WhatsAppIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{activeWhatsapp}</span>
              <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-[#25D366] transition-colors" />
            </a>
          </div>
        </div>

        {/* Success / Error Notification */}
        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          MATCH SELECTOR & INPUT PROMPT
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#f4f4f5] dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-red-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              DATA PERTANDINGAN YANG DITAMPILKAN
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {totalMatches > 0
                ? `Memilih dari ${totalMatches} sesi pertandingan yang pernah Anda input.`
                : "Belum ada pertandingan yang diinput. Menggunakan preview performa benchmark."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {totalMatches > 1 && (
            <select
              value={selectedMatchIndex}
              onChange={(e) => setSelectedMatchIndex(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-gaming text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-red-600"
            >
              {playerHistory.map((m, idx) => (
                <option key={m.id} value={idx}>
                  Match #{totalMatches - idx} ({m.date}) - Skor: {Number(m.player_score).toFixed(1)} {m.is_published ? "• Publik" : "• Privat"}
                </option>
              ))}
            </select>
          )}

          {/* Status & Kontrol Publikasi Match Terpilih */}
          {currentMatch && (
            <div className="flex items-center gap-1.5">
              {currentMatch.is_published ? (
                <button
                  type="button"
                  onClick={() => unpublishMatchFromLeaderboard(currentMatch.id)}
                  className="py-1.5 px-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-xs font-gaming font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Sembunyikan sesi ini dari Leaderboard manajer"
                >
                  <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                  <span>SEMBUNYIKAN DARI LEADERBOARD</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => publishMatchToLeaderboard(currentMatch.id)}
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-gaming font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Tampilkan sesi ini ke Scouting Leaderboard manajer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>TAMPILKAN DI LEADERBOARD</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Hapus sesi pertandingan ini dari riwayat?")) {
                    deleteMatchHistory(currentMatch.id);
                    setSelectedMatchIndex(0);
                  }
                }}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-gaming font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Hapus sesi pertandingan ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Link
            to="/player/input"
            className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>+ INPUT MATCH BARU</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          KARTU SCOUT VISION RESMI (DENGAN NICKNAME, GAME ID, BIO, & FOTO ASLI)
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-gaming font-black text-zinc-900 dark:text-white tracking-wider uppercase">
              KARTU SCOUT VISION RESMI (E-SPORTS TALENT CARD)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="py-1.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Unduh Dokumen Laporan Scouting Resmi (A4 PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>DOWNLOAD LAPORAN (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFullscreenCard(true)}
              className="py-1.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-gaming font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>FULLSCREEN VIEW</span>
            </button>
          </div>
        </div>

        {/* Render Official PlayerVisionCard */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <PlayerVisionCard
            playerData={cardPlayerData}
            scoreResult={cardScoreResult}
            customAvatar={playerAvatar}
          />
        </div>
      </div>

      {/* =========================================================================
          RINCIAN 12 STATISTIK PERTANDINGAN YANG DIINPUT
          ========================================================================= */}
      <div className="rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 bg-[#f4f4f5] dark:bg-[#18181b] space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              <span>PARAMETER STATISTIK PERTANDINGAN TERAKHIR</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Parameter input pertandingan yang dianalisis oleh model Machine Learning XGBoost Regressor:
            </p>
          </div>

          <Link
            to="/player/history"
            className="text-xs font-gaming font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>LIHAT GRAFIK RIWAYAT &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">TIER</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.tier}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">KILLS</span>
            <span className="text-lg font-gaming font-bold text-red-600">{cardPlayerData.kills}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">DAMAGE</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.damage_dealt}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">SURVIVAL TIME</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.survival_time_minutes} m</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">HEADSHOT %</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.headshot_percentage}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">MATCH RANK</span>
            <span className="text-lg font-gaming font-bold text-red-600">#{cardPlayerData.match_rank}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">ASSISTS</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.assists}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">REVIVES</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.revives}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">JARAK TEMPUH</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.distance_travelled_km} km</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">LONGEST KILL</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.longest_kill_meters} m</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">HEALS USED</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.heals_used}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[10px] font-gaming text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">BOOSTS USED</span>
            <span className="text-lg font-gaming font-bold text-zinc-900 dark:text-white">{cardPlayerData.boosts_used}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL EDIT PROFIL ATLET (NICKNAME, ID GAME, ROLE, DOSIR, DEVICE & KONTAK)
          ========================================================================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-[#18181b] p-6 sm:p-8 space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-red-600">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  EDIT PROFIL & DOSIR ATLET
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Lengkapi identitas in-game, status transfer, biodata, device, dan kontak resmi scouting Anda.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePromptSaveProfile} className="space-y-4 text-left">
              {/* BAGIAN 1: IDENTITAS GAME & ROLE */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-gaming font-bold text-red-600 uppercase tracking-wider block">
                  1. IDENTITAS IN-GAME & ROLE SQUAD
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nickname (IGN) */}
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Nickname (IGN)</span>
                    </label>
                    <input
                      type="text"
                      value={formIGN}
                      onChange={(e) => setFormIGN(e.target.value)}
                      placeholder="Contoh: BTR_Ryzen"
                      maxLength={30}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Nama Asli (Nama Lengkap) */}
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      <span>Nama Asli (Nama Lengkap Atlet)</span>
                    </label>
                    <input
                      type="text"
                      value={formRealName}
                      onChange={(e) => setFormRealName(e.target.value)}
                      placeholder="Contoh: Muhammad Albi"
                      maxLength={50}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* ID Game PUBG Mobile */}
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-red-600" />
                      <span>ID PUBG Mobile</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formGameId}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        setFormGameId(digitsOnly);
                        if (uploadError) setUploadError("");
                      }}
                      placeholder="Contoh: 5123984729"
                      maxLength={15}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Role Spesialisasi */}
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                      Role Spesialisasi Squad
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Rusher / Fragger">Rusher / Fragger (Entry Fragger)</option>
                      <option value="Sniper / Marksman">Sniper / Marksman (Sharpshooter)</option>
                      <option value="Zone Controller">Zone Controller (Zone Anchor)</option>
                      <option value="Support / IGL">Support / IGL (Playmaker)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: STATUS REKRUTMEN & TIM */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-gaming font-bold text-red-600 uppercase tracking-wider block">
                  2. STATUS TRANSFER & TIM
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-red-600" />
                      <span>Status Rekrutmen</span>
                    </label>
                    <select
                      value={formRecruitmentStatus}
                      onChange={(e) => setFormRecruitmentStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Open to Trial / Free Agent">Open to Trial / Free Agent (Siap Uji Tanding)</option>
                      <option value="Open to Offers">Open to Offers (Terbuka Penawaran Kontrak)</option>
                      <option value="Under Contract">Under Contract (Terikat Kontrak Tim)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      <span>Tim / Organisasi Saat Ini</span>
                    </label>
                    <input
                      type="text"
                      value={formTeamName}
                      onChange={(e) => setFormTeamName(e.target.value)}
                      placeholder="Contoh: Free Agent / Bigetron Esports"
                      maxLength={40}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: BIODATA ATLET & DEVICE */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-gaming font-bold text-red-600 uppercase tracking-wider block">
                  3. BIODATA & DEVICE PERTANDINGAN
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-600" />
                      <span>Usia (Tahun)</span>
                    </label>
                    <input
                      type="text"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      placeholder="Contoh: 21"
                      maxLength={15}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <span>Asal Kota / Domisili</span>
                    </label>
                    <input
                      type="text"
                      value={formOriginCity}
                      onChange={(e) => setFormOriginCity(e.target.value)}
                      placeholder="Contoh: Jakarta, Indonesia"
                      maxLength={40}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-red-600" />
                      <span>Device / HP Utama</span>
                    </label>
                    <input
                      type="text"
                      value={formDevice}
                      onChange={(e) => setFormDevice(e.target.value)}
                      placeholder="Contoh: iPhone 13 Pro Max"
                      maxLength={40}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 4: KONTAK & MEDIA SOSIAL */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-gaming font-bold text-red-600 uppercase tracking-wider block">
                  4. KONTAK & MEDIA SOSIAL RESMI
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="text"
                      value={formInstagram}
                      onChange={(e) => setFormInstagram(e.target.value)}
                      placeholder="@username atau link IG"
                      maxLength={40}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <DiscordIcon className="w-3.5 h-3.5" />
                      <span>Discord Tag</span>
                    </label>
                    <input
                      type="text"
                      value={formDiscord}
                      onChange={(e) => setFormDiscord(e.target.value)}
                      placeholder="username#1234 atau invite"
                      maxLength={40}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>WhatsApp / Telepon</span>
                    </label>
                    <input
                      type="text"
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      placeholder="0812-3456-7890"
                      maxLength={25}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 5: BIO & MOTTO */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="block text-xs font-gaming font-bold uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Bio & Motto E-Sports</span>
                </label>
                <textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Tuliskan pengalaman bertanding, visi turnamen, atau moto e-sports Anda..."
                  rows={2}
                  maxLength={220}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 text-zinc-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-none transition-colors resize-none"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span>Akan tampil di kartu profil dan dossier scouting.</span>
                  <span>{formBio.length}/220</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-gaming font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-gaming font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm flex items-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {playerProfile?.isProfileCompleted ? "UPDATE PROFIL ATLET" : "SIMPAN PROFIL LENGKAP"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Perubahan Profil */}
      <ConfirmActionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSaveProfile}
        title="Konfirmasi Perubahan Profil"
        message="Apakah Anda yakin ingin melakukan perubahan pada profil atlet ini?"
        confirmText="Ya, Simpan Perubahan"
        cancelText="Tidak / Batal"
      />

      {/* =========================================================================
          MODAL FULLSCREEN KARTU SCOUT VISION
          ========================================================================= */}
      {showFullscreenCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-[#09090b]">
            <button
              onClick={() => setShowFullscreenCard(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <PlayerVisionCard
              playerData={cardPlayerData}
              scoreResult={cardScoreResult}
              customAvatar={playerAvatar}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL CETAK / DOWNLOAD LAPORAN SCOUTING RESMI (A4 PDF)
          ========================================================================= */}
      {showReportModal && (
        <ScoutingReportModal
          player={{
            ...cardPlayerData,
            Player_ID: cardPlayerData.gameId || cardPlayerData.Player_ID || "5123984729",
            IGN: cardPlayerData.ign || activeIGN,
            Player_Score: cardScoreResult.player_score,
            Score_Category: cardScoreResult.score_category,
            Tier: cardPlayerData.tier,
            Kills: cardPlayerData.kills,
            Damage_Dealt: cardPlayerData.damage_dealt,
            Survival_Time_Minutes: cardPlayerData.survival_time_minutes,
            Headshot_Percentage: cardPlayerData.headshot_percentage,
            Assists: cardPlayerData.assists,
            Revives: cardPlayerData.revives,
            Distance_Travelled_km: cardPlayerData.distance_travelled_km,
            Longest_Kill_meters: cardPlayerData.longest_kill_meters,
            Heals_Used: cardPlayerData.heals_used,
            Boosts_Used: cardPlayerData.boosts_used,
            Match_Rank: cardPlayerData.match_rank,
            Map: cardPlayerData.map,
            Favorite_Weapon: cardPlayerData.favorite_weapon,
            avatar: playerAvatar,
            isCurrentUser: true,
          }}
          notes="Laporan portofolio resmi atlet terverifikasi sistem kecerdasan buatan PulseScout XGBoost."
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Notifikasi Sebaris Simpel Berhasil Update Profil Atlet */}
      <SimpleToastNotification
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Data profil berhasil diperbarui!"
      />
    </div>
  );
};
