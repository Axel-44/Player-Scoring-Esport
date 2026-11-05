/**
 * frontend/src/pages/common/EsportsHubPage.jsx
 * Halaman "ESPORTS HUB & BERITA PUBG MOBILE" terinspirasi oleh visual editorial USA TODAY Sports:
 * 1. Trending Bar & Breaking News Strip (4 berita singkat teratas)
 * 2. Hero Headline Slider (65% Berita Utama dengan foto cinematic, 35% Widget Jadwal & Skor Pertandingan)
 * 3. Don't Miss (Berita Pilihan): 1 Card Utama + 4 Grid Berita + Sidebar "Top Stories" (Peringkat 1 s/d 5)
 * 4. Popular Videos & Highlight Match (Video player card dengan play button & durasi)
 * 5. Model Klasemen Lengkap Tim Turnamen PMSL SEA (Standings Table dipertahankan sesuai permintaan)
 * 6. Portal Sumber Berita resmi diarahkan ke https://www.esports.id/pubg-m
 * Catatan: 100% bebas dari warna merah dan bebas dari ikon generate AI.
 */

import React, { useState, useEffect } from "react";
import esportsData from "../../data/esportsNews.json";
import {
  ExternalLink,
  Clock,
  TrendingUp,
  Play,
  Calendar,
  Globe,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Compass,
  ArrowUpRight,
  X,
} from "lucide-react";

// Helper untuk mengekstrak Video ID dari URL YouTube (format watch, live, youtu.be, embed)
function getYoutubeId(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([^?&/]+)/i);
  return match ? match[1] : null;
}

