/**
 * frontend/src/components/modals/ShortlistInviteModal.jsx
 * Modal dialog profesional saat Manajer menambahkan pemain ke Shortlist.
 * Memungkinkan Manajer menuliskan pesan personal / undangan uji tanding (scrim trial)
 * yang akan langsung terkirim sebagai Notifikasi Resmi di sisi Player.
 */

import React, { useState } from "react";
import {
  BookmarkCheck,
  Send,
  X,
  User,
  Shield,
  Crosshair,
  Info,
  Trophy,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { getPlayerAvatar } from "../../utils/avatarUtils";

export const ShortlistInviteModal = ({
  isOpen,
  onClose,
  player,
  managerTeam,
  onConfirm,
}) => {
  if (!isOpen || !player) return null;

  const teamName = managerTeam?.name || "Apex Predator Esports";
  const teamTag = managerTeam?.tag || "APX";
  const playerIGN = player.IGN || player.Player_ID || "Atlet";
  const playerScore = Number(player.Player_Score || 80).toFixed(1);
  const playerMap = player.Map || "Erangel";
  const playerRole = player.Role || "Rusher / Fragger";

  // Template pesan kustom yang dapat diedit bebas oleh manajer
  const defaultMessage = `Halo ${playerIGN}! Kami dari tim ${teamName} (${teamTag}) terkesan dengan konsistensi performa Anda di map ${playerMap} dengan Skor ML ${playerScore}. Kami ingin mengundang Anda ke sesi uji tanding (scrim / trial) turnamen mendatang untuk slot roster kami. Silakan cek detail lowongan tim kami dan hubungi kami jika berminat.`;

  const [message, setMessage] = useState(defaultMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm(player, message.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 animate-scaleUp">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/30 text-red-600 flex items-center justify-center font-bold shrink-0">
              <BookmarkCheck className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-gaming font-black uppercase tracking-wider">
                SIMPAN KE DAFTAR INCARAN
              </h3>
              <p className="text-[11px] font-mono text-zinc-500">
                Pesan ini akan dikirimkan langsung sebagai Notifikasi Resmi ke akun atlet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Ringkasan Profil Kandidat */}
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 shrink-0">
                <img
                  src={getPlayerAvatar(player)}
                  alt={playerIGN}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-gaming font-black text-sm text-zinc-900 dark:text-white uppercase leading-tight">
                    {playerIGN}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase">
                    {player.Tier || "Crown"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>{playerRole}</span>
                  <span>•</span>
                  <span>Map: {playerMap}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">SKOR ML</span>
              <span className="text-lg font-gaming font-black text-red-600">
                {playerScore}
              </span>
            </div>
          </div>

          {/* Form Textarea Pesan Kustom Manajer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-gaming font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                <span>Pesan Undangan Pribadi Manajer</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                Dapat diedit bebas
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan ajakan, jadwal scrim, atau kriteria trial..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>
              Pesan ini akan memicu badge notifikasi merah di akun <strong>{playerIGN}</strong>, menghubungkannya langsung ke kontak resmi WhatsApp tim Anda.
            </span>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-gaming font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-gaming font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Undangan & Incar Pemain</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

