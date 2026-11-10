/**
 * frontend/src/components/common/FeedbackSuccessModal.jsx
 * Pop-up Modal Notifikasi Sukses yang Interaktif & Fresh:
 * Digunakan saat:
 * 1. Player berhasil menginput statistik & memperoleh skor XGBoost ML.
 * 2. Player berhasil memperbarui profil atlet / biodata / kontak.
 * 3. Manager berhasil mendaftarkan / memperbarui profil tim di Direktori Publik.
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  X,
  ArrowRight,
  Trophy,
  Shield,
  Crosshair,
  User,
  Zap,
} from "lucide-react";

export const FeedbackSuccessModal = ({
  isOpen,
  onClose,
  type = "score", // "score" | "team_created" | "team_updated" | "profile_updated"
  title,
  subtitle,
  badgeText,
  score,
  scoreCategory,
  details = [],
  actionText,
  actionLink,
  onAction,
}) => {
  if (!isOpen) return null;

  // Konfigurasi icon & aksen sesuai type
  const getTypeConfig = () => {
    switch (type) {
      case "score":
        return {
          icon: Trophy,
          iconBg: "bg-red-600/10 text-red-600 border-red-600/20",
          defaultBadge: "XGBoost ML Evaluated",
          defaultTitle: "STATISTIK PERTANDINGAN BERHASIL!",
          defaultSubtitle: "Model ML telah memproses 12 parameter performa dan memperbarui Kartu Scout Vision Anda.",
          defaultActionText: "Lihat Kartu Vision Profil",
          defaultActionLink: "/player/profile",
        };
      case "team_created":
        return {
          icon: Shield,
          iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          defaultBadge: "Tim E-Sports Terdaftar",
          defaultTitle: "DATA TIM BERHASIL DITAMBAHKAN!",
          defaultSubtitle: "Profil organisasi dan slot rekrutmen tim Anda kini resmi tampil di Direktori Publik.",
          defaultActionText: "Lihat di Direktori Tim",
          defaultActionLink: "/teams",
        };
      case "team_updated":
        return {
          icon: Shield,
          iconBg: "bg-red-600/10 text-red-600 border-red-600/20",
          defaultBadge: "Tim E-Sports Diperbarui",
          defaultTitle: "DATA TIM BERHASIL DIPERBARUI!",
          defaultSubtitle: "Seluruh perubahan visi misi, kapasitas roster, logo, dan kriteria role telah diperbarui.",
          defaultActionText: "Lihat di Direktori Tim",
          defaultActionLink: "/teams",
        };
      case "profile_updated":
        return {
          icon: User,
          iconBg: "bg-red-600/10 text-red-600 border-red-600/20",
          defaultBadge: "Profil Atlet Disimpan",
          defaultTitle: "PROFIL ATLET BERHASIL DIPERBARUI!",
          defaultSubtitle: "Data biodata, ID PUBG Mobile, status rekrutmen, dan kontak media sosial Anda telah tersimpan.",
          defaultActionText: "Lihat Dashboard",
          defaultActionLink: "/player/dashboard",
        };
      default:
        return {
          icon: CheckCircle,
          iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          defaultBadge: "Operasi Sukses",
          defaultTitle: "BERHASIL DISIMPAN!",
          defaultSubtitle: "Perubahan data Anda telah berhasil diterapkan.",
          defaultActionText: "Selesai",
          defaultActionLink: null,
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  const displayTitle = title || config.defaultTitle;
  const displaySubtitle = subtitle || config.defaultSubtitle;
  const displayBadge = badgeText || config.defaultBadge;
  const displayActionText = actionText || config.defaultActionText;
  const displayActionLink = actionLink || config.defaultActionLink;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 p-6 sm:p-7 space-y-5 animate-scaleUp">
        
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Badge */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${config.iconBg} shadow-sm relative group`}>
            <IconComponent className="w-8 h-8 animate-bounce-subtle" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
              ✓
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {displayBadge}
            </span>
            <h3 className="text-lg font-gaming font-black tracking-wide text-zinc-900 dark:text-white uppercase">
              {displayTitle}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed max-w-xs mx-auto">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Khusus Type Score: Tampilkan Score Highlight Card */}
        {score !== undefined && score !== null && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">
              PLAYER SCORE HASIL INFERENSI
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-3xl font-gaming font-black text-red-600">
                {Number(score).toFixed(1)}
              </span>
              <span className="text-xs font-mono text-zinc-400">/ 100 PTS</span>
            </div>
            {scoreCategory && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-600/10 text-red-600 border border-red-600/20">
                TIER {scoreCategory}
              </span>
            )}
          </div>
        )}

        {/* Key Details List (Jika Ada) */}
        {details.length > 0 && (
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-mono">
            {details.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>{item.label}:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-gaming font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>

          {displayActionLink ? (
            <Link
              to={displayActionLink}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <span>{displayActionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={() => {
                onAction();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{displayActionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
};

