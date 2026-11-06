/**
 * frontend/src/pages/player/PlayerInputPage.jsx
 * Halaman input statistik pertandingan & kalkulasi skor real-time via FastAPI /predict (FR-02, FR-03).
 * Otomatis menyimpan hasil skor ke riwayat pemain dan mendaftarkannya ke leaderboard.
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { ScoreGauge } from "../../components/common/ScoreGauge";
import { PlayerRadarChart } from "../../components/common/PlayerRadarChart";
import { PlayerVisionCard } from "../../components/player/PlayerVisionCard";
import { SimpleToastNotification } from "../../components/common/SimpleToastNotification";
import { compressImageFile } from "../../utils/imageCompressor";
import {
  Crosshair,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle,
  Activity,
  Award,
  TrendingUp,
  RotateCcw,
  Eye,
  Zap,
  Maximize2,
  X,
  User,
  Trophy,
  Clock,
  Compass,
  Trash2,
  Lock,
  EyeOff,
  Upload,
  Camera,
} from "lucide-react";

// Karakteristik & Batas Durasi Resmi Map PUBG Mobile (Kompabilitas Integritas Data)
export const MAP_PROPERTIES = {
  Erangel: {
    size: "8x8 km",
    maxSurvival: 34.0,
    players: 100,
    zoneNote: "Map klasik kompetitif. Durasi zona akhir maksimal ~34 menit.",
  },
  Miramar: {
    size: "8x8 km",
    maxSurvival: 36.0,
    players: 100,
    zoneNote: "Map gurun terluas. Durasi zona akhir maksimal ~36 menit.",
  },
  Vikendi: {
    size: "6x6 km",
    maxSurvival: 28.0,
    players: 100,
    zoneNote: "Map salju medium 6x6 km. Durasi zona akhir maksimal ~28 menit.",
  },
  Sanhok: {
    size: "4x4 km",
    maxSurvival: 24.0,
    players: 100,
    zoneNote: "Map rimba tempo cepat 4x4 km. Durasi zona akhir maksimal ~24 menit.",
  },
  Livik: {
    size: "2x2 km",
    maxSurvival: 15.0,
    players: 52,
    zoneNote: "Map mini aksi kilat 52 player. Durasi zona akhir maksimal ~15 menit.",
  },
};

export const PlayerInputPage = () => {
  const { user, profile } = useAuth();
  const {
    recordPlayerScore,
    publishMatchToLeaderboard,
    unpublishMatchFromLeaderboard,
    playerProfile,
    playerAvatar,
  } = usePlayerStore();
  const isDemo = (user?.email || "").toLowerCase().trim() === "player@esports-talent.id";
  const isProfileReady = isDemo || Boolean(playerProfile?.isProfileCompleted);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Template Form Kosong & Sampel Cepat
  const getEmptyFormData = () => ({
    ign: playerProfile?.ign || user?.user_metadata?.full_name || (isDemo ? "BTR_Ryzen" : ""),
    role: playerProfile?.role || (isDemo ? "Rusher / Fragger" : "Rusher / Fragger"),
    tier: "Crown",
    map: "Erangel",
    favorite_weapon: "M416",
    match_rank: "",
    kills: "",
    damage_dealt: "",
    survival_time_minutes: "",
    headshot_percentage: "",
    assists: "",
    revives: "",
    distance_travelled_km: "",
    longest_kill_meters: "",
    heals_used: "",
    boosts_used: "",
    match_screenshot_url: null,
  });

  const getSampleFormData = () => ({
    ign: playerProfile?.ign || user?.user_metadata?.full_name || (isDemo ? "BTR_Ryzen" : "Player"),
    role: playerProfile?.role || "Rusher / Fragger",
    tier: "Crown",
    map: "Erangel",
    favorite_weapon: "M416",
    match_rank: "5",
    kills: "6",
    damage_dealt: "650",
    survival_time_minutes: "25",
    headshot_percentage: "35",
    assists: "3",
    revives: "2",
    distance_travelled_km: "5.8",
    longest_kill_meters: "180.5",
    heals_used: "4",
    boosts_used: "5",
    match_screenshot_url: null,
  });

  // State Form (Default Dimulai dari KOSONG sesuai kebutuhan pengguna)
  const [formData, setFormData] = useState(getEmptyFormData);

  const screenshotInputRef = useRef(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [compressingImage, setCompressingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [savedRecord, setSavedRecord] = useState(null);
  const [resultTab, setResultTab] = useState("vision"); // "vision" | "radar"
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Opsi Tujuan Penyimpanan: "profile_only" (privat di profil saja) atau "leaderboard" (publik)
  const [publishChoice, setPublishChoice] = useState("profile_only");
  const [isMatchPublished, setIsMatchPublished] = useState(false);

  const handleTogglePublish = async () => {
    if (!savedRecord?.id) return;
    if (isMatchPublished) {
      await unpublishMatchFromLeaderboard(savedRecord.id);
      setIsMatchPublished(false);
      setSavedRecord((prev) => ({ ...prev, is_published: false }));
    } else {
      await publishMatchToLeaderboard(savedRecord.id);
      setIsMatchPublished(true);
      setSavedRecord((prev) => ({ ...prev, is_published: true }));
    }
  };

  // Otomatis sinkronkan IGN & Role formulir dengan profil pemain aktif
  useEffect(() => {
    if (playerProfile) {
      setFormData((prev) => ({
        ...prev,
        ign: playerProfile.ign || prev.ign,
        role: playerProfile.role || prev.role || "Rusher / Fragger",
      }));
    }
  }, [playerProfile]);

  const availableRoles = [
    { value: "Rusher / Fragger", label: "Rusher / Fragger" },
    { value: "Sniper / Marksman", label: "Sniper / Marksman" },
    { value: "Zone Controller", label: "Zone Controller" },
    { value: "Support / IGL", label: "Support / IGL" },
  ];

  const tiers = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Crown",
    "Ace",
    "Conqueror",
  ];

  const maps = ["Erangel", "Miramar", "Sanhok", "Livik", "Vikendi"];
  const weapons = ["M416", "AKM", "M762", "SCAR-L", "Groza", "AWM", "Kar98k", "UMP45"];

  // Handler Input Bebas (Bisa dihapus sampai kosong tanpa terkunci ke 0 atau 01/05)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Penanganan Upload & Kompresi Screenshot Bukti Pertandingan
  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File yang diunggah harus berupa file gambar (JPG, PNG, atau WEBP).");
      return;
    }

    try {
      setCompressingImage(true);
      setError("");
      // Kompres resolusi ke maks 1280x720, quality 0.75 (~80-150 KB)
      const compressed = await compressImageFile(file, 1280, 720, 0.75);
      setScreenshotPreview(compressed);
      setFormData((prev) => ({
        ...prev,
        match_screenshot_url: compressed,
      }));
    } catch (err) {
      console.error("Gagal memproses screenshot:", err);
      setError("Gagal memproses gambar screenshot. Silakan coba file lain.");
    } finally {
      setCompressingImage(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setFormData((prev) => ({
      ...prev,
      match_screenshot_url: null,
    }));
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = "";
    }
  };

  // Reset Formulir ke Kosong
  const handleResetForm = () => {
    setFormData(getEmptyFormData());
    setResult(null);
    setSavedRecord(null);
    setError("");
    setScreenshotPreview(null);
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = "";
    }
  };

  // Isi Data Contoh untuk Tes Cepat
  const handleFillSample = () => {
    setFormData(getSampleFormData());
    setError("");
    setScreenshotPreview(null);
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = "";
    }
  };

  const handleCalculateScore = async (e) => {
    e.preventDefault();
    setError("");

    if (!isProfileReady) {
      setError("Profil atlet belum lengkap. Anda wajib melengkapi data profil atlet (IGN, ID Game, dan Role) di halaman Profil terlebih dahulu sebelum dapat menginput statistik pertandingan.");
      return;
    }

    // --- 1. Validasi Kolom Wajib Diisi (Tidak boleh kosong) ---
    if (!formData.ign || formData.ign.trim() === "") {
      setError("In-Game Name (IGN) wajib diisi.");
      return;
    }

    const requiredFields = [
      { key: "match_rank", label: "Match Rank" },
      { key: "kills", label: "Jumlah Kills" },
      { key: "damage_dealt", label: "Damage Dealt" },
      { key: "survival_time_minutes", label: "Survival Time" },
      { key: "headshot_percentage", label: "Headshot Percentage" },
      { key: "assists", label: "Assists" },
      { key: "revives", label: "Revives" },
      { key: "distance_travelled_km", label: "Jarak Tempuh" },
      { key: "longest_kill_meters", label: "Longest Kill" },
      { key: "heals_used", label: "Item Heals Digunakan" },
      { key: "boosts_used", label: "Item Boosts Digunakan" },
    ];

    for (const f of requiredFields) {
      const val = formData[f.key];
      if (val === "" || val === undefined || val === null) {
        setError(`Kolom '${f.label}' wajib diisi sebelum melakukan kalkulasi skor.`);
        return;
      }
    }

    // Konversi nilai ke numerik
    const rankNum = Number(formData.match_rank);
    const killsNum = Number(formData.kills);
    const damageNum = Number(formData.damage_dealt);
    const survivalNum = Number(formData.survival_time_minutes);
    const headshotNum = Number(formData.headshot_percentage);
    const assistsNum = Number(formData.assists);
    const revivesNum = Number(formData.revives);
    const distanceNum = Number(formData.distance_travelled_km);
    const longestKillNum = Number(formData.longest_kill_meters);
    const healsNum = Number(formData.heals_used);
    const boostsNum = Number(formData.boosts_used);

    // --- 2. Validasi Match Rank (1 s/d 100) ---
    if (isNaN(rankNum) || rankNum < 1 || rankNum > 100) {
      setError("Match Rank tidak valid. Peringkat akhir pertandingan harus bernilai antara 1 sampai 100.");
      return;
    }

    // --- 3. Validasi Kills (Maksimal 100 Pemain dalam 1 Match) ---
    if (isNaN(killsNum) || killsNum < 0) {
      setError("Jumlah Kills tidak valid. Nilai tidak boleh bernilai negatif.");
      return;
    }
    if (killsNum > 100) {
      setError("Jumlah Kills tidak valid. Dalam 1 pertandingan PUBG Mobile terdapat maksimal 100 pemain (maksimal 100 kills).");
      return;
    }

    // --- 4. Validasi Assists (Maksimal 100) ---
    if (isNaN(assistsNum) || assistsNum < 0) {
      setError("Jumlah Assists tidak valid. Nilai tidak boleh bernilai negatif.");
      return;
    }
    if (assistsNum > 100) {
      setError("Jumlah Assists tidak valid. Maksimal 100 assists dalam 1 pertandingan.");
      return;
    }

    // --- 5. Validasi Persentase Headshot (0% s/d 100%) ---
    if (isNaN(headshotNum) || headshotNum < 0 || headshotNum > 100) {
      setError("Persentase Headshot tidak valid. Nilai harus berada di rentang 0% hingga 100%.");
      return;
    }

    // --- 6. Validasi Survival Time Sesuai Karakteristik Map Terpilih ---
    const currentMapInfo = MAP_PROPERTIES[formData.map] || MAP_PROPERTIES.Erangel;
    if (isNaN(survivalNum) || survivalNum < 0) {
      setError("Waktu bertahan (Survival Time) tidak boleh bernilai negatif.");
      return;
    }
    if (survivalNum > currentMapInfo.maxSurvival) {
      setError(
        `Waktu bertahan (${survivalNum} menit) melebihi durasi maksimal pertandingan di map ${formData.map} (${currentMapInfo.size}). Pertandingan zona akhir di map ${formData.map} maksimal adalah ${currentMapInfo.maxSurvival} menit.`
      );
      return;
    }

    // --- 7. Validasi Statistik Numerik Lainnya ---
    const numericalStats = [
      { name: "Damage Dealt", val: damageNum },
      { name: "Revives", val: revivesNum },
      { name: "Jarak Tempuh", val: distanceNum },
      { name: "Longest Kill", val: longestKillNum },
      { name: "Item Heals", val: healsNum },
      { name: "Item Boosts", val: boostsNum },
    ];

    for (const stat of numericalStats) {
      if (isNaN(stat.val) || stat.val < 0) {
        setError(`Statistik '${stat.name}' tidak valid. Nilai tidak boleh bernilai negatif.`);
        return;
      }
    }

    if (revivesNum > 50) {
      setError("Jumlah Revives melebihi batas wajar pertandingan (maksimal 50).");
      return;
    }

    setLoading(true);

    try {
      // 1. Panggil FastAPI /predict endpoint
      const payload = {
        tier: formData.tier,
        kills: killsNum,
        damage_dealt: damageNum,
        survival_time_minutes: survivalNum,
        headshot_percentage: headshotNum,
        assists: assistsNum,
        revives: revivesNum,
        distance_travelled_km: distanceNum,
        longest_kill_meters: longestKillNum,
        heals_used: healsNum,
        boosts_used: boostsNum,
        match_rank: rankNum,
      };

      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errorMsg = "Gagal memproses prediksi dari model.";
        if (errData?.detail) {
          if (Array.isArray(errData.detail)) {
            errorMsg = errData.detail
              .map((d) => `${d.loc?.slice(-1)[0] || "Field"}: ${d.msg}`)
              .join("; ");
          } else if (typeof errData.detail === "string") {
            errorMsg = errData.detail;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);

      // 2. Simpan record ke Player Store (dengan pilihan tujuan: leaderboard vs profil pribadi)
      const shouldPublish = publishChoice === "leaderboard";
      const recorded = recordPlayerScore(formData, data, shouldPublish);
      setSavedRecord(recorded);
      setIsMatchPublished(shouldPublish);
      setShowSuccessModal(true);
    } catch (err) {
      setError(
        err.message || "Gagal terhubung ke ML Backend API. Pastikan server FastAPI berjalan di port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedMapConfig = MAP_PROPERTIES[formData.map] || MAP_PROPERTIES.Erangel;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider mb-2">
            <Crosshair className="w-4 h-4" />
            PLAYER PERFORMANCE EVALUATOR (FR-02, FR-03, BB-03)
          </div>
          <h1 className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
            INPUT STATISTIK & KALKULASI SKOR REAL-TIME
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Masukkan statistik pertandingan PUBG Mobile Anda. Model XGBoost terlatih akan menganalisis 12 parameter performa dan mengembalikan <strong>Player Score (0-100)</strong> secara instan (&le; 1 detik).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/player/profile"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>BUKA PROFIL & KARTU VISION</span>
          </Link>
        </div>
      </div>

      {/* Peringatan Wajib Lengkapi Profil Akun Terlebih Dahulu */}
      {!isProfileReady && (
        <div className="rounded-3xl p-6 sm:p-7 border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-transparent dark:from-amber-950/40 dark:via-zinc-900 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                Lengkapi Profil Atlet Terlebih Dahulu
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                Sesuai alur scouting resmi, Anda wajib melengkapi data profil atlet (Nickname / IGN, ID Game PUBG Mobile, dan Role) di halaman Profil sebelum dapat menginput statistik pertandingan.
              </p>
            </div>
          </div>
          <Link
            to="/player/profile"
            state={{ isFirstTime: true }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            <User className="w-4 h-4" />
            <span>Lengkapi Profil Sekarang</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs (2 Kolom) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>FORMULIR STATISTIK PERTANDINGAN</span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tombol Kosongkan Form */}
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-xs font-gaming font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Kosongkan seluruh nilai formulir untuk pertandingan baru"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>KOSONGKAN</span>
              </button>

              {/* Tombol Contoh Data Cepat */}
              <button
                type="button"
                onClick={handleFillSample}
                className="px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/30 text-xs font-gaming font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Isi data sampel match untuk uji coba cepat"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>DATA CONTOH</span>
              </button>

              <Link
                to="/player/profile"
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-gaming font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>PROFIL &rarr;</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-600/10 border border-red-600/30 flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCalculateScore} noValidate className="space-y-6">
            {/* Player Info Row (Metadata Profil & Turnamen - Sejajar Presisi) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 items-start">
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  name="ign"
                  value={formData.ign}
                  onChange={handleChange}
                  required
                  placeholder="IGN PUBG Mobile..."
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Role Spesialisasi
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:border-red-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center justify-between">
                  <span>Map Pertandingan</span>
                  <span className="text-[10px] text-zinc-500 font-mono font-normal">
                    {selectedMapConfig.size}
                  </span>
                </label>
                <select
                  name="map"
                  value={formData.map}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:border-red-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {maps.map((m) => (
                    <option key={m} value={m} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                      {m} ({MAP_PROPERTIES[m]?.size || ""})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Senjata Utama
                </label>
                <select
                  name="favorite_weapon"
                  value={formData.favorite_weapon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:border-red-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {weapons.map((w) => (
                    <option key={w} value={w} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 12 Parameter Input XGBoost (Bersih, Rapi, Tanpa Tanda Bintang & Tanpa Bobot Menumpuk) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tier */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Tier Pemain (Resmi)
                </label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                >
                  {tiers.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Match Rank */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label className="text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-bold">
                    Match Rank (1 s/d 100)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">1 = WWCD</span>
                </div>
                <input
                  type="number"
                  name="match_rank"
                  min="1"
                  max="100"
                  value={formData.match_rank}
                  onChange={handleChange}
                  placeholder="Peringkat akhir (1 - 100)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Kills */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label className="text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-bold">
                    Jumlah Kills
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Maks 100</span>
                </div>
                <input
                  type="number"
                  name="kills"
                  min="0"
                  max="100"
                  value={formData.kills}
                  onChange={handleChange}
                  placeholder="Jumlah eliminasi musuh..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Damage Dealt */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Damage Dealt
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="damage_dealt"
                  min="0"
                  value={formData.damage_dealt}
                  onChange={handleChange}
                  placeholder="Total damage dihasilkan (Contoh: 650.0)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Survival Time dengan Panduan Dinamis Map */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label className="text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-bold">
                    Survival Time (Menit)
                  </label>
                  <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold">
                    Maks {formData.map}: {selectedMapConfig.maxSurvival} mnt
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  name="survival_time_minutes"
                  min="0"
                  max={selectedMapConfig.maxSurvival}
                  value={formData.survival_time_minutes}
                  onChange={handleChange}
                  placeholder={`Durasi bertahan (Maks ${selectedMapConfig.maxSurvival} mnt di ${formData.map})...`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Headshot % */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label className="text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-bold">
                    Headshot Percentage (%)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">0 - 100%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  name="headshot_percentage"
                  min="0"
                  max="100"
                  value={formData.headshot_percentage}
                  onChange={handleChange}
                  placeholder="Persentase headshot (Contoh: 35.0)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Assists */}
              <div>
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <label className="text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-bold">
                    Assists
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Maks 100</span>
                </div>
                <input
                  type="number"
                  name="assists"
                  min="0"
                  max="100"
                  value={formData.assists}
                  onChange={handleChange}
                  placeholder="Jumlah assists ke rekan tim..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Revives */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Revives
                </label>
                <input
                  type="number"
                  name="revives"
                  min="0"
                  max="50"
                  value={formData.revives}
                  onChange={handleChange}
                  placeholder="Jumlah rekan diselamatkan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Distance Travelled */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Jarak Tempuh (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="distance_travelled_km"
                  min="0"
                  value={formData.distance_travelled_km}
                  onChange={handleChange}
                  placeholder="Total rotasi jelajah (Contoh: 5.8)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Longest Kill */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Longest Kill (Meter)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="longest_kill_meters"
                  min="0"
                  max="1000"
                  value={formData.longest_kill_meters}
                  onChange={handleChange}
                  placeholder="Jarak eliminasi terjauh (Contoh: 180.5)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Heals Used */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Item Heals Digunakan
                </label>
                <input
                  type="number"
                  name="heals_used"
                  min="0"
                  value={formData.heals_used}
                  onChange={handleChange}
                  placeholder="First Aid / Medkit / Bandage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Boosts Used */}
              <div>
                <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5 font-bold h-5 flex items-center">
                  Item Boosts Digunakan
                </label>
                <input
                  type="number"
                  name="boosts_used"
                  min="0"
                  value={formData.boosts_used}
                  onChange={handleChange}
                  placeholder="Energy Drink / Painkiller / Adrenaline..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* =========================================================================
                UNGGAH SCREENSHOT BUKTI PERTANDINGAN (OPSIONAL - VERIFIKASI SCOUT)
                ========================================================================= */}
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-gaming uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4 text-red-600" />
                  <span>BUKTI SCREENSHOT PERTANDINGAN (OPSIONAL):</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  WWCD / Match Result Summary
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Lampirkan tangkapan layar (screenshot) layar akhir pertandingan Anda untuk verifikasi resmi. Manajer tim dapat melihat bukti asli ini langsung pada Kartu Scout Vision.
              </p>

              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
              />

              {screenshotPreview ? (
                <div className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-black flex flex-col sm:flex-row items-center gap-3 p-3">
                  <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                    <img
                      src={screenshotPreview}
                      alt="Preview Bukti Match"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  </div>
                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-500 text-[10px] font-mono font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span>SCREENSHOT TERKOMPRESI &amp; SIAP</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-mono">
                      Resolusi dioptimalkan otomatis untuk kinerja maksimal.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => screenshotInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-gaming font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Ganti Gambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/40 text-xs font-gaming font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => screenshotInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-red-600 dark:hover:border-red-600 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-white/60 dark:bg-zinc-950/40 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 group-hover:bg-red-600/10 transition-colors">
                    {compressingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-gaming font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                      {compressingImage ? "Mengompresi Gambar..." : "Klik untuk Unggah Screenshot Pertandingan"}
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Format PNG, JPG, JPEG (Otomatis dikompres ke resolusi efisien)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pilihan Fleksibel: Tampilkan di Leaderboard vs Simpan Privat di Profil Saja */}
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <label className="block text-xs font-gaming uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center justify-between">
                <span>PENGATURAN TAMPILAN SKOR PERTANDINGAN:</span>
                <span className="text-[10px] text-zinc-500 font-normal font-sans">Dapat diubah kapan saja di riwayat</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPublishChoice("leaderboard")}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    publishChoice === "leaderboard"
                      ? "bg-red-600/10 dark:bg-red-600/20 border-red-600 text-zinc-900 dark:text-white shadow-sm"
                      : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                  }`}
                >
                  <Trophy
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      publishChoice === "leaderboard" ? "text-red-600" : "text-zinc-400"
                    }`}
                  />
                  <div>
                    <div className="text-xs font-gaming font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <span>TAMPILKAN DI LEADERBOARD</span>
                      {publishChoice === "leaderboard" && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-mono font-bold">
                          DIPILIH
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      Tampilkan di radar scouting manajer tim e-sports untuk membuka peluang trial.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishChoice("profile_only")}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    publishChoice === "profile_only"
                      ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-500 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-sm"
                      : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                  }`}
                >
                  <Lock
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      publishChoice === "profile_only" ? "text-amber-500" : "text-zinc-400"
                    }`}
                  />
                  <div>
                    <div className="text-xs font-gaming font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <span>SIMPAN PRIBADI DI PROFIL</span>
                      {publishChoice === "profile_only" && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-700 text-white font-mono font-bold">
                          DIPILIH
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      Hanya tersimpan di profil &amp; riwayat latihan Anda sendiri tanpa tampil di Leaderboard publik.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-gaming font-bold tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>MENGANALISIS DENGAN XGBOOST...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>HITUNG PLAYER SCORE & ANALISIS (REAL-TIME)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Card (Gauge + Radar + Vision Toggle) */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-gaming font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                HASIL EVALUASI SKOR
              </h3>
              {result && (
                <button
                  type="button"
                  onClick={() => setShowVisionModal(true)}
                  className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-gaming font-bold"
                  title="Buka Kartu Vision Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">FULLSCREEN</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Switcher Tab: Vision vs Radar */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setResultTab("vision")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-gaming font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      resultTab === "vision"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>KARTU VISION</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultTab("radar")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-gaming font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      resultTab === "radar"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>RADAR & GAUGE</span>
                  </button>
                </div>

                {resultTab === "vision" ? (
                  /* Compact Preview of Vision Card in Sidebar */
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-center space-y-2 shadow-sm">
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[9px] font-gaming font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                        VISION SCOUT READY
                      </div>
                      <div className="text-4xl font-gaming font-black text-zinc-900 dark:text-white">
                        {Number(result.player_score).toFixed(1)}
                      </div>
                      <div className="text-xs font-gaming font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                        {formData.ign} • {result.score_category} TIER
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("vision-card-showcase");
                            el?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>LIHAT KARTU LENGKAP DI BAWAH &darr;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Gauge & Radar view */
                  <div className="space-y-4">
                    <div className="py-1">
                      <ScoreGauge score={result.player_score} category={result.score_category} size="lg" />
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-[11px] font-gaming font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-center mb-1">
                        Radar Profil Kemampuan
                      </h4>
                      <PlayerRadarChart
                        players={[
                          {
                            ...formData,
                            Player_ID: savedRecord?.Player_ID || "Preview",
                            Player_Score: result.player_score,
                          },
                        ]}
                        height={170}
                      />
                    </div>
                  </div>
                )}

                {/* Status Publikasi & Kontrol Unggah / Tarik Leaderboard */}
                <div
                  className={`p-4 rounded-xl border text-xs space-y-3 ${
                    isMatchPublished
                      ? "bg-emerald-500/10 border-emerald-500/30 text-zinc-700 dark:text-zinc-300"
                      : "bg-amber-500/10 border-amber-500/30 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div>
                    <p
                      className={`flex items-center gap-1.5 font-gaming font-bold uppercase tracking-wider text-xs ${
                        isMatchPublished
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isMatchPublished ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>
                        {isMatchPublished
                          ? "TERBIT DI LEADERBOARD SCOUTING"
                          : "TERSIMPAN PRIBADI DI PROFIL"}
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                      {isMatchPublished
                        ? "Statistik pertandingan ini dapat dipantau langsung oleh manajer tim di Scouting Leaderboard publik."
                        : "Statistik pertandingan ini hanya disimpan di profil & riwayat Anda, tidak dipublikasikan ke Leaderboard."}
                    </p>
                  </div>

                  {/* Tombol Interaktif: Ubah Status Tampilan Seketika */}
                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-gaming font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isMatchPublished
                        ? "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    }`}
                  >
                    {isMatchPublished ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Sembunyikan dari Leaderboard</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tampilkan di Leaderboard</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
                    <Link
                      to="/player/profile"
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-gaming font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 transition-colors"
                    >
                      <User className="w-3 h-3" />
                      <span>Buka Profil &amp; Kartu Vision</span>
                    </Link>
                    {isMatchPublished && (
                      <Link
                        to="/manager/leaderboard"
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Trophy className="w-3 h-3" />
                        <span>Cek di Leaderboard Manager</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-600 dark:text-zinc-400 space-y-3">
                <Crosshair className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-600 animate-pulse" />
                <p className="text-xs">
                  Isi formulir statistik dan klik tombol <strong>Hitung Player Score</strong> untuk melihat hasil evaluasi instan.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>FastAPI: /predict</span>
            <Link to="/player/history" className="text-red-600 hover:underline font-gaming font-bold">
              RIWAYAT SKOR &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SHOWCASE KARTU SCOUT VISION (SEPERTI REFERENSI beIN SPORTS / VISION FOOTBALL)
          ========================================================================= */}
      {result && (
        <div id="vision-card-showcase" className="pt-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[#18181b] dark:bg-[#18181b] light:bg-[#f4f4f5] border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 flex items-center justify-center text-red-600">
                <Sparkles className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-gaming font-black text-white dark:text-white light:text-zinc-900 tracking-wider uppercase flex items-center gap-2">
                  <span>KARTU PROFIL SCOUT VISION</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 font-mono">
                    OFFICIAL E-SPORTS CARD
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">
                  Kartu resmi penilaian objektif atlet PUBG Mobile berbasis XGBoost Regressor (Skor: {Number(result.player_score).toFixed(1)} / 100 - {result.score_category}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVisionModal(true)}
                className="py-2 px-3.5 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-300 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:text-white dark:hover:text-white light:hover:text-zinc-900 text-xs font-gaming font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>POPUP FULLSCREEN</span>
              </button>
            </div>
          </div>

          {/* Kartu Profil Vision Utama */}
          <div className="rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 overflow-hidden shadow-sm">
            <PlayerVisionCard
              playerData={{
                ...formData,
                Player_ID: savedRecord?.Player_ID,
                bio: playerProfile?.bio,
                isCurrentUser: true,
              }}
              scoreResult={result}
              customAvatar={playerAvatar}
            />
          </div>
        </div>
      )}

      {/* Modal Fullscreen Vision Card */}
      {showVisionModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl bg-[#09090b] dark:bg-[#09090b] light:bg-[#ffffff]">
            <button
              onClick={() => setShowVisionModal(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 border border-zinc-700 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <PlayerVisionCard
              playerData={{
                ...formData,
                Player_ID: savedRecord?.Player_ID,
                bio: playerProfile?.bio,
                isCurrentUser: true,
              }}
              scoreResult={result}
              customAvatar={playerAvatar}
            />
          </div>
        </div>
      )}

      {/* Notifikasi Sebaris Simpel Berhasil Input Statistik */}
      <SimpleToastNotification
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Statistik berhasil diinput dan dihitung!"
      />
    </div>
  );
};
