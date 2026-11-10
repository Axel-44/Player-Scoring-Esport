/**
 * frontend/src/components/modals/TutorialModal.jsx
 * Modal Panduan & Tutorial Penggunaan PulseScout Interaktif Berbasis Visual Foto.
 * Menyediakan 2 jalur alur lengkap:
 * 1. Jalur Atlet (Player) - 6 Langkah
 * 2. Jalur Manajer (Manager) - 5 Langkah
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Maximize2,
} from "lucide-react";

export const TutorialModal = ({ isOpen, onClose, initialRole = "player" }) => {
  const [activeTab, setActiveTab] = useState(
    initialRole === "manager" ? "manager" : "player"
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Perbarui tab default berdasarkan role saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole === "manager" ? "manager" : "player");
      setCurrentStepIndex(0);
    }
  }, [isOpen, initialRole]);

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showLightbox) {
          setShowLightbox(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showLightbox, currentStepIndex, activeTab]);

  if (!isOpen) return null;

  // --- DATA TUTORIAL JALUR ATLET (PLAYER) ---
  const playerSteps = [
    {
      stepNumber: 1,
      badge: "LANGKAH 1 DARI 6",
      title: "Lengkapi Identitas & Profil Atlet",
      image: "/tutorial/player-step1-profile.png",
      description:
        "Buka menu **Profil Saya**, lalu klik tombol **Edit Profil**. Lengkapi Nickname (IGN), ID PUBG Mobile, Role spesialisasi squad, dan kontak resmi (WhatsApp/Instagram) Anda agar profil Anda terverifikasi dan dapat dihubungi oleh manajer tim e-sports.",
      actionLabel: "Buka Halaman Profil",
      actionUrl: "/player/profile",
      tip: "Pastikan ID PUBG Mobile dan Role diisi sesuai keahlian utama Anda di dalam tim.",
    },
    {
      stepNumber: 2,
      badge: "LANGKAH 2 DARI 6",
      title: "Input Statistik Pertandingan & Bukti Match",
      image: "/tutorial/player-step2-input.png",
      description:
        "Buka menu **Kalkulasi Skor**. Masukkan parameter performa pasca pertandingan Anda (Kills, Damage, Survival Time, Match Rank, dll) dan unggah screenshot hasil game PUBG Mobile sebagai bukti verifikasi autentik.",
      actionLabel: "Buka Kalkulasi Skor",
      actionUrl: "/player/input",
      tip: "Screenshot bukti pertandingan akan otomatis terverifikasi dan menaikkan kredibilitas Anda di mata scout.",
    },
    {
      stepNumber: 3,
      badge: "LANGKAH 3 DARI 6",
      title: "Analisis Hasil Skor AI XGBoost & Tren Performa",
      image: "/tutorial/player-step3-hasil skor.png",
      description:
        "Model Machine Learning XGBoost akan langsung mengalkulasi skor performa Anda (skala 0–100) serta mengklasifikasikan tier keahlian Anda (Master, Ace, Crown, dll). Pantau riwayat seluruh pertandingan dan grafik tren perkembangan skor Anda.",
      actionLabel: "Lihat Riwayat Skor",
      actionUrl: "/player/history",
      tip: "Semakin konsisten Anda mencetak damage tinggi dan survival lama, semakin tinggi skor AI Anda.",
    },
    {
      stepNumber: 4,
      badge: "LANGKAH 4 DARI 6",
      title: "Kartu Scout Vision Resmi & 5 Pilar Atribut",
      image: "/tutorial/player-step4-kartu vision.png",
      description:
        "Buka menu **Profil Saya** untuk melihat **Kartu Scout Vision Resmi** Anda. Kartu ini merangkum 5 pilar atribut tempur: Combat Power, Aim Accuracy, Survival Zone, Tactical IQ, dan Squad Utility yang siap diekspor menjadi dokumen laporan PDF profesional.",
      actionLabel: "Cek Kartu Vision Saya",
      actionUrl: "/player/profile",
      tip: "Anda dapat mencetak laporan PDF kartu vision untuk portofolio scouting resmi saat melamar turnamen.",
    },
    {
      stepNumber: 5,
      badge: "LANGKAH 5 DARI 6",
      title: "Tampil di Leaderboard Nasional & Spotlight Talenta",
      image: "/tutorial/player-step5-leaderboard.png",
      description:
        "Publikasikan skor terbaik Anda ke Leaderboard nasional! Nama, tier, foto, dan skor Anda akan resmi masuk ke jajaran atlet top nasional serta berpeluang masuk ke panel **Kandidat Spotlight** yang dipantau setiap hari oleh manajer tim e-sports.",
      actionLabel: "Buka Leaderboard Nasional",
      actionUrl: "/manager/leaderboard",
      tip: "Gunakan tombol publikasi di menu Riwayat Skor untuk menentukan match terbaik mana yang ingin Anda pamerkan.",
    },
    {
      stepNumber: 6,
      badge: "LANGKAH 6 DARI 6",
      title: "Lamar Open Trial & Simpan Wishlist Tim Impian",
      image: "/tutorial/player-step6-whislist tim.png",
      description:
        "Kunjungi menu **Bursa & Roster Tim** untuk mencari tim e-sports yang sedang membuka lowongan *Open Trial*. Cek evaluasi kelayakan skor Anda dan klik tombol WhatsApp untuk langsung mengirim lamaran trial ke manajer tim.",
      actionLabel: "Jelajahi Bursa Tim",
      actionUrl: "/teams",
      tip: "Simpan tim impian Anda ke daftar Wishlist (ikon hati) agar Anda dapat memantau kuota slot roster mereka.",
    },
  ];

  // --- DATA TUTORIAL JALUR MANAJER (MANAGER) ---
  const managerSteps = [
    {
      stepNumber: 1,
      badge: "LANGKAH 1 DARI 5",
      title: "Atur Profil Tim, Kuota Roster & Syarat Trial",
      image: "/tutorial/manager-step1-melengkapi profilt tim.png",
      description:
        "Buka menu **Profil Tim Saya**. Masukkan nama tim, logo organisasi, visi, misi, kuota roster aktif, role yang sedang dicari, dan tentukan **Batas Minimal Skor AI** untuk calon atlet yang ingin mendaftar sesi uji tanding (scrim trial).",
      actionLabel: "Kelola Profil Tim",
      actionUrl: "/manager/team-profile",
      tip: "Menentukan kriteria skor minimal akan menyaring pendaftar secara otomatis sehingga tim Anda hanya menerima talenta berkualitas.",
    },
    {
      stepNumber: 2,
      badge: "LANGKAH 2 DARI 5",
      title: "Scouting Talenta & Tandai Pemain untuk Dikomparasi",
      image: "/tutorial/manager-step2-kehalaman leaderboard untuk meng bandingkan player lalu buka halaman komparasi.png",
      description:
        "Buka menu **Leaderboard**. Manfaatkan tab filter role (Rusher, Sniper, Zone Controller, Support) dan slider skor. Klik tombol **KOMPARASI** pada hingga 3 kandidat atlet yang ingin Anda bandingkan statistiknya secara langsung.",
      actionLabel: "Buka Scouting Leaderboard",
      actionUrl: "/manager/leaderboard",
      tip: "Panel Kandidat Spotlight di sisi kanan memperlihatkan ringkasan senjata favorit, damage, dan kurva metrik performa pemain.",
    },
    {
      stepNumber: 3,
      badge: "LANGKAH 3 DARI 5",
      title: "Buka Halaman Komparasi Head-to-Head",
      image: "/tutorial/manager-step3-melihat hasil banding di halaman komparasi.png",
      description:
        "Buka menu **Komparasi Pemain**. Sistem akan menjejerkan 2 hingga 3 kandidat terpilih secara berdampingan lengkap dengan skor Machine Learning, tier klasifikasi, dan ringkasan rank pertandingan mereka.",
      actionLabel: "Buka Komparasi Pemain",
      actionUrl: "/manager/compare",
      tip: "Sistem memberikan peringatan otomatis jika membandingkan atlet dari map berbeda (misal Sanhok tempo cepat vs Erangel makro rotasi).",
    },
    {
      stepNumber: 4,
      badge: "LANGKAH 4 DARI 5",
      title: "Analisis Matriks Evaluasi & Radar Multi-Axis",
      image: "/tutorial/manager-step3-head to head dari player .png",
      description:
        "Telusuri grafik **Multi-Axis Radar Comparison** dan tabel matriks evaluasi head-to-head untuk membandingkan metrik penting seperti K/D ratio, akurasi headshot, jarak eliminasi terjauh, dan efisiensi utilitas tim.",
      actionLabel: "Cek Matriks Head-to-Head",
      actionUrl: "/manager/compare",
      tip: "Pemain dengan nilai tertinggi di setiap metrik akan otomatis ditandai dengan lencana pemenang (badge hijau).",
    },
    {
      stepNumber: 5,
      badge: "LANGKAH 5 DARI 5",
      title: "Simpan ke Daftar Incaran & Kirim Undangan Trial",
      image: "/tutorial/manager-step4-melakukan pemilihan player.png",
      description:
        "Setelah menemukan talenta terbaik, klik tombol **+ INCAR PEMAIN**. Tulis pesan personal atau undangan uji tanding (scrim trial) yang akan otomatis terkirim sebagai notifikasi resmi ke akun atlet serta membuka kontak langsung via WhatsApp.",
      actionLabel: "Buka Daftar Incaran",
      actionUrl: "/manager/shortlists",
      tip: "Daftar atlet incaran dapat Anda ekspor ke format file CSV untuk bahan rapat bersama staf pelatih tim.",
    },
  ];

  const currentSteps = activeTab === "player" ? playerSteps : managerSteps;
  const currentStep = currentSteps[currentStepIndex] || currentSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === currentSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentStepIndex(0);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 animate-scaleUp">
          
          {/* ============================================================== */}
          {/* 1. MODAL HEADER                                                */}
          {/* ============================================================== */}
          <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-gaming font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    PANDUAN PENGGUNAAN PULSESCOUT
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-red-600/15 text-red-600 text-[10px] font-gaming font-bold uppercase border border-red-600/30">
                    TUTORIAL
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
                  Ikuti langkah bergambar di bawah ini untuk memahami alur fitur sistem.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tutup Panduan (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ============================================================== */}
          {/* 2. TAB SWITCHER (ATLET / PLAYER vs MANAJER TIM)                 */}
          {/* ============================================================== */}
          <div className="px-5 pt-3 pb-2 bg-white dark:bg-[#18181b] border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabChange("player")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-gaming font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "player"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Panduan Atlet (Player)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  6 Step
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("manager")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-gaming font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "manager"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Panduan Manajer (Manager)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  5 Step
                </span>
              </button>
            </div>

            {/* Quick Step Indicator Pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {currentSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                    currentStepIndex === idx
                      ? "bg-red-600 text-white shadow-sm scale-105"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  title={`Lompat ke Langkah ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. STEP CONTENT (GAMBAR & PENJELASAN)                           */}
          {/* ============================================================== */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Step Header Title & Badge */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 text-red-600 dark:text-red-400 text-[10px] font-gaming font-bold uppercase tracking-wider border border-red-600/30">
                  {currentStep.badge}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {activeTab === "player" ? "Alur Atlet PUBG Mobile" : "Alur Manajer E-Sports"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                {currentStep.title}
              </h3>
            </div>

            {/* Foto Screenshot Langkah dengan Lightbox Preview */}
            <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-md">
              <div className="w-full max-h-[360px] sm:max-h-[420px] flex items-center justify-center overflow-hidden bg-black/60 p-2 sm:p-3">
                <img
                  src={currentStep.image}
                  alt={currentStep.title}
                  className="w-full max-h-[340px] sm:max-h-[400px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>

              {/* Overlay Tombol Perbesar Gambar */}
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-red-600 text-white text-xs font-gaming font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer opacity-90 hover:opacity-100"
                title="Klik untuk memperbesar tampilan gambar"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Perbesar Foto</span>
              </button>
            </div>

            {/* Deskripsi & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-8 space-y-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  {currentStep.description}
                </p>

                {currentStep.tip && (
                  <div className="p-3.5 rounded-xl bg-red-600/5 dark:bg-red-600/10 border border-red-600/20 flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                    <Sparkles className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Tips Sukses:</strong> {currentStep.tip}
                    </p>
                  </div>
                )}
              </div>

              {/* Shortcut Tombol Navigasi Langsung ke Fitur */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-gaming uppercase tracking-wider text-zinc-500 block">
                  Aksi Cepat Halaman
                </span>
                <Link
                  to={currentStep.actionUrl}
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>{currentStep.actionLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-zinc-400 font-mono block text-center">
                  Buka fitur ini sekarang
                </span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* 4. MODAL FOOTER (KONTROL SLIDE NEXT / PREV)                    */}
          {/* ============================================================== */}
          <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            {/* Tombol Sebelumnya */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`px-4 py-2 rounded-xl text-xs font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isFirstStep
                  ? "opacity-40 cursor-not-allowed text-zinc-400"
                  : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Indikator Halaman di Mobile */}
            <div className="text-xs font-mono font-bold text-zinc-500">
              <span className="text-red-600 font-gaming">{currentStepIndex + 1}</span> / {currentSteps.length}
            </div>

            {/* Tombol Selanjutnya atau Selesai */}
            {isLastStep ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai & Buka Web</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. LIGHTBOX PERBESAR GAMBAR FULLSCREEN                         */}
      {/* ============================================================== */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={currentStep.image}
              alt={currentStep.title}
              className="w-full max-h-[82vh] object-contain rounded-2xl border border-zinc-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="mt-3 text-center text-xs font-gaming font-semibold text-zinc-300 uppercase tracking-wide">
              {currentStep.badge}: {currentStep.title}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
