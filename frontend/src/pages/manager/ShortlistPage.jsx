/**
 * frontend/src/pages/manager/ShortlistPage.jsx
 * Halaman Manajemen Shortlist Kandidat E-Sports & Ekspor ke File CSV (FR-08, BB-09).
 * Desain Monokrom Clean Light/Dark Mode dengan aksen Merah Crimson.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import {
  BookmarkCheck,
  Download,
  Trash2,
  Edit3,
  Check,
  Trophy,
  Search,
  Printer,
  FileText,
  Users,
} from "lucide-react";
import { getPlayerAvatar } from "../../utils/avatarUtils";
import { ScoutingReportModal } from "../../components/modals/ScoutingReportModal";

export const ShortlistPage = () => {
  const {
    shortlist,
    removeFromShortlist,
    updateShortlistNotes,
    exportShortlistToCSV,
    players,
    addToShortlist,
  } = usePlayerStore();
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportPlayer, setReportPlayer] = useState(null);

  const handleStartEdit = (item) => {
    setEditingId(item.Player_ID);
    setNoteText(item.notes || "");
  };

  const handleSaveNotes = (playerId) => {
    updateShortlistNotes(playerId, noteText);
    setEditingId(null);
  };

  const filteredShortlist = shortlist.filter(
    (item) =>
      !searchTerm ||
      (item.IGN && item.IGN.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.Player_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.Tier && item.Tier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            RECRUITMENT SCOUTING (FR-08, BB-09)
          </div>
          <h1 className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
            DAFTAR INCARAN PEMAIN
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Kelola daftar kandidat atlet prioritas hasil scouting, tambahkan evaluasi kualitatif, dan ekspor ke format CSV.
          </p>
        </div>

        {shortlist.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportShortlistToCSV()}
              className="px-5 py-2.5 rounded-xl text-xs font-gaming font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm flex items-center gap-2 uppercase tracking-wider transition-all"
            >
              <Download className="w-4 h-4" />
              <span>EKSPOR INCARAN (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {shortlist.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-600/30">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white mb-2">
            DAFTAR INCARAN MASIH KOSONG
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
            Anda belum menambahkan pemain ke dalam daftar incaran. Buka Leaderboard untuk menandai kandidat yang menjanjikan, atau muat 3 pemain contoh untuk langsung menguji fitur Cetak Laporan PDF.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/manager/leaderboard"
              className="px-5 py-2.5 rounded-xl text-xs font-gaming font-bold text-white bg-red-600 hover:bg-red-700 inline-flex items-center gap-2 uppercase tracking-wider shadow-sm"
            >
              <Trophy className="w-4 h-4" />
              <span>BUKA LEADERBOARD</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                if (players && players.length > 0) {
                  players.slice(0, 3).forEach((p) => {
                    addToShortlist({
                      ...p,
                      notes: "Kandidat prioritas - Hasil scouting performa tinggi",
                    });
                  });
                }
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-gaming font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
              title="Tambahkan 3 pemain contoh ke shortlist agar tabel dan tombol PDF langsung muncul"
            >
              <Users className="w-4 h-4 text-red-600" />
              <span>+ MUAT 3 KANDIDAT CONTOH</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search bar inside shortlist */}
          <div className="glass-panel rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kandidat di shortlist..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Total: <strong className="text-zinc-900 dark:text-white">{shortlist.length}</strong> kandidat
            </div>
          </div>

          {/* Shortlist Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] whitespace-nowrap text-left text-sm text-zinc-800 dark:text-zinc-300">
                <thead className="bg-zinc-100 dark:bg-zinc-900/90 text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Pemain / ID</th>
                    <th className="py-3.5 px-4">Tier</th>
                    <th className="py-3.5 px-4">Skor XGBoost</th>
                    <th className="py-3.5 px-4">Kills / Damage</th>
                    <th className="py-3.5 px-4">Rank Match</th>
                    <th className="py-3.5 px-4 w-1/3">Catatan Scout (Notes)</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono text-xs">
                  {filteredShortlist.map((item, idx) => {
                    const isEditing = editingId === item.Player_ID;

                    return (
                      <tr key={item.Player_ID} className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 text-center font-gaming font-bold text-zinc-400">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950 shrink-0">
                              <img
                                src={getPlayerAvatar(item)}
                                alt={item.IGN || item.Player_ID}
                                className="w-full h-full object-cover object-top"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-gaming font-bold text-zinc-900 dark:text-white text-base">
                                {item.IGN || item.Player_ID}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{item.Player_ID}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-gaming font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {item.Tier}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-gaming font-bold text-base text-red-600">
                              {Number(item.Player_Score).toFixed(1)}
                            </span>
                            <span className="text-[10px] uppercase font-gaming text-zinc-500 dark:text-zinc-400">
                              ({item.Score_Category})
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {item.Kills} Kills • {Number(item.Damage_Dealt).toFixed(0)} Dmg
                        </td>

                        <td className="py-3.5 px-4 font-gaming font-bold text-red-600">
                          #{item.Match_Rank}
                        </td>

                        {/* Editable Notes Cell */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-red-600 text-xs text-zinc-900 dark:text-white focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveNotes(item.Player_ID)}
                                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                title="Simpan Catatan"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <span className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">
                                {item.notes || <em className="text-zinc-400">Belum ada catatan...</em>}
                              </span>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-opacity ml-2"
                                title="Edit Catatan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setReportPlayer(item)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-gaming font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              title="Cetak Laporan Scouting Resmi (PDF A4)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>CETAK PDF</span>
                            </button>
                            <button
                              onClick={() => removeFromShortlist(item.Player_ID)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-600/10 transition-colors cursor-pointer"
                              title="Hapus dari shortlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Official AI Scouting Report Print Modal */}
      {reportPlayer && (
        <ScoutingReportModal
          player={reportPlayer}
          notes={reportPlayer.notes}
          onClose={() => setReportPlayer(null)}
        />
      )}
    </div>
  );
};
