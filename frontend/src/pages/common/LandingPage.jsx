/**
 * frontend/src/pages/common/LandingPage.jsx
 * Halaman Landing Page Portal E-Sports terinspirasi oleh Pinterest / ESPN sports portal layout:
 * 1. Featured Player Hero Showcase Slider (Asymmetrical Split di bagian atas)
 * 2. Match Schedule & Scouting Matches Grid (Kategori kartu jadwal turnamen ala ESPN)
 * 3. Latest Scouting Intel & News (Kartu berita atlet dengan badge HOT / Trending)
 * 4. ML Transparency & Scouting Roster Quick Access (Call-to-Action)
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FeaturedPlayerHeroSlider } from "../../components/common/FeaturedPlayerHeroSlider";
import {
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Cpu,
  Flame,
  Star,
  ChevronRight,
} from "lucide-react";

export const LandingPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("HOT");

  // Data Jadwal Pertandingan Turnamen (Match Schedule ala Pinterest ESPN)
  const matchSchedules = [
    {
      id: 1,
      tournament: "PMSL SEA Spring Grand Finals",
      stage: "Match Day 3 • Grand Final Round",
      teamA: { name: "Bigetron RA", tag: "BTR", score: "84 Pts", logo: "🔥" },
      teamB: { name: "Alter Ego Ares", tag: "AE", score: "79 Pts", logo: "⚔️" },
      map: "Erangel (Battle Royale)",
      date: "Minggu, 19:30 WIB",
      status: "LIVE TODAY",
      statusColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      featuredScout: "Luxxy vs Rosemary",
    },
    {
      id: 2,
      tournament: "PUBG Mobile Global Championship",
      stage: "Group Green • Elimination Match",
      teamA: { name: "Persija EVOS", tag: "PJEV", score: "68 Pts", logo: "🦅" },
      teamB: { name: "Nova Esports", tag: "NV", score: "72 Pts", logo: "⚡" },
      map: "Miramar (Battle Royale)",
      date: "Senin, 20:00 WIB",
      status: "UPCOMING",
      statusColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      featuredScout: "Zuxxy IGL Masterclass",
    },
    {
      id: 3,
      tournament: "PMPL Indonesia Fall Qualifier",
      stage: "Semi Finals • Round 4",
      teamA: { name: "RRQ Ryu", tag: "RRQ", score: "55 Pts", logo: "👑" },
      teamB: { name: "BOOM Esports", tag: "BOOM", score: "58 Pts", logo: "🐺" },
      map: "Sanhok (Close Combat)",
      date: "Rabu, 16:00 WIB",
      status: "PREVIEW",
      statusColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
      featuredScout: "Rookie Scout Hunt",
    },
  ];

  // Data Berita & Intel Scouting (Latest News ala Pinterest)
  const scoutingNews = [
    {
      id: 1,
      category: "HOT SCOUT",
      title: "Model XGBoost Buktikan Efektivitas K/D 4.85 Luxxy di Lingkaran Akhir PMGC",
      desc: "Analisis data kuantitatif membuktikan akurasi tembakan dan positioning Made Bagus Prabaswara berkontribusi 94.8 skor ML.",
      author: "E-Sports Analytics Team",
      time: "2 jam lalu",
      image: "/featured/luxxy.jpg",
      tier: "Master Tier",
    },
    {
      id: 2,
      category: "TRENDING",
      title: "Zuxxy Dinobatkan Sebagai IGL Paling Berpengaruh dalam Makro Rotasi Zona",
      desc: "Metrik predictive zone reading Zuxxy mencapai 92.8%, menjadikannya tolok ukur tertinggi scouting kapten tim di Asia Tenggara.",
      author: "Coach Scouting Radar",
      time: "5 jam lalu",
      image: "/featured/zuxxy.jpg",
      tier: "Master Tier",
    },
    {
      id: 3,
      category: "ROSTER INTEL",
      title: "Rosemary Raih Rekor Damage 960/Match di PMSL SEA: Target Utama Transfer",
      desc: "Entry fragger Alter Ego Ares memimpin statistik first-knock kompetitif dengan skor evaluasi AI mencapai 95.5.",
      author: "Scout Intel Daily",
      time: "1 hari lalu",
      image: "/featured/rosemary.jpg",
      tier: "Master Tier",
    },
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-12">
      {/* ============================================================== */}
      {/* 1. HERO SECTION: FEATURED PLAYER HERO SHOWCASE SLIDER          */}
      {/* ============================================================== */}
      <div>
        <FeaturedPlayerHeroSlider />
      </div>

      {/* ============================================================== */}
      {/* 2. MATCH SCHEDULE & SCOUTING ARENA (Inspirasi Pinterest ESPN)   */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-gaming font-bold text-rose-500 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>SCOUTING ARENA • MATCH SCHEDULE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-gaming font-black text-white tracking-wide">
              JADWAL TURNAMEN & <span className="text-rose-500">HEAD-TO-HEAD</span> SCOUT
            </h2>
          </div>

          <Link
            to="/manager/compare"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-gaming font-bold text-white bg-gray-900 border border-gray-800 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all uppercase self-start sm:self-auto"
          >
            <span>Buka Komparasi Roster</span>
            <ArrowRight className="w-4 h-4 text-rose-400" />
          </Link>
        </div>

        {/* Grid Match Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matchSchedules.map((m) => (
            <div
              key={m.id}
              className="glass-panel rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-gray-400 truncate max-w-[180px]">{m.tournament}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-gaming font-bold border ${m.statusColor}`}>
                    {m.status}
                  </span>
                </div>

                {/* Team Logos & Vs Row */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-950/70 border border-gray-800/80 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-lg bg-gray-900 border border-gray-800">{m.teamA.logo}</span>
                    <div>
                      <span className="font-gaming font-bold text-white text-sm block leading-tight">{m.teamA.tag}</span>
                      <span className="text-[10px] font-mono text-gray-400">{m.teamA.score}</span>
                    </div>
                  </div>

                  <span className="text-xs font-gaming font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                    VS
                  </span>

                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <span className="font-gaming font-bold text-white text-sm block leading-tight">{m.teamB.tag}</span>
                      <span className="text-[10px] font-mono text-gray-400">{m.teamB.score}</span>
                    </div>
                    <span className="text-2xl p-1.5 rounded-lg bg-gray-900 border border-gray-800">{m.teamB.logo}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-gray-300 font-medium">{m.stage}</p>
                  <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{m.date} • {m.map}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-esports-amber flex items-center gap-1">
                  <Star className="w-3 h-3 text-esports-amber fill-esports-amber" />
                  {m.featuredScout}
                </span>

                <Link
                  to="/manager/leaderboard"
                  className="text-xs font-gaming font-bold text-white hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <span>Scout</span>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LATEST NEWS & SCOUTING INTEL (Pinterest Card Grid)          */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-gaming font-bold text-esports-cyan uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>SCOUTING HIGHLIGHTS & INTEL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-gaming font-black text-white tracking-wide">
              BERITA & ANALITIK <span className="text-esports-cyan">TALENTA TERKINI</span>
            </h2>
          </div>

          {/* Filter Pills ala Pinterest Tab */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800">
            {["HOT", "TRENDING", "ROSTER"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-gaming font-bold uppercase transition-all ${
                  selectedFilter === tab
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 3 News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scoutingNews.map((news) => (
            <article
              key={news.id}
              className="glass-panel rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-gaming font-bold tracking-wider uppercase bg-rose-600/90 text-white shadow-md">
                    {news.category}
                  </span>

                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-gaming font-bold uppercase bg-black/80 text-emerald-400 border border-emerald-500/30">
                    {news.tier}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>{news.author}</span>
                    <span>{news.time}</span>
                  </div>

                  <h3 className="font-gaming font-bold text-base sm:text-lg text-white group-hover:text-esports-cyan transition-colors leading-snug">
                    {news.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {news.desc}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to="/manager/leaderboard"
                  className="w-full py-2 px-3 rounded-xl text-xs font-gaming font-bold tracking-wider text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center gap-2 transition-all uppercase"
                >
                  <span>Analisis Profil Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5 text-esports-cyan" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. BOTTOM BANNER: MACHINE LEARNING ACCURACY TRANSPARENCY       */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-gray-900 to-black shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-gaming font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <Cpu className="w-4 h-4" />
              <span>POWERED BY XGBOOST REGRESSOR</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-gaming font-black text-white tracking-wide">
              SISTEM TALENT SCOUTING OBYEKTIF BERBASIS <span className="text-rose-500">MACHINE LEARNING</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono">
              Evaluasi performa 2.500 pemain PUBG Mobile secara akurat menggunakan model regresi machine learning dengan tingkat akurasi R² = 83.45%, RMSE = 6.45, dan MAE = 5.07 selaras dengan standar ilmiah Bab 4 Skripsi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/about-model"
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-gaming font-bold tracking-wider text-white bg-gray-900 hover:bg-gray-800 border border-white/20 transition-all flex items-center gap-2 uppercase hover:border-white/50"
            >
              <Cpu className="w-4 h-4 text-esports-amber" />
              <span>Metodologi Model</span>
            </Link>

            <Link
              to="/manager/leaderboard"
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-gaming font-bold tracking-wider text-black bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 shadow-lg shadow-rose-900/40 transition-all flex items-center gap-2 uppercase font-extrabold"
            >
              <Trophy className="w-4 h-4" />
              <span>Mulai Scouting Sekarang</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
