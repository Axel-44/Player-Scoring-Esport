/**
 * frontend/src/components/common/FeaturedPlayerHeroSlider.jsx
 * Komponen "Featured Pro Hero Showcase Slider" dengan estetika ESPN Sports Editorial:
 * - Ultra-minimalis, unboxed layout (tanpa frame poster/glow/border neon tebal).
 * - Kolom Kiri: Cutout atlet berdiri menyatu dengan backdrop diagonal solid abu-abu gelap (#181d28) & aksen merah solid tegas.
 * - Kolom Kanan: Tipografi ESPN editorial putih (#ffffff), muted text (#94a3b8), dan grid statistik minimalis tanpa card tebal.
 * - Tombol & Navigasi: Solid Red (bg-red-600) CTA & kontrol slider minimalis bergaris tipis border-zinc-800.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";
import { PlayerDetailModal } from "../modals/PlayerDetailModal";
import { useAuth } from "../../context/AuthContext";

const FEATURED_SLIDES = [
  {
    id: "luxxy",
    ign: "BTR_Luxxy",
    fullName: "Made Bagus Prabaswara",
    role: "Rusher / Support",
    team: "Bigetron RA",
    image: "/players/luxxy.jpg",
    score: 94.8,
    tier: "Master",
    badgeLabel: "THE CLUTCH GOD",
    headlineRest: "SENDS SQUAD SITTING PRETTY AT THE SUMMIT",
    summary:
      "Legenda dunia PMGC dengan insting eliminasi clutch luar biasa. Penguasaan mekanik senjata M416 dan ketenangan di fase akhir zona circle menjadikannya salah satu rusher paling ditakuti di kancah PUBG Mobile global.",
    tournamentTitle: "PMGC World Champion • 2x PMSL SEA Winner",
    stats: [
      { label: "K/D RATIO", value: "4.85", sub: "Top 1% Global" },
      { label: "AVG DAMAGE", value: "892.4", sub: "Per Match" },
      { label: "HEADSHOT %", value: "36.4%", sub: "High Precision" },
      { label: "ML SCORE", value: "94.8", sub: "Master Tier" },
    ],
    rawPlayerObj: {
      Player_ID: "P_BTR_LUXXY",
      IGN: "BTR_Luxxy",
      Tier: "Conqueror",
      Kills: 8,
      Damage_Dealt: 980.5,
      Survival_Time_Minutes: 28.4,
      Headshot_Percentage: 36.4,
      Assists: 5,
      Revives: 3,
      Distance_Travelled_km: 7.2,
      Longest_Kill_meters: 245.0,
      Heals_Used: 5,
      Boosts_Used: 6,
      Match_Rank: 1,
      Win: 1,
      Favorite_Weapon: "M416",
      Map: "Erangel",
      Player_Score: 94.8,
      Score_Category: "Master",
      role: "Rusher / Support",
    },
  },
  {
    id: "zuxxy",
    ign: "BTR_Zuxxy",
    fullName: "Made Bagas Pramudita",
    role: "Scout / IGL",
    team: "Bigetron RA",
    image: "/players/zuxxy.jpg",
    score: 96.2,
    tier: "Master",
    badgeLabel: "THE MASTER IGL",
    headlineRest: "LEADS INDONESIA TO SUPREME WORLD GLORY",
    summary:
      "Peraih gelar prestisius Esports Mobile Player of the Year. Dikenal dengan makro rotasi kelas dunia, pembacaan zona masa depan, serta kepemimpinan taktis yang membawa tim mendominasi podium dunia berkali-kali.",
    tournamentTitle: "Esports Mobile Player of the Year • PMGC Champion",
    stats: [
      { label: "K/D RATIO", value: "4.40", sub: "Consistent IGL" },
      { label: "AVG DAMAGE", value: "845.0", sub: "Per Match" },
      { label: "ZONE READ", value: "92.8%", sub: "Predictive Macro" },
      { label: "ML SCORE", value: "96.2", sub: "Master Tier" },
    ],
    rawPlayerObj: {
      Player_ID: "P_BTR_ZUXXY",
      IGN: "BTR_Zuxxy",
      Tier: "Conqueror",
      Kills: 7,
      Damage_Dealt: 920.0,
      Survival_Time_Minutes: 29.1,
      Headshot_Percentage: 32.5,
      Assists: 6,
      Revives: 4,
      Distance_Travelled_km: 7.8,
      Longest_Kill_meters: 210.0,
      Heals_Used: 6,
      Boosts_Used: 7,
      Match_Rank: 1,
      Win: 1,
      Favorite_Weapon: "M416",
      Map: "Miramar",
      Player_Score: 96.2,
      Score_Category: "Master",
      role: "Scout / IGL",
    },
  },
  {
    id: "rosemary",
    ign: "AE_Rosemary",
    fullName: "Ryan Rolos",
    role: "Fragger / Entry",
    team: "Alter Ego Ares",
    image: "/players/rosemary.jpg",
    score: 95.5,
    tier: "Master",
    badgeLabel: "PMSL SEA MVP",
    headlineRest: "CRUSHES DEFENSES IN PMSL SOUTHEAST ASIA",
    summary:
      "MVP dua musim berturut-turut di PMSL SEA. Entry fragger berdarah dingin dengan reaksi aim kilat, penguasaan close-combat luar biasa, dan konsistensi menghasilkan first-knock di setiap pertarungan tim.",
    tournamentTitle: "Back-to-back PMSL SEA Champion • 2x Finals MVP",
    stats: [
      { label: "K/D RATIO", value: "5.12", sub: "Apex Eliminator" },
      { label: "AVG DAMAGE", value: "960.8", sub: "Highest in SEA" },
      { label: "HEADSHOT %", value: "41.2%", sub: "Sharp Accuracy" },
      { label: "ML SCORE", value: "95.5", sub: "Master Tier" },
    ],
    rawPlayerObj: {
      Player_ID: "P_AE_ROSEMARY",
      IGN: "AE_Rosemary",
      Tier: "Conqueror",
      Kills: 9,
      Damage_Dealt: 1040.0,
      Survival_Time_Minutes: 27.5,
      Headshot_Percentage: 41.2,
      Assists: 4,
      Revives: 2,
      Distance_Travelled_km: 6.9,
      Longest_Kill_meters: 382.0,
      Heals_Used: 4,
      Boosts_Used: 6,
      Match_Rank: 1,
      Win: 1,
      Favorite_Weapon: "UMP45",
      Map: "Sanhok",
      Player_Score: 95.5,
      Score_Category: "Master",
      role: "Fragger / Entry",
    },
  },
];

export const FeaturedPlayerHeroSlider = () => {
  const { role } = useAuth();
  const isManager = String(role || "").toLowerCase().trim() === "manager";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("right");
  const [selectedModalPlayer, setSelectedModalPlayer] = useState(null);

  const SLIDE_DURATION = 5000; // 5 Detik per slide (rotasi otomatis mulus)
  const currentSlide = FEATURED_SLIDES[currentIndex];

  const handleNext = useCallback(() => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);
  }, []);

  const handleSelectSlide = (index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  };

  // Rotasi otomatis (Autoplay murni tanpa tombol play/pause manual)
  useEffect(() => {
    if (selectedModalPlayer) return;
    const timer = setInterval(() => {
      handleNext();
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [currentIndex, selectedModalPlayer, handleNext]);

  return (
    <>
      <section
        className="relative w-full py-4 lg:py-6 mb-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-transparent select-none"
        aria-label="Featured Pro Hero Showcase"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ============================================================== */}
          {/* KOLOM KIRI (5 / 12): CUTOUT ATLET DENGAN DIAGONAL SOLID       */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] lg:min-h-[460px] overflow-hidden">
            {/* Backdrop asimetris diagonal solid netral murni (#e4e4e7 in light, #141416 in dark tanpa aksen biru) */}
            <div
              className="absolute inset-y-2 left-2 right-8 bg-zinc-200 dark:bg-[#141416] pointer-events-none transition-colors border-r border-zinc-300 dark:border-zinc-800/60"
              style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }}
            />

            {/* Aksen garis merah solid tegas di tepi kiri */}
            <div className="absolute top-2 bottom-2 left-2 w-1.5 bg-red-600 pointer-events-none" />

            {/* Kilatan laser pembelah diagonal (Style 3) */}
            <div
              key={`laser-${currentSlide.id}`}
              className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-red-600/60 to-transparent pointer-events-none z-20 animate-diagonal-laser"
            />

            {/* Cutout foto atlet dengan animasi Diagonal Shutter / Geometric Slice (Style 3) */}
            <div
              key={`hero-img-${currentSlide.id}`}
              className="relative z-10 w-full h-full flex items-center justify-center animate-diagonal-shutter"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.fullName}
                className="max-h-[360px] lg:max-h-[440px] w-auto object-contain filter contrast-105"
                style={{
                  maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                }}
                loading="eager"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* KOLOM KANAN (7 / 12): KONTEN EDITORIAL ALA ESPN               */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">

            <div
              key={`hero-info-${currentSlide.id}`}
              className="space-y-4 animate-geometric-text"
            >

              {/* Eyebrow Tag: Solid Red Badge & Tournament Title */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-red-600 text-white text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                  {currentSlide.badgeLabel}
                </span>

                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {currentSlide.tournamentTitle}
                </span>
              </div>

              {/* Bold Athletic Headline: IGN & Editorial Statement */}
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-gaming tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                  {currentSlide.ign}
                </h2>

                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-tight mt-1.5">
                  {currentSlide.headlineRest}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-2">
                  <span className="text-zinc-900 dark:text-white font-semibold">{currentSlide.fullName}</span>
                  <span>•</span>
                  <span>{currentSlide.team}</span>
                  <span>•</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{currentSlide.role}</span>
                </div>
              </div>

              {/* Clean Summary Description */}
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl pt-1">
                {currentSlide.summary}
              </p>

              {/* Statistik Grid Minimalis Netral */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-4 border-y border-zinc-200 dark:border-zinc-800">
                {currentSlide.stats.map((st, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {st.label}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-white mt-0.5">
                      {st.value}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {st.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tombol Aksi: Solid Red & Dark Neutral */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Tombol Utama: Solid Red */}
                <button
                  onClick={() => setSelectedModalPlayer(currentSlide.rawPlayerObj)}
                  className="px-6 py-2.5 rounded bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-gaming font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Lihat Profil Lengkap
                </button>

                {/* Tombol Sekunder: Neutral Dark */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("roster-grid");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = "/manager/leaderboard";
                    }
                  }}
                  className="px-5 py-2.5 rounded bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-gaming font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>Scout Semua Roster</span>
                </button>

                {/* Komparasi Link (Khusus Manager) */}
                {isManager && (
                  <Link
                    to="/manager/compare"
                    className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Bandingkan</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                  </Link>
                )}
              </div>
            </div>

            {/* ========================================================== */}
            {/* BOTTOM NAV: THUMBNAILS & KONTROL OTOMATIS BORDER-ZINC-800  */}
            {/* ========================================================== */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800/60">

              {/* Player Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {FEATURED_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => handleSelectSlide(idx)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded border transition-colors text-left cursor-pointer ${isActive
                          ? "bg-zinc-100 dark:bg-zinc-800/90 border-red-600 text-zinc-900 dark:text-white"
                          : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-300"
                        }`}
                    >
                      <div className="w-7 h-7 rounded-sm overflow-hidden bg-black shrink-0 border border-zinc-300 dark:border-zinc-800">
                        <img
                          src={slide.image}
                          alt={slide.ign}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <span className="text-xs font-gaming font-bold tracking-wide">
                        {slide.ign}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slider Controls di Pojok Kanan Bawah (Otomatis tanpa tombol Play/Pause manual) */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">

                {/* Indikator Otomatis Garis Progress Tipis */}
                <div className="flex items-center gap-2">
                  {/* <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500">AUTO</span> */}
                  <div className="w-12 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      key={currentIndex}
                      className="h-full bg-red-600 rounded-full animate-cinematic-progress"
                      style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                    />
                  </div>
                </div>

                {/* Counter Numeric: 01 / 03 */}
                <div className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                  <span className="text-zinc-900 dark:text-white">0{currentIndex + 1}</span>
                  <span className="mx-1 text-zinc-400 dark:text-zinc-600">/</span>
                  <span>0{FEATURED_SLIDES.length}</span>
                </div>

                {/* Arrow Prev / Next Minimalis */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Detail Profil Lengkap Atlet */}
      {selectedModalPlayer && (
        <PlayerDetailModal
          player={selectedModalPlayer}
          onClose={() => setSelectedModalPlayer(null)}
        />
      )}
    </>
  );
};
