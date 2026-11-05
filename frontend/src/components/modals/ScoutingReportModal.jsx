/**
 * frontend/src/components/modals/ScoutingReportModal.jsx
 * Modal pratinjau & pencetakan Laporan Scouting Resmi (Official AI Scouting Report).
 * Didesain formal untuk format cetak / simpan ke PDF ukuran A4:
 * - Kop Surat Resmi PulseScout Esports Talent Analytics
 * - Metadata Laporan & ID Dokumen Unik
 * - Profil Atlet, Vision Card & Foto
 * - Visualisasi Radar Chart 5-Dimensi & Hasil Inferensi Model XGBoost
 * - Matriks Statistik Pertandingan Komprehensif
 * - Catatan Evaluasi Manajer & Kolom Tanda Tangan Resmi
 */

import React, { useRef } from "react";
import {
  Printer,
  X,
  Shield,
  Trophy,
  Crosshair,
  Download,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react";
import { PlayerRadarChart } from "../common/PlayerRadarChart";
import { getPlayerAvatar, getPlayerRoleInfo } from "../../utils/avatarUtils";

export const ScoutingReportModal = ({ player, notes = "", customAvatar = null, onClose }) => {
  const printRef = useRef(null);

  if (!player) return null;

  const roleInfo = getPlayerRoleInfo(player);
  const avatarUrl = getPlayerAvatar(player, null, customAvatar);
  const reportDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const docNumber = `PS-REP-${new Date().getFullYear()}-${String(player.Player_ID).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "001"}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>CETAK / SIMPAN PDF (A4)</span>
        </button>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sheet Container: Designed to match standard A4 paper */}
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-2 sm:p-6 print:p-0 print:m-0 print:max-h-none print:bg-white print:text-black">
        <div
          ref={printRef}
          id="scouting-report-sheet"
          className="bg-white text-zinc-950 p-6 sm:p-10 rounded-xl shadow-xl print:shadow-none print:p-8 print:w-full border border-zinc-200 print:border-none font-sans"
        >
          {/* =========================================================================
              1. KOP SURAT RESMI (OFFICIAL HEADER)
              ========================================================================= */}
          <div className="flex items-start justify-between border-b-2 border-red-600 pb-5 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0">
                <Crosshair className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-gaming font-black tracking-wider text-black">
                    PULSE<span className="text-red-600">SCOUT</span>
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white font-bold uppercase">
                    OFFICIAL REPORT
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Platform Analitika Talent Scouting & Penilaian Performa Atlet PUBG Mobile
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Sistem Inferensi XGBoost Regressor • FMIPA Universitas Pakuan
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="inline-block px-2.5 py-0.5 rounded bg-red-50 border border-red-300 text-red-700 font-bold text-[10px] uppercase mb-1">
                CONFIDENTIAL • SCOUT REPORT
              </span>
              <p className="text-zinc-500 text-[11px]">No. Dokumen:</p>
              <p className="font-bold text-black">{docNumber}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">Tanggal: {reportDate}</p>
            </div>
          </div>

          {/* =========================================================================
              2. KANDIDAT PROFILE & VISION CARD
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6 pb-6 border-b border-zinc-200">
            {/* Foto Profil Atlet & Badge Skor Utama */}
            <div className="md:col-span-4 flex flex-col items-center text-center p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-zinc-300 bg-white mb-3 shrink-0 shadow-sm">
                <img
                  src={avatarUrl}
                  alt={player.IGN || player.Player_ID}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <h2 className="text-xl font-gaming font-black text-black tracking-wide">
                {player.IGN || player.Player_ID}
              </h2>
              <p className="text-xs font-mono text-zinc-500 mb-2">ID: {player.Player_ID}</p>

              <span className="px-3 py-1 rounded-full text-xs font-gaming font-bold bg-black text-white uppercase tracking-wider mb-3">
                {roleInfo.title}
              </span>

              {/* Box Skor AI */}
              <div className="w-full pt-3 border-t border-zinc-200 flex items-center justify-between px-3">
                <div className="text-left">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Player Score</span>
                  <span className="text-2xl font-black font-gaming text-red-600">
                    {Number(player.Player_Score || 0).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400"> / 100 PTS</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Klasifikasi</span>
                  <span className="text-xs font-gaming font-bold text-black px-2 py-0.5 rounded border border-zinc-300 bg-white">
                    {player.Score_Category || "Master"}
                  </span>
                </div>
              </div>
            </div>

            {/* Radar Chart 5-Dimensi & Ringkasan Performa */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-gaming font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  ANALISIS MULTI-DIMENSI MODEL ML (0 - 100)
                </h3>
                <div className="h-44 w-full flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-200">
                  <PlayerRadarChart players={player} height={175} />
                </div>
              </div>

              {/* Mini Summary Chips */}
              <div className="grid grid-cols-4 gap-2 text-center mt-3 text-xs font-mono">
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 block">TIER</span>
                  <span className="font-bold text-black">{player.Tier || "Ace"}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 block">MAP FAVORIT</span>
                  <span className="font-bold text-black">{player.Map || "Erangel"}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 block">SENJATA</span>
                  <span className="font-bold text-black">{player.Favorite_Weapon || "M416"}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 block">MATCH RANK</span>
                  <span className="font-bold text-red-600">#{player.Match_Rank || 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. TABEL STATISTIK PERTANDINGAN (DATA METRIKS)
              ========================================================================= */}
          <div className="mb-6">
            <h3 className="text-xs font-gaming font-bold uppercase tracking-wider text-black mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              MATRIKS STATISTIK DETAIL PERTANDINGAN
            </h3>

            <table className="w-full text-left text-xs border border-zinc-200 rounded-lg overflow-hidden font-mono">
              <thead className="bg-zinc-100 text-[11px] font-bold text-zinc-700 uppercase">
                <tr>
                  <th className="py-2 px-3 border-b border-zinc-200">Metrik Evaluasi</th>
                  <th className="py-2 px-3 border-b border-zinc-200 text-center">Nilai Atlet</th>
                  <th className="py-2 px-3 border-b border-zinc-200">Standar Kompetisi E-Sports</th>
                  <th className="py-2 px-3 border-b border-zinc-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-2 px-3 font-semibold">Total Eliminasi (Kills)</td>
                  <td className="py-2 px-3 text-center font-bold text-red-600">{player.Kills} Kills</td>
                  <td className="py-2 px-3 text-zinc-500">Benchmark Pro SEA: &gt;= 4 Kills</td>
                  <td className="py-2 px-3 text-center">
                    {Number(player.Kills) >= 4 ? (
                      <span className="text-emerald-700 font-bold">Lolos Target</span>
                    ) : (
                      <span className="text-zinc-500">Standar</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Damage Dealt</td>
                  <td className="py-2 px-3 text-center font-bold text-black">
                    {Number(player.Damage_Dealt).toFixed(1)} HP
                  </td>
                  <td className="py-2 px-3 text-zinc-500">Benchmark Pro SEA: &gt;= 500 HP</td>
                  <td className="py-2 px-3 text-center">
                    {Number(player.Damage_Dealt) >= 500 ? (
                      <span className="text-emerald-700 font-bold">Lolos Target</span>
                    ) : (
                      <span className="text-zinc-500">Standar</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Headshot Accuracy</td>
                  <td className="py-2 px-3 text-center font-bold text-black">
                    {Number(player.Headshot_Percentage).toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-zinc-500">Benchmark Presisi: &gt;= 20%</td>
                  <td className="py-2 px-3 text-center">
                    {Number(player.Headshot_Percentage) >= 20 ? (
                      <span className="text-emerald-700 font-bold">Tinggi</span>
                    ) : (
                      <span className="text-zinc-500">Standar</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Survival Time Duration</td>
                  <td className="py-2 px-3 text-center font-bold text-black">
                    {Number(player.Survival_Time_Minutes).toFixed(1)} Menit
                  </td>
                  <td className="py-2 px-3 text-zinc-500">Zone Finalist: &gt;= 20 Menit</td>
                  <td className="py-2 px-3 text-center">
                    {Number(player.Survival_Time_Minutes) >= 20 ? (
                      <span className="text-emerald-700 font-bold">Late Game</span>
                    ) : (
                      <span className="text-zinc-500">Early/Mid</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Assists &amp; Revives (Teamwork)</td>
                  <td className="py-2 px-3 text-center font-bold text-black">
                    {player.Assists || 0} Ast / {player.Revives || 0} Rev
                  </td>
                  <td className="py-2 px-3 text-zinc-500">Sinergi Squad &amp; Role Support</td>
                  <td className="py-2 px-3 text-center text-zinc-600 font-semibold">Optimal</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Longest Kill Distance</td>
                  <td className="py-2 px-3 text-center font-bold text-black">
                    {Number(player.Longest_Kill_meters || 0).toFixed(1)} Meter
                  </td>
                  <td className="py-2 px-3 text-zinc-500">Jangkauan Tembak Maksimal</td>
                  <td className="py-2 px-3 text-center text-zinc-600">Tercatat</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =========================================================================
              4. CATATAN KUALITATIF & REKOMENDASI MANAJER
              ========================================================================= */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 mb-8">
            <h4 className="text-xs font-gaming font-bold uppercase tracking-wider text-black mb-1">
              CATATAN REKRUTMEN &amp; TINDAK LANJUT MANAJER (SCOUTING NOTES):
            </h4>
            <p className="text-xs text-zinc-700 italic leading-relaxed">
              &ldquo;
              {notes ||
                player.notes ||
                "Kandidat menunjukkan konsistensi mekanik dan pengambilan keputusan rotasi yang kuat. Direkomendasikan untuk masuk ke tahap uji coba tanding (Scrim / Trial Match) bersama tim inti."}
              &rdquo;
            </p>
          </div>

          {/* =========================================================================
              5. KOLOM PENGESAHAN (SIGNATURES)
              ========================================================================= */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-zinc-200 text-xs">
            <div className="text-center">
              <p className="text-zinc-500 text-[11px] mb-12">Disiapkan Oleh (Lead Scout):</p>
              <div className="w-48 mx-auto border-b border-zinc-400 pb-1 font-bold text-black">
                Alex Mercer
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Head of Talent Scouting</p>
            </div>

            <div className="text-center">
              <p className="text-zinc-500 text-[11px] mb-12">Disetujui Oleh (Team Manager):</p>
              <div className="w-48 mx-auto border-b border-zinc-400 pb-1 font-bold text-black">
                Management E-Sports
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Esports Operations Director</p>
            </div>
          </div>

          {/* Watermark / Footer Paper */}
          <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
            <span>GEN: PULSE SCOUT AI SCOUTING SYSTEM • UNIVERSITAS PAKUAN</span>
            <span>HALAMAN 1 DARI 1 • RESMI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
