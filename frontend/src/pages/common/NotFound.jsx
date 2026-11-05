/**
 * frontend/src/pages/common/NotFound.jsx
 * Halaman 404 Not Found bertema gaming.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Crosshair, ArrowLeft } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-red-600/15 text-red-600 flex items-center justify-center mb-6 border border-red-600/30 shadow-sm">
        <Crosshair className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-gaming font-bold text-white dark:text-white light:text-zinc-900 tracking-widest mb-2">
        404
      </h1>
      <h2 className="text-xl font-gaming font-bold text-red-600 tracking-wider uppercase mb-3">
        ZONA PERTANDINGAN TIDAK DITEMUKAN
      </h2>
      <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500 max-w-md mb-8">
        Halaman yang Anda tuju berada di luar safe zone. Silakan kembali ke markas utama.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/player/profile"
          className="px-5 py-2.5 rounded-xl font-gaming font-bold tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 uppercase text-xs"
        >
          <Crosshair className="w-4 h-4" />
          <span>PROFIL PEMAIN & KARTU VISION</span>
        </Link>
        <Link
          to="/player/input"
          className="px-5 py-2.5 rounded-xl font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-300 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 transition-all flex items-center gap-2 uppercase text-xs"
        >
          <Crosshair className="w-4 h-4 text-red-600" />
          <span>INPUT STATISTIK SKOR</span>
        </Link>
        <Link
          to="/manager/leaderboard"
          className="px-5 py-2.5 rounded-xl font-gaming font-bold tracking-wider text-zinc-200 dark:text-zinc-200 light:text-zinc-800 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-300 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 transition-all flex items-center gap-2 uppercase text-xs"
        >
          <span>LEADERBOARD SCOUTING</span>
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl font-gaming font-bold tracking-wider text-zinc-300 dark:text-zinc-300 light:text-zinc-700 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-all flex items-center gap-2 uppercase text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BERANDA</span>
        </Link>
      </div>
    </div>
  );
};
