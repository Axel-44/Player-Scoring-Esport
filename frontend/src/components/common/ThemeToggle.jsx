/**
 * frontend/src/components/common/ThemeToggle.jsx
 * Tombol Switch Theme (Matahari / Bulan) dengan animasi Micro-Interaction Icon Morphing:
 * - Ikon Matahari & Bulan berputar (rotate 180 deg) dan membesar/mengecil (scale) dengan halus saat berpindah mode.
 * - Membawa koordinat event klik untuk animasi Circular Reveal View Transitions.
 */

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggle = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle"
      className={`relative w-9 h-9 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 flex items-center justify-center transition-all overflow-hidden cursor-pointer ${className}`}
      title={isDark ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
      aria-label="Toggle theme mode"
    >
      {/* Sun Icon: Terlihat saat Light Mode, berputar 180° dan mengecil saat Dark Mode */}
      <Sun
        className={`w-4 h-4 transition-all duration-500 ease-out transform ${
          isDark
            ? "-rotate-180 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 text-zinc-900"
        }`}
      />

      {/* Moon Icon: Terlihat saat Dark Mode, berputar 180° dan membesar saat Dark Mode */}
      <Moon
        className={`w-4 h-4 absolute transition-all duration-500 ease-out transform ${
          isDark
            ? "rotate-0 scale-100 opacity-100 text-zinc-100"
            : "rotate-180 scale-0 opacity-0 text-zinc-400"
        }`}
      />
    </button>
  );
};
