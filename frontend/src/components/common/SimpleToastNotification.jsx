/**
 * frontend/src/components/common/SimpleToastNotification.jsx
 * Notifikasi sebaris simpel (Top Toast Banner) yang ringkas dan tidak menutupi layar.
 * Digunakan untuk:
 * - "Data tim berhasil ditambahkan"
 * - "Data tim sudah diperbarui"
 * - "Statistik berhasil diinput dan dihitung"
 * - "Profil atlet berhasil diperbarui"
 * Mendukung warna teks putih di dark mode dan hitam di light mode.
 */

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export const SimpleToastNotification = ({
  isOpen,
  message,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen || !message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-lg px-4 animate-bounce-short">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white dark:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 shadow-2xl backdrop-blur-md">
        {/* Icon Checklist Hijau Bersih */}
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>

        {/* Teks Sebaris Simpel & Jelas */}
        <span className="text-sm font-semibold tracking-wide text-black dark:text-white whitespace-nowrap">
          {message}
        </span>

        {/* Tombol Tutup X Kecil */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1 cursor-pointer"
          title="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SimpleToastNotification;

