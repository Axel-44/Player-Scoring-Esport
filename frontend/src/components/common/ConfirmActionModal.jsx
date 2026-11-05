/**
 * frontend/src/components/common/ConfirmActionModal.jsx
 * Modal dialog konfirmasi modern dan elegan untuk aksi penting (seperti menyimpan perubahan profil/tim).
 * Mendukung Dark Mode & Light Mode serta tema visual resmi PulseScout.
 */

import React from "react";
import { AlertCircle, HelpCircle, X, Check, ArrowRight } from "lucide-react";

export const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Perubahan Data",
  message = "Apakah Anda yakin ingin melakukan perubahan ini?",
  confirmText = "Ya, Simpan Perubahan",
  cancelText = "Batal",
  isLoading = false,
  icon: CustomIcon,
  variant = "danger_crimson", // "danger_crimson" | "primary"
}) => {
  if (!isOpen) return null;

  const IconComponent = CustomIcon || HelpCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 space-y-5 animate-scaleUp">
        
        {/* Tombol Tutup X */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          title="Tutup Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Dialog */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-600/10 dark:bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-600 shrink-0 shadow-sm">
            <IconComponent className="w-6 h-6 text-red-600" />
          </div>

          <div className="space-y-1 pr-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-bold">
              KONFIRMASI TINDAKAN
            </span>
            <h3 className="text-base font-gaming font-black uppercase tracking-wider text-zinc-900 dark:text-white leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Isi Pesan Pertanyaan */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
            {message}
          </p>
        </div>

        {/* Tombol Aksi (Batal / Tidak vs Ya) */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-gaming font-bold tracking-wider uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-xs font-gaming font-black tracking-wider uppercase text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block animate-spin mr-1">⌛</span>
            ) : (
              <Check className="w-4 h-4 text-white" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

