/**
 * frontend/src/components/modals/TutorialModal.jsx
 * Modal Panduan & Tutorial Penggunaan PulseScout Interaktif dengan Layout Split:
 * - Kiri: Penjelasan Langkah, Judul, Deskripsi Rinci, dan Tombol Pintas Halaman.
 * - Kanan: Foto Screenshot dengan Frame Mockup Jernih dan Fitur Lightbox Zoom.
 * - Animasi Halus (Smooth Slide Transition) di setiap pergantian langkah.
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
  Maximize2,
  Check,
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
        "Buka menu profil, lalu klik tombol edit profil. Disana kamu harus mengisi data Lengkap muali dari Nickname (IGN), ID Game PUBG Mobile, Role spesialisasi squad, dan kontak resmi (WhatsApp/Instagram) Anda agar profil Anda terverifikasi dan dapat dihubungi oleh manajer tim e-sports.",
      actionLabel: "Buka Halaman Profil",
      actionUrl: "/player/profile",
      highlights: [
        "Masukkan IGN dan ID Game PUBG Mobile asli",
        "Pilih Role spesialisasi (Rusher, Sniper, Support, dsb)",
        "Tulis kontak aktif untuk dihubungi scout tim",
      ],
    },
    {
      stepNumber: 2,
      badge: "LANGKAH 2 DARI 6",
      title: "Input Statistik Pertandingan & Bukti Match",
      image: "/tutorial/player-step2-input.png",
      description:
        "Buka menu Kalkulasi Skor pada bagian sidebar. Disana ada beberapa parameter / kolom yang perlu di isi untuk mendapatkan skor yang dimana parameter ini bisa kamu lihat di hasil pertandinganmu ya... mulai dari (Kills, Damage, Survival Time, Match Rank, dll) dan lampirkan tangkapan layar (screenshot) hasil game PUBG Mobile sebagai bukti kuat kamu bermain dengan statistik yang kamu dapat itu!.",
      actionLabel: "Buka Kalkulasi Skor",
      actionUrl: "/player/input",
      highlights: [
        "Isi semua kolom dari eliminasi, damage dealt, dan menit survival",
        "Unggah screenshot hasil pertandingan resmi",
        "Sistem memvalidasi batas rasional metrik per map",
      ],
    },
    {
      stepNumber: 3,
      badge: "LANGKAH 3 DARI 6",
      title: "Analisis Hasil Skor AI XGBoost & Riwayat Performa",
      image: "/tutorial/player-step3-hasil skor.png",
      description:
        "Setelah kamu selesai mengisi semua data di kolom kalkulasi skor, Model XGBoost akan langsung mengkalkulasi skor performa kamu, kamu juga bisa melihat perkembangan performa yang kamu dapat dari beberapa pertandingan yang sudah  inputkan di kalkuasi itu dapat dilihat dari grafik pada halaman riwayat perkembangan skor, disitu anda juga bisa mengatur statistik mana yang mau diunggah ke leaderboard atau di privasi hanya profil anda saja",
      actionLabel: "Lihat Riwayat Skor",
      actionUrl: "/player/history",
      highlights: [
        "Skor dihitung otomatis secara objektif oleh model XGBoost",
        "Player dapat melihat grafik tren kenaikan performa per match",
        "Player dapat mengatur statistik mana yang mau diunggah ke leaderboard atau di privasi hanya profil anda saja",
      ],
    },
    {
      stepNumber: 4,
      badge: "LANGKAH 4 DARI 6",
      title: "Kartu Scout Vision Resmi & 5 Pilar Atribut",
      image: "/tutorial/player-step4-kartu vision.png",
      description:
        "Buka menu Profil Saya untuk melihat Kartu Scout Vision Anda. Kartu ini merangkum 5 pilar atribut tempur: Combat Power, Aim Accuracy, Survival Zone, Tactical IQ, dan Squad Utility yang siap diekspor menjadi dokumen laporan PDF yang bisa player download di akhir.",
      actionLabel: "Cek Kartu Vision Saya",
      actionUrl: "/player/profile",
      highlights: [
        "Visualisasi atribut tempur e-sports",
        "Dilengkapi foto profil atlet dan ringkasan match terbaik",
        "Dapat dicetak menjadi dokumen laporan scouting resmi PDF",
      ],
    },
    {
      stepNumber: 5,
      badge: "LANGKAH 5 DARI 6",
      title: "Tampil di Leaderboard & Spotlight Talenta",
      image: "/tutorial/player-step5-leaderboard.png",
      description:
        "Publikasikan skor terbaik Anda ke Leaderboard! Nama, tier, foto, dan skor Anda akan resmi masuk ke jajaran atlet lainnya serta berpeluang masuk ke panel Kandidat Spotlight yang dipantau setiap hari oleh manajer tim e-sports, anda juga dapat melihat profil performa pemain lain sebagai pembanding untuk bisa mengukur kemampuan anda dalam bersaing di setiap map nya!.",
      actionLabel: "Buka Leaderboard ",
      actionUrl: "/manager/leaderboard",
      highlights: [
        "Peringkat teratas berdasarkan skor ",
        "Jadikan sebagai pembanding untuk mengukur kemampuan anda dalam bersaing dengan player lain",
        "Peluang dilirik langsung oleh manajer dan pelatih e-sports",
      ],
    },
    {
      stepNumber: 6,
      badge: "LANGKAH 6 DARI 6",
      title: "Lamar Open Trial & Simpan Wishlist Tim Impian",
      image: "/tutorial/player-step6-whislist tim.png",
      description:
        "Kunjungi menu Bursa & Roster Tim untuk mencari tim e-sports yang sedang membuka lowongan Open Trial. Cek evaluasi kelayakan skor Anda dan klik tombol WhatsApp untuk menghubungi manager tim e-sports terkait.",
      actionLabel: "Jelajahi Bursa Tim",
      actionUrl: "/teams",
      highlights: [
        "Daftar tim profesional dan manajer yang membuka rekrutmen",
        "Evaluasi kelayakan skor otomatis (Siap Trial / Butuh Skor)",
        "Kirim lamaran trial resmi langsung ke nomor WhatsApp manajer",
      ],
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
        "Buka menu Profil Tim Saya. Masukkan nama tim, logo organisasi, visi, misi, kuota roster aktif, role yang sedang dicari, dan tentukan berapa minimal skor performa yang harus dicapai oleh calon atlet yang ingin mendaftar sesi uji tanding (scrim trial).",
      actionLabel: "Kelola Profil Tim",
      actionUrl: "/manager/team-profile",
      highlights: [
        "Tentukan identitas dan logo resmi tim Anda",
        "Atur kuota pemain roster aktif dan slot terbuka",
        "Pasang filter batas minimal skor rekrutmen otomatis",
      ],
    },
    {
      stepNumber: 2,
      badge: "LANGKAH 2 DARI 5",
      title: "Scouting Talenta & Tandai Pemain untuk Dikomparasi",
      image: "/tutorial/manager-step2-kehalaman leaderboard untuk meng bandingkan player lalu buka halaman komparasi.png",
      description:
        "Buka menu Leaderboard. Disini anda sebagai manager bisa melihat daftar para pemain yang sudah terdaftar di platform ini, anda juga bisa memfilter pemain berdasarkan role dan skor yang anda inginkan, jika sudah menemukan pemain yang cocok maka lanjutkan dengan menekan tombol komparasi untuk membandingkan pemain dengan atlet lainnya.",
      actionLabel: "Buka Scouting Leaderboard",
      actionUrl: "/manager/leaderboard",
      highlights: [
        "Filter cepat talenta berdasarkan role taktis dan tier",
        "Pilih hingga 3 atlet sekaligus untuk fitur komparasi",
        "Pantau profil atlet secara instan lewat panel Spotlight",
      ],
    },
    {
      stepNumber: 3,
      badge: "LANGKAH 3 DARI 5",
      title: "Buka Halaman Komparasi Head-to-Head",
      image: "/tutorial/manager-step3-melihat hasil banding di halaman komparasi.png",
      description:
        "Selanjutnya jika anda merasa tertarik ke beberapa player pilihan anda , klik tombol komparasi pada kartu visionplayer yang ingin anda bandingkan statistik nya,setelah sudah dipilih player nya, buka halaman komparasi dimana . Sistem akan menjejerkan 2 hingga 3 kandidat terpilih secara berdampingan lengkap dengan skor , tier klasifikasi, dan ringkasan rank pertandingan mereka.",
      actionLabel: "Buka Komparasi Pemain",
      actionUrl: "/manager/compare",
      highlights: [
        "Tinjauan komparasi visual 2-3 kandidat atlet",
        "Gauge perbandingan skor Machine Learning dan tier",
        "Deteksi kecocokan map dan gaya bermain squad",
      ],
    },
    {
      stepNumber: 4,
      badge: "LANGKAH 4 DARI 5",
      title: "Analisis Matriks Evaluasi & Radar Multi-Axis",
      image: "/tutorial/manager-step3-head to head dari player .png",
      description:
        "Player yang sudah anda pilih tadi sekarang tampil di halaman komparasi, halaman ini akan membandingkan statistik player yang anda pilih berdasarkan statistik yang mereka miliki, mulai dari Combat Power, Aim Accuracy, Survival Zone, Tactical IQ, dan Squad Utility, dihalaman inilah anda bisa melihat keunggulan dan kekurangan dari masing masing player, dan sebagai pengingat perbandingan dilakukan harus dengan map yang sama agar perbandingan lebih akurat.",
      actionLabel: "Cek Matriks Head-to-Head",
      actionUrl: "/manager/compare",
      highlights: [
        "Tampilan grafik perbandingan player",
        "Matriks angka statistik perbandingan langsung",
        "Perbandingan untuk mencari player yang di incar",
      ],
    },
    {
      stepNumber: 5,
      badge: "LANGKAH 5 DARI 5",
      title: "Simpan ke Daftar Incaran & Kirim Undangan Trial",
      image: "/tutorial/manager-step4-melakukan pemilihan player.png",
      description:
        "Terakhir jika kamu sudah merasa tertarik dengan player pilihanmu, klik tombol incar player yang berada di halaman komparasi untuk menyimpan player ke dalam daftar incaranmu kirim dia pesan bahwa anda tertarik dengan performanya untuk bisa bergabung dengan tim!.",
      actionLabel: "Buka Daftar Incaran",
      actionUrl: "/manager/shortlists",
      highlights: [
        "Simpan kandidat ke daftar incaran roster tim",
        "Kirim undangan uji tanding resmi ke notifikasi atlet",
        "Ekspor daftar incaran ke format CSV untuk staf pelatih",
      ],
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
        <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 animate-scaleUp">

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
                  Pelajari alur fitur sistem langkah demi langkah secara visual dan interaktif.
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
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-gaming font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "player"
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
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-gaming font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "manager"
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
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${currentStepIndex === idx
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
          {/* 3. SPLIT BODY: KIRI (PENJELASAN) | KANAN (FOTO DENGAN ANIMASI)  */}
          {/* ============================================================== */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div
              key={`${activeTab}-${currentStepIndex}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >

              {/* ------------------------------------------------------------ */}
              {/* KOLOM KIRI (5 / 12): PENJELASAN & AKSI CEPAT                */}
              {/* ------------------------------------------------------------ */}
              <div className="lg:col-span-5 space-y-4 animate-tutorial-content flex flex-col justify-between">

                {/* Badge Langkah & Kategori */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-gaming font-bold uppercase tracking-wider shadow-sm">
                      {currentStep.badge}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {activeTab === "player" ? "Alur Atlet PUBG Mobile" : "Alur Manajer E-Sports"}
                    </span>
                  </div>

                  {/* Judul Langkah */}
                  <h3 className="text-xl sm:text-2xl font-gaming font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-tight pt-1">
                    {currentStep.title}
                  </h3>
                </div>

                {/* Deskripsi Narasi */}
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                  {currentStep.description}
                </p>

                {/* Checklist Poin Penting Langkah Ini */}
                {currentStep.highlights && currentStep.highlights.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-gaming font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Aktivitas Kunci:
                    </span>
                    <div className="space-y-1.5">
                      {currentStep.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                          <div className="w-4 h-4 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 font-bold" />
                          </div>
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tombol Jalan Pintas Navigasi Langsung */}
                <div className="pt-2">
                  <Link
                    to={currentStep.actionUrl}
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all hover:translate-y-[-1px]"
                  >
                    <span>{currentStep.actionLabel}</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

              </div>

              {/* ------------------------------------------------------------ */}
              {/* KOLOM KANAN (7 / 12): GAMBAR SCREENSHOT DENGAN FRAME MOCKUP */}
              {/* ------------------------------------------------------------ */}
              <div className="lg:col-span-7 animate-tutorial-image">
                <div className="relative group rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-800 bg-zinc-950 shadow-xl">

                  {/* Mockup Top Window Bar Minimalis */}
                  <div className="px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">
                      {currentStep.actionUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLightbox(true)}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      title="Perbesar layar penuh"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Perbesar</span>
                    </button>
                  </div>

                  {/* Frame Tampilan Gambar */}
                  <div
                    onClick={() => setShowLightbox(true)}
                    className="w-full h-[320px] sm:h-[400px] lg:h-[420px] flex items-center justify-center overflow-hidden bg-black/70 p-2 sm:p-3 cursor-zoom-in"
                  >
                    <img
                      src={currentStep.image}
                      alt={currentStep.title}
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  </div>

                  {/* Petunjuk Klik Zoom */}
                  <div className="px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{currentStep.title}</span>
                    <span className="text-[10px] text-zinc-500">Klik foto untuk perbesar</span>
                  </div>

                </div>
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
              className={`px-4 py-2 rounded-xl text-xs font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${isFirstStep
                ? "opacity-40 cursor-not-allowed text-zinc-400"
                : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Indikator Titik Langkah Interaktif */}
            <div className="flex items-center gap-1.5">
              {currentSteps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${currentStepIndex === idx
                    ? "w-6 bg-red-600"
                    : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                    }`}
                  title={`Langkah ${idx + 1}`}
                />
              ))}
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