export const EsportsHubPage = () => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeSideTab, setActiveSideTab] = useState("scores"); // "scores" | "standings"
  const [activeVideo, setActiveVideo] = useState(null); // video object currently playing in cinema modal

  // Keyboard shortcut: Escape key closes the video cinema modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };
    if (activeVideo) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo]);

  const {
    trendingTopics = [],
    heroArticles = [],
    breakingStories = [],
    dontMiss = { featured: {}, items: [] },
    topStories = [],
    popularVideos = { featured: {}, items: [] },
    teamStandings = [],
    upcomingMatches = [],
  } = esportsData;

  const currentHero = heroArticles[heroIndex] || heroArticles[0];

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroArticles.length);
  };

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* =========================================================================
          0. TRENDING BAR (USA TODAY TICKER STYLE)
          ========================================================================= */}
      <div className="rounded-2xl p-2.5 sm:px-4 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="font-gaming font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            TRENDING:
          </span>
          <div className="flex items-center gap-2 whitespace-nowrap text-zinc-700 dark:text-zinc-300 font-medium text-xs">
            {trendingTopics.map((topic, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                  {topic}
                </span>
                {i < trendingTopics.length - 1 && (
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <a
          href="https://www.esports.id/pubg-m"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-gaming font-bold text-xs shrink-0 self-end sm:self-auto"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>PORTAL ESPORTS.ID</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* =========================================================================
          1. BREAKING STORIES ROW (4 HORIZONTAL CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {breakingStories.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl p-3 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 shrink-0 border border-zinc-200 dark:border-zinc-800">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-gaming font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                {item.category}
              </span>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {item.title}
              </h4>
              <span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                <Clock className="w-3 h-3" />
                {item.time}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* =========================================================================
          2. MAIN HERO SECTION (USA TODAY 2-COLUMN LAYOUT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (8 of 12 cols): Large Featured Headline Banner */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[460px] flex flex-col justify-end p-6 sm:p-10 shadow-lg group bg-zinc-950">
          {/* Background Cinematic Photo with Gradient Overlay */}
          <img
            src={currentHero.image}
            alt={currentHero.title}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />

          {/* Content Over Background */}
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-[11px] font-gaming font-bold uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                {currentHero.category}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
                {currentHero.subCategory}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-gaming font-black text-white uppercase leading-tight tracking-tight drop-shadow-md">
              {currentHero.title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm font-normal">
              {currentHero.summary}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={currentHero.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-600 text-zinc-950 hover:text-white font-gaming font-bold text-xs uppercase tracking-wider transition-all shadow-md group/btn"
              >
                <span>BACA SELENGKAPNYA</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>

              <span className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {currentHero.date} • {currentHero.readTime}
              </span>
            </div>
          </div>

          {/* Hero Slider Dots & Controls */}
          {heroArticles.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button
                onClick={prevHero}
                aria-label="Previous Headline"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {heroArticles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === heroIndex ? "w-6 bg-blue-500" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextHero}
                aria-label="Next Headline"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column (4 of 12 cols): Top Scores / Live Matches / Quick Standings */}
        <div className="lg:col-span-4 rounded-3xl p-5 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
          <div>
            {/* Header with Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveSideTab("scores")}
                  className={`px-3 py-1 rounded-lg text-xs font-gaming font-bold uppercase transition-all ${
                    activeSideTab === "scores"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Jadwal Match
                </button>
                <button
                  onClick={() => setActiveSideTab("standings")}
                  className={`px-3 py-1 rounded-lg text-xs font-gaming font-bold uppercase transition-all ${
                    activeSideTab === "standings"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Top 5 Tim
                </button>
              </div>

              <a
                href="https://www.esports.id/pubg-m"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-gaming font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Side Content: Scores / Matches */}
            {activeSideTab === "scores" ? (
              <div className="space-y-3">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">
                        {m.date} • {m.map}
                      </span>
                      <div className="flex items-center gap-2 font-gaming font-bold text-zinc-900 dark:text-white text-sm">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-xs">
                          {m.tagA}
                        </span>
                        <span className="text-zinc-400 font-mono text-xs">VS</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-xs">
                          {m.tagB}
                        </span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-300 font-normal truncate">
                          {m.teamA} vs {m.teamB}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-gaming font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 uppercase">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {teamStandings.slice(0, 5).map((t) => (
                  <div
                    key={t.rank}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-gaming font-bold text-xs shrink-0 ${
                          t.rank === 1
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {t.rank}
                      </span>
                      <div className="min-w-0">
                        <span className="font-gaming font-bold text-zinc-900 dark:text-white truncate block">
                          {t.team}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {t.matches}M • {t.wwcd} WWCD
                        </span>
                      </div>
                    </div>
                    <span className="font-gaming font-black text-sm text-blue-600 dark:text-blue-400 shrink-0">
                      {t.points} PTS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Footer info */}
          <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span>Sirkuit PMSL SEA Fall</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-gaming flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LIVE UPDATE
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. SECTION: DON'T MISS (BERITA PILIHAN) + TOP STORIES
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
              Berita Pilihan (Don't Miss)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Liputan Eksklusif Esports.id
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block (8 of 12 cols): 1 Big Card + 4 Grid Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Big Vertical Card (md: 6 cols) */}
              {dontMiss.featured && (
                <a
                  href={dontMiss.featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:col-span-6 group rounded-3xl overflow-hidden bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative w-full h-52 overflow-hidden bg-zinc-950">
                    <img
                      src={dontMiss.featured.image}
                      alt={dontMiss.featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-gaming font-bold bg-blue-600 text-white uppercase">
                        {dontMiss.featured.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-gaming font-bold text-zinc-950 dark:text-white uppercase leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {dontMiss.featured.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                        {dontMiss.featured.summary}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {dontMiss.featured.time}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-gaming font-bold text-xs flex items-center gap-1">
                        <span>Baca</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </a>
              )}

              {/* 4 Stacked Grid Cards (md: 6 cols, 2x2) */}
              <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {dontMiss.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl p-3 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-full h-24 rounded-xl overflow-hidden bg-zinc-950 mb-2">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-gaming font-bold bg-blue-600 text-white uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {item.title}
                      </h5>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {item.time}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block (4 of 12 cols): Top Stories (Numbered 1 to 5) */}
          <div className="lg:col-span-4 rounded-3xl p-5 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3">
                <h4 className="font-gaming font-bold text-sm uppercase text-zinc-900 dark:text-white tracking-wide">
                  Top Stories
                </h4>
                <a
                  href="https://www.esports.id/pubg-m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-gaming font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {topStories.map((item) => (
                  <a
                    key={item.rank}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 flex items-center gap-3 group first:pt-0 last:pb-0"
                  >
                    <span className="font-gaming font-black text-2xl text-blue-600 dark:text-blue-400 w-6 shrink-0 text-center">
                      {item.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {item.title}
                      </h5>
                      <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                        {item.time}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <a
                href="https://www.esports.id/pubg-m"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-gaming font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase"
              >
                <span>BACA SEMUA TOPIK DI ESPORTS.ID</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. POPULAR VIDEOS & MATCH HIGHLIGHTS
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" />
            <h3 className="text-xl font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
              Popular Videos &amp; Highlight Match
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Kanal Video Esports ID
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Large Video Player Card (7 cols) */}
          {popularVideos.featured && (
            <button
              type="button"
              onClick={() => setActiveVideo(popularVideos.featured)}
              className="lg:col-span-7 group rounded-3xl overflow-hidden relative min-h-[320px] sm:min-h-[380px] bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-end p-6 shadow-md text-left cursor-pointer transition-all hover:border-blue-500/50"
            >
              <img
                src={popularVideos.featured.image}
                alt={popularVideos.featured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

              {/* Centered Large Play Button with Circular Accent */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-gaming font-bold bg-blue-600 text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {popularVideos.featured.badge}
                </span>
              </div>

              {/* Bottom Video Title & Metadata */}
              <div className="relative z-10 max-w-xl space-y-1">
                <h4 className="text-lg sm:text-xl font-gaming font-black text-white uppercase leading-snug drop-shadow-md group-hover:text-blue-400 transition-colors">
                  {popularVideos.featured.title}
                </h4>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-white border border-white/20">
                    ⏱ {popularVideos.featured.duration}
                  </span>
                  <span>{popularVideos.featured.views}</span>
                  <span>•</span>
                  <span>{popularVideos.featured.channel}</span>
                </div>
              </div>
            </button>
          )}

          {/* Right 3 Video Items List (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl p-5 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {popularVideos.items.map((vid) => (
                <button
                  type="button"
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className="py-3.5 flex items-center gap-3.5 group first:pt-0 last:pb-0 text-left w-full cursor-pointer transition-colors"
                >
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={vid.image}
                      alt={vid.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 brightness-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                      {vid.duration}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {vid.title}
                    </h5>
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                      {vid.time} • Klik untuk Putar
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Video Dokumentasi &amp; Replay</span>
              <a
                href="https://www.youtube.com/@PUBGMOBILEEsports"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-gaming font-bold flex items-center gap-1 hover:underline"
              >
                <span>KANAL YOUTUBE</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MODEL KLASEMEN LENGKAP TIM TURNAMEN (STANDINGS TABLE - DIPERTAHANKAN)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
              Klasemen Sementara Tim (PMSL SEA Grand Finals)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Live Official Standings
          </span>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-100 dark:bg-zinc-900 text-[11px] font-gaming uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Nama Tim E-Sports</th>
                  <th className="py-3.5 px-4 text-center">Negara</th>
                  <th className="py-3.5 px-4 text-center">Match</th>
                  <th className="py-3.5 px-4 text-center">WWCD (Win)</th>
                  <th className="py-3.5 px-4 text-center">Elim Kills</th>
                  <th className="py-3.5 px-4 text-center text-blue-600 dark:text-blue-400">Total Poin</th>
                  <th className="py-3.5 px-4 text-center">Status Kualifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {teamStandings.map((t) => (
                  <tr
                    key={t.rank}
                    className="hover:bg-zinc-100/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold">
                      {t.rank === 1 ? (
                        <span className="w-6 h-6 rounded-md bg-blue-600 text-white inline-flex items-center justify-center font-gaming text-xs shadow-xs">
                          1
                        </span>
                      ) : t.rank <= 3 ? (
                        <span className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white inline-flex items-center justify-center font-gaming text-xs">
                          {t.rank}
                        </span>
                      ) : (
                        t.rank
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-bold text-sm text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white">
                          {t.tag}
                        </span>
                        <span>{t.team}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">{t.country}</td>
                    <td className="py-3.5 px-4 text-center">{t.matches}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {t.wwcd}
                    </td>
                    <td className="py-3.5 px-4 text-center">{t.kills}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {t.points} PTS
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {t.rank <= 3 ? (
                        <span className="text-[10px] font-gaming font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {t.status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400">In Contention</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FOOTER PORTAL LINK: ESPORTS.ID PUBG-M
          ========================================================================= */}
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="max-w-2xl text-center md:text-left">
          <span className="text-[11px] font-gaming font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
            PORTAL BERITA RESMI E-SPORTS INDONESIA
          </span>
          <h4 className="text-xl sm:text-2xl font-gaming font-bold text-zinc-950 dark:text-white uppercase">
            Ingin Membaca Liputan Lebih Lengkap? Kunjungi Esports.id
          </h4>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Ikuti informasi terbaru seputar bursa transfer pemain, analisis meta patch PUBG Mobile,
            tips gameplay atlet profesional, dan wawancara eksklusif langsung di laman resmi Esports.id.
          </p>
        </div>

        <a
          href="https://www.esports.id/pubg-m"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <span>BUKA PORTAL ESPORTS.ID</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* =========================================================================
          7. YOUTUBE CINEMA MODAL (PLAY IN-PAGE WITHOUT LEAVING WEBSITE)
          ========================================================================= */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title & Close Button */}
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between text-white bg-zinc-900/80">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                </div>
                <h4 className="font-gaming font-bold text-xs sm:text-sm truncate uppercase text-zinc-100">
                  {activeVideo.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Responsive YouTube Iframe Player */}
            <div className="relative aspect-video w-full bg-black">
              {getYoutubeId(activeVideo.youtubeUrl || activeVideo.url) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(
                    activeVideo.youtubeUrl || activeVideo.url
                  )}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs font-mono">
                  Video tidak dapat dimuat
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-900/60">
              <span>{activeVideo.channel || "Kanal Resmi YouTube PUBG Mobile"}</span>
              <div className="flex items-center gap-3">
                <a
                  href={activeVideo.youtubeUrl || activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-gaming font-semibold text-xs"
                >
                  <span>Tonton di YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="hover:text-white font-gaming text-xs uppercase cursor-pointer"
                >
                  Tutup (Esc)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};