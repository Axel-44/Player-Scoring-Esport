/**
 * frontend/src/pages/manager/ManagerTeamProfilePage.jsx
 * Halaman Manajemen Profil Tim E-Sports & Lowongan Roster untuk Manager.
 * Fitur:
 * 1. Upload & Manajemen Logo Tim Resmi (disimpan ke localStorage & tercermin di Direktori Publik).
 * 2. Identitas Tim: Nama Tim, Tag Roster, Kota Asal / Gaming House, Tahun Berdiri, dan Kapasitas Roster (cth 3/5 pemain).
 * 3. Visi & Misi Tim E-Sports profesional.
 * 4. Kebutuhan Roster Multi-Role: Memilih 1, 2, 3, atau ke-4 role sekaligus (Rusher, Sniper, Zone Controller, Support / IGL).
 * 5. Syarat Minimum Skor XGBoost & Catatan Scrim / Trial.
 * 6. Kontak Resmi Rekrutmen: WhatsApp Official, Email, Instagram.
 * 7. Live Card Preview interaktif ala Esports Franchise Card.
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { SimpleToastNotification } from "../../components/common/SimpleToastNotification";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";
import {
  Shield,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Save,
  Eye,
  ExternalLink,
  Crosshair,
  Award,
  Zap,
  Phone,
  Mail,
  Share2,
  Users,
  Target,
  FileText,
  AlertCircle,
  Check,
  Upload,
  Trash2,
  Camera,
} from "lucide-react";

export const ManagerTeamProfilePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isDemo = (user?.email || "").toLowerCase().trim() === "manager@esports-talent.id";
  const isFirstTime = Boolean(location.state?.isFirstTime);

  const { managerTeam, updateManagerTeam } = usePlayerStore();
  const logoInputRef = useRef(null);

  const [form, setForm] = useState({
    name: managerTeam?.name || (isDemo ? "Apex Predator Esports" : (user?.user_metadata?.full_name ? `Tim ${user.user_metadata.full_name}` : "")),
    tag: managerTeam?.tag || (isDemo ? "APX" : ""),
    division: managerTeam?.division || "PUBG Mobile Competitive",
    city: managerTeam?.city || (isDemo ? "Bandung, Jawa Barat" : ""),
    established: managerTeam?.established || new Date().getFullYear().toString(),
    logoUrl: managerTeam?.logoUrl || null,
    activeRosterCount: managerTeam?.activeRosterCount ?? (isDemo ? 3 : 0),
    maxRosterCount: managerTeam?.maxRosterCount ?? 5,
    vision:
      managerTeam?.vision ||
      (isDemo
        ? "Membangun skuad PUBG Mobile tier 1 baru dengan memanfaatkan analisis talenta objektif machine learning."
        : ""),
    mission:
      managerTeam?.mission ||
      (isDemo
        ? "Merekrut talenta potensial berperingkat tinggi, memfasilitasi gaming house modern, dan bersaing di PMGC Qualifier."
        : ""),
    openRecruitment: managerTeam?.openRecruitment ?? true,
    neededRoles: Array.isArray(managerTeam?.neededRoles) && managerTeam.neededRoles.length > 0
      ? managerTeam.neededRoles
      : (isDemo ? ["Rusher / Fragger", "Support / IGL"] : []),
    recruitmentMinScore: managerTeam?.recruitmentMinScore ?? 75.0,
    trialNotes:
      managerTeam?.trialNotes ||
      (isDemo
        ? "Terbuka bagi talenta agresif dengan skor ML minimal 76.0, siap menjalani bootcamp di Bandung, dan punya komitmen turnamen tinggi."
        : ""),
    contactManager: managerTeam?.contactManager || user?.user_metadata?.full_name || (isDemo ? "Manager Scouting Apex" : ""),
    contactPhone: managerTeam?.contactPhone || (isDemo ? "0812-7788-9900" : ""),
    contactEmail: managerTeam?.contactEmail || user?.email || (isDemo ? "recruitment@apexpredator.id" : ""),
    instagram: managerTeam?.instagram || (isDemo ? "@apexpredator_esports" : ""),
  });

  // Sinkronkan data form saat managerTeam berubah
  useEffect(() => {
    if (managerTeam) {
      setForm({
        name: managerTeam.name || (isDemo ? "Apex Predator Esports" : (user?.user_metadata?.full_name ? `Tim ${user.user_metadata.full_name}` : "")),
        tag: managerTeam.tag || (isDemo ? "APX" : ""),
        division: managerTeam.division || "PUBG Mobile Competitive",
        city: managerTeam.city || (isDemo ? "Bandung, Jawa Barat" : ""),
        established: managerTeam.established || new Date().getFullYear().toString(),
        logoUrl: managerTeam.logoUrl || null,
        activeRosterCount: managerTeam.activeRosterCount ?? (isDemo ? 3 : 0),
        maxRosterCount: managerTeam.maxRosterCount ?? 5,
        vision:
          managerTeam.vision ||
          (isDemo
            ? "Membangun skuad PUBG Mobile tier 1 baru dengan memanfaatkan analisis talenta objektif machine learning."
            : ""),
        mission:
          managerTeam.mission ||
          (isDemo
            ? "Merekrut talenta potensial berperingkat tinggi, memfasilitasi gaming house modern, dan bersaing di PMGC Qualifier."
            : ""),
        openRecruitment: managerTeam.openRecruitment ?? true,
        neededRoles: Array.isArray(managerTeam.neededRoles) && managerTeam.neededRoles.length > 0
          ? managerTeam.neededRoles
          : (isDemo ? ["Rusher / Fragger", "Support / IGL"] : []),
        recruitmentMinScore: managerTeam.recruitmentMinScore ?? 75.0,
        trialNotes: managerTeam.trialNotes || "",
        contactManager: managerTeam.contactManager || user?.user_metadata?.full_name || (isDemo ? "Manager Scouting Apex" : ""),
        contactPhone: managerTeam.contactPhone || (isDemo ? "0812-7788-9900" : ""),
        contactEmail: managerTeam.contactEmail || user?.email || (isDemo ? "recruitment@apexpredator.id" : ""),
        instagram: managerTeam.instagram || (isDemo ? "@apexpredator_esports" : ""),
      });
    }
  }, [managerTeam, isDemo, user]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("team_created");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Upload Logo Tim
  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (PNG, JPG, atau WEBP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file logo maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange("logoUrl", event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange("logoUrl", null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Toggle multi-select roles
  const availableRoles = [
    "Rusher / Fragger",
    "Sniper / Marksman",
    "Zone Controller",
    "Support / IGL",
  ];

  const toggleRole = (roleName) => {
    setForm((prev) => {
      const current = prev.neededRoles || [];
      if (current.includes(roleName)) {
        return { ...prev, neededRoles: current.filter((r) => r !== roleName) };
      } else {
        return { ...prev, neededRoles: [...current, roleName] };
      }
    });
  };

  // Buka Dialog Konfirmasi sebelum Menyimpan Perubahan
  const handlePromptSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) {
      alert("Nama Tim E-Sports wajib diisi!");
      return;
    }
    setShowConfirmModal(true);
  };

  // Eksekusi Simpan Data Tim setelah Konfirmasi "Ya"
  const handleConfirmSave = async () => {
    setIsSaving(true);
    const isUpdate = Boolean(managerTeam?.isProfileCompleted || (managerTeam && managerTeam.name));
    try {
      await updateManagerTeam({
        ...form,
        activeRosterCount: form.activeRosterCount === "" ? 0 : Math.max(0, Number(form.activeRosterCount)),
        maxRosterCount: Number(form.maxRosterCount) || 5,
        recruitmentMinScore: Number(form.recruitmentMinScore) || 75.0,
        recruitmentRole: form.neededRoles.join(", ") || "All Roles",
      });
      setShowConfirmModal(false);
      setModalType(isUpdate ? "team_updated" : "team_created");
      setShowSuccessModal(true);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Gagal menyimpan tim:", err);
      alert("Gagal menyimpan profil tim ke cloud. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const remainingSlots = Math.max(0, Number(form.maxRosterCount || 5) - Math.max(0, Number(form.activeRosterCount ?? 0)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-600/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>OFFICIAL TEAM HUB MANAGEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-gaming font-black tracking-wide uppercase">
              PROFIL TIM & BURSA REKRUTMEN
            </h1>
            <p className="text-zinc-300 dark:text-zinc-400 text-sm max-w-2xl font-mono leading-relaxed">
              Kelola logo organisasi tim, kapasitas roster, kebutuhan slot multi-role (*Rusher, Sniper, Zone Controller, Support*), 
              serta kriteria skor Machine Learning yang dipantau atlet di Direktori Tim.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/teams"
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm"
            >
              <Eye className="w-4 h-4 text-zinc-300" />
              <span>LIHAT DI DIREKTORI TIM</span>
            </Link>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Profil tim dan lowongan roster berhasil disimpan! Perubahan langsung aktif di Direktori Publik.</span>
        </div>
      )}

      {/* Banner Onboarding Manager Baru */}
      {(!managerTeam?.isProfileCompleted || isFirstTime) && (
        <div className="rounded-3xl p-6 sm:p-7 border border-red-500/40 bg-gradient-to-r from-red-600/10 via-amber-500/10 to-transparent dark:from-red-950/40 dark:via-zinc-900 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-gaming font-bold uppercase tracking-wider">
                  LANGKAH 1: LENGKAPI IDENTITAS TIM
                </span>
                <span className="text-xs font-gaming text-zinc-500 dark:text-zinc-400">
                  ONBOARDING MANAGER RESMI
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                Selamat Datang di PulseScout! Lengkapi Profil Tim & Kriteria Rekrutmen
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                Sebagai Manager tim baru, silakan lengkapi nama organisasi tim, tag singkatan, kota basis/gaming house, Visi & Misi, serta kriteria minimum skor Machine Learning dan kontak resmi rekrutmen. Setelah formulir disimpan, Anda dapat langsung mengelola talent scouting dan pada login berikutnya akan otomatis diarahkan ke Dashboard Manajemen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form Input (Kiri) & Live Card Preview (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            FORM EDITOR (lg:col-span-7)
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handlePromptSave} className="space-y-6">
            
            {/* Bagian 1: Identitas Pokok & Logo Tim */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
              <h2 className="text-sm font-gaming font-black text-zinc-900 dark:text-zinc-100 tracking-wider uppercase flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Shield className="w-4 h-4 text-red-500" />
                <span>1. IDENTITAS ORGANISASI & LOGO TIM</span>
              </h2>

              {/* Upload Logo Tim Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoSelect}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {/* Box Preview Logo */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 shadow-sm relative group">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt={form.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-center text-zinc-400">
                      <Shield className="w-7 h-7 mx-auto mb-1 text-zinc-300 dark:text-zinc-600" />
                      <span className="text-[9px] font-mono block">LOGO TIM</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="text-xs font-gaming font-bold uppercase text-zinc-800 dark:text-zinc-200">
                    Logo Resmi Tim E-Sports
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-500">
                    Format PNG, JPG, atau WEBP transparan (Maks. 2MB). Ditampilkan di bursa direktori publik.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-gaming font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.logoUrl ? "GANTI LOGO" : "UPLOAD LOGO"}</span>
                    </button>
                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 text-xs font-gaming font-bold tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>HAPUS</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Fields Identitas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Nama Tim E-Sports *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Contoh: Apex Predator Esports"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-gaming text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Tag / Singkatan *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={form.tag}
                    onChange={(e) => handleChange("tag", e.target.value.toUpperCase())}
                    placeholder="Contoh: APX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm uppercase focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Kota Asal / Gaming House *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Contoh: Bandung, Jawa Barat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Tahun Berdiri
                  </label>
                  <input
                    type="text"
                    value={form.established}
                    onChange={(e) => handleChange("established", e.target.value)}
                    placeholder="Contoh: 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              {/* Roster Capacity Counters */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-gaming font-bold uppercase text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-red-600" />
                    <span>STATUS & KAPASITAS ROSTER TIM SAAT INI</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    Sisa {remainingSlots} Slot Terbuka
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Jumlah Pemain Saat Ini *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={form.activeRosterCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          handleChange("activeRosterCount", "");
                        } else {
                          const parsed = parseInt(val, 10);
                          handleChange("activeRosterCount", isNaN(parsed) ? 0 : Math.max(0, parsed));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Target Roster Maksimal
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="10"
                      value={form.maxRosterCount}
                      onChange={(e) => handleChange("maxRosterCount", parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Visi & Misi Tim */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <h2 className="text-sm font-gaming font-black text-zinc-900 dark:text-zinc-100 tracking-wider uppercase flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Target className="w-4 h-4 text-red-500" />
                <span>2. VISI & MISI TIM</span>
              </h2>

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Visi Tim *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.vision}
                  onChange={(e) => handleChange("vision", e.target.value)}
                  placeholder="Visi jangka panjang tim..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Misi Tim *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.mission}
                  onChange={(e) => handleChange("mission", e.target.value)}
                  placeholder="Langkah nyata dan fokus pembinaan tim..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Bagian 3: Slot Open Recruitment & Multi-Role Checkbox */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h2 className="text-sm font-gaming font-black text-zinc-900 dark:text-zinc-100 tracking-wider uppercase flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-red-500" />
                  <span>3. KEBUTUHAN SLOT ROSTER (MULTI-ROLE SELECTION)</span>
                </h2>

                {/* Toggle Status Rekrutmen */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.openRecruitment}
                    onChange={(e) => handleChange("openRecruitment", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2.5 text-xs font-gaming font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    {form.openRecruitment ? "BUKA LOWONGAN" : "ROSTER PENUH"}
                  </span>
                </label>
              </div>

              {form.openRecruitment ? (
                <div className="space-y-4 pt-1">
                  
                  {/* Multi-Role Checkbox Selection */}
                  <div>
                    <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-2">
                      Role yang Dibutuhkan (Pilih 1, 2, atau Semua Role) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {availableRoles.map((roleName) => {
                        const isSelected = form.neededRoles?.includes(roleName);
                        return (
                          <button
                            key={roleName}
                            type="button"
                            onClick={() => toggleRole(roleName)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[70px] cursor-pointer ${
                              isSelected
                                ? "bg-red-600/15 border-red-600 text-red-600 dark:text-red-400 shadow-sm"
                                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                            }`}
                          >
                            <span className="text-xs font-gaming font-bold uppercase leading-tight">
                              {roleName}
                            </span>
                            <span className="text-[10px] font-mono mt-1 flex items-center gap-1 font-semibold">
                              {isSelected ? "✓ DIPILIH" : "+ PILIH"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                        Syarat Minimum Skor ML XGBoost *
                      </label>
                      <span className="text-xs font-gaming font-black text-red-600">
                        {Number(form.recruitmentMinScore).toFixed(1)} / 100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="0.5"
                      value={form.recruitmentMinScore}
                      onChange={(e) => handleChange("recruitmentMinScore", parseFloat(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                      <span>50 (Talenta Muda)</span>
                      <span>75 (Kompetitif Tier 2)</span>
                      <span>90+ (Pro Tier 1)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Catatan Kriteria Scrim / Trial Uji Tanding
                    </label>
                    <textarea
                      rows={2}
                      value={form.trialNotes}
                      onChange={(e) => handleChange("trialNotes", e.target.value)}
                      placeholder="Contoh: Jam scrim pukul 19:00 - 23:00 WIB, disiplin rotasi dan komunikasi radio jernih."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>
                    Status rekrutmen sedang ditutup. Tim Anda akan bertanda <strong>ROSTER FULL</strong> di direktori publik.
                  </span>
                </div>
              )}
            </div>

            {/* Bagian 4: Kontak Resmi & Media Sosial */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <h2 className="text-sm font-gaming font-black text-zinc-900 dark:text-zinc-100 tracking-wider uppercase flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Phone className="w-4 h-4 text-red-500" />
                <span>4. KONTAK RESMI SCOUTING & MANAGER</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Nama Manajer / PIC *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactManager}
                    onChange={(e) => handleChange("contactManager", e.target.value)}
                    placeholder="Contoh: Coach Isfan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    No. WhatsApp Resmi *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    placeholder="Contoh: 0812-7788-9900"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Email Rekrutmen
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    placeholder="Contoh: recruitment@apexpredator.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Akun Instagram Tim
                  </label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    placeholder="Contoh: @apexpredator_esports"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-black text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {managerTeam?.isProfileCompleted || (managerTeam && managerTeam.name)
                    ? "UPDATE TIM"
                    : "SIMPAN & PUBLIKASIKAN PROFIL TIM"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* =========================================================================
            LIVE CARD PREVIEW (lg:col-span-5)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-gaming font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-red-500" />
              LIVE PREVIEW KARTU TIM PUBLIK
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Pratinjau tampilan pemain
            </span>
          </div>

          {/* Kartu Pratinjau Desain E-Sports Franchise Hub */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-lg relative overflow-hidden group">
            {/* Header: Logo, Nama, Tag, Status */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5">
                {/* Logo Badge (Custom Upload or Clean Background) */}
                <div
                  className={`w-16 h-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center font-gaming font-black text-xl shadow-sm shrink-0 ${
                    form.logoUrl
                      ? "bg-white dark:bg-zinc-950 p-1.5"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  }`}
                >
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt={form.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>{form.tag || "APX"}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-gaming font-black text-zinc-900 dark:text-white uppercase leading-tight">
                      {form.name || "Apex Predator Esports"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {form.city || "Bandung, Jawa Barat"}
                    </span>
                    <span>•</span>
                    <span>Est. {form.established || "2024"}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {form.openRecruitment ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-gaming font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    OPEN TRIAL
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-gaming font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    ROSTER FULL
                  </span>
                )}
              </div>
            </div>

            {/* Roster Capacity Gauge */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-red-500" />
                  Roster Terisi:
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {form.activeRosterCount === "" ? 0 : form.activeRosterCount} / {form.maxRosterCount} Pemain ({remainingSlots} Slot Terbuka)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((Number(form.activeRosterCount) || 0) / (Number(form.maxRosterCount) || 5)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Visi & Misi Ringkas */}
            <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
              <div>
                <span className="text-[10px] font-gaming font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  VISI:
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 font-mono text-xs leading-relaxed mt-0.5 line-clamp-2">
                  "{form.vision}"
                </p>
              </div>
              <div>
                <span className="text-[10px] font-gaming font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  MISI:
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono text-xs leading-relaxed mt-0.5 line-clamp-2">
                  {form.mission}
                </p>
              </div>
            </div>

            {/* Kebutuhan Roster (Highlight Box Multi-Role) */}
            {form.openRecruitment && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-red-600/30 space-y-2.5 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-gaming font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-red-500" />
                    SLOT ROLE DIBUKA ({form.neededRoles?.length || 0}):
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600/10 text-red-600 dark:text-red-300 border border-red-500/30">
                    MIN SKOR: {Number(form.recruitmentMinScore).toFixed(1)}
                  </span>
                </div>

                {/* Multi-Role Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {form.neededRoles?.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-gaming font-bold uppercase"
                    >
                      {r}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                  "{form.trialNotes}"
                </p>
              </div>
            )}

            {/* Kontak Official Footer */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{form.contactPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{form.instagram}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 text-xs font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Atlet dapat mem-bookmark tim Anda ke dalam <strong>Dream Team Wishlist</strong> mereka dan langsung
                mengontak manajer melalui tautan WhatsApp terverifikasi.
              </span>
            </p>
          </div>
        </div>

      </div>

      {/* Modal Dialog Konfirmasi Perubahan Profil Tim */}
      <ConfirmActionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Perubahan Tim"
        message="Apakah Anda yakin ingin melakukan perubahan pada profil tim ini?"
        confirmText="Ya, Perbarui Tim"
        cancelText="Tidak / Batal"
        isLoading={isSaving}
      />

      {/* Notifikasi Sebaris Simpel Berhasil Upload / Update Data Tim */}
      <SimpleToastNotification
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={modalType === "team_created" ? "Data tim berhasil ditambahkan!" : "Data tim berhasil diperbarui!"}
      />
    </div>
  );
};
