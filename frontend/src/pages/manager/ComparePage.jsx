/**
 * frontend/src/pages/manager/ComparePage.jsx
 * Halaman Komparasi Head-to-Head 2-3 Pemain dengan Recharts Radar Chart dan matriks metrik (FR-07, BB-10).
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../context/PlayerStoreContext";
import { ScoreGauge } from "../../components/common/ScoreGauge";
import { PlayerRadarChart } from "../../components/common/PlayerRadarChart";
import {
  Users,
  Trophy,
  X,
  Plus,
  BookmarkCheck,
  Check,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { getPlayerAvatar } from "../../utils/avatarUtils";
import { ShortlistInviteModal } from "../../components/modals/ShortlistInviteModal";

export const ComparePage = () => {
  const {
    players,
    comparedPlayers,
    removeFromCompare,
    clearCompare,
    addToShortlist,
    shortlist,
    addToCompare,
    managerTeam,
  } = usePlayerStore();
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [mapFilter, setMapFilter] = useState("ALL");
  const [shortlistTargetPlayer, setShortlistTargetPlayer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Analisis Keselarasan Map (Apple-to-Apple Benchmark)
  const comparedMaps = comparedPlayers.map((p) => p.Map || "Erangel");
  const uniqueMaps = [...new Set(comparedMaps)];
  const isAppleToApple = comparedPlayers.length >= 2 && uniqueMaps.length === 1;
  const isDifferentMaps = comparedPlayers.length >= 2 && uniqueMaps.length > 1;
  const primaryMap = comparedPlayers.length > 0 ? (comparedPlayers[0].Map || "Erangel") : null;

  // Metrik yang dikomparasi secara head-to-head
  const comparisonMetrics = [
    { label: "Map Pertandingan", key: "Map", isMapRow: true, higherIsBetter: null, format: (v) => v || "Erangel" },
    { label: "Player Score (Model XGBoost)", key: "Player_Score", higherIsBetter: true, format: (v) => Number(v).toFixed(1) },
    { label: "Total Kills", key: "Kills", higherIsBetter: true, format: (v) => v },
    { label: "Damage Dealt", key: "Damage_Dealt", higherIsBetter: true, format: (v) => Number(v).toFixed(1) },
    { label: "Headshot Percentage", key: "Headshot_Percentage", higherIsBetter: true, format: (v) => `${Number(v).toFixed(1)}%` },
    { label: "Survival Time (Menit)", key: "Survival_Time_Minutes", higherIsBetter: true, format: (v) => `${Number(v).toFixed(1)} m` },
    { label: "Match Rank", key: "Match_Rank", higherIsBetter: false, format: (v) => `#${v}` },
    { label: "Assists", key: "Assists", higherIsBetter: true, format: (v) => v },
    { label: "Revives", key: "Revives", higherIsBetter: true, format: (v) => v },
    { label: "Longest Kill (Meter)", key: "Longest_Kill_meters", higherIsBetter: true, format: (v) => `${Number(v).toFixed(1)} m` },
    { label: "Distance Travelled (km)", key: "Distance_Travelled_km", higherIsBetter: true, format: (v) => `${Number(v).toFixed(1)} km` },
    { label: "Heals Used", key: "Heals_Used", higherIsBetter: true, format: (v) => v },
    { label: "Boosts Used", key: "Boosts_Used", higherIsBetter: true, format: (v) => v },
  ];

  // Helper untuk menentukan pemain dengan nilai metrik terbaik (Mendukung kondisi Seri / Tie)
  const getWinnerIndex = (metricKey, higherIsBetter) => {
    if (comparedPlayers.length < 2) return -1;
    let bestVal = Number(comparedPlayers[0][metricKey]);
    let bestIdx = 0;
    let isTie = false;

    for (let i = 1; i < comparedPlayers.length; i++) {
      const val = Number(comparedPlayers[i][metricKey]);
      if (higherIsBetter ? val > bestVal : val < bestVal) {
        bestVal = val;
        bestIdx = i;
        isTie = false;
      } else if (val === bestVal) {
        isTie = true;
      }
    }

    // Jika nilai terbaik seri / sama persis di antara kandidat, tidak ada yang di-highlight
    return isTie ? -1 : bestIdx;
  };

  const availablePlayersForAdding = players
    .filter((p) => !comparedPlayers.some((cp) => cp.Player_ID === p.Player_ID))
    .filter((p) => mapFilter === "ALL" || (p.Map && p.Map.toLowerCase() === mapFilter.toLowerCase()))
    .filter((p) => !searchFilter || (p.IGN && p.IGN.toLowerCase().includes(searchFilter.toLowerCase())) || p.Player_ID.toLowerCase().includes(searchFilter.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl glass-panel border border-red-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xl flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-600" />
          <span className="text-xs font-gaming font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-gaming font-semibold text-red-600 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            HEAD-TO-HEAD COMPARISON (FR-07, BB-10)
          </div>
          <h1 className="text-3xl font-gaming font-bold text-zinc-900 dark:text-white tracking-wide">
            KOMPARASI 2-3 KANDIDAT PEMAIN
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Bandingkan statistik kunci dan radar keahlian berdampingan untuk keputusan objektif pemilihan squad.
          </p>
        </div>

        {comparedPlayers.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="px-3.5 py-2 rounded-xl text-xs font-gaming font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600/10 hover:text-red-600 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              Kosongkan Komparasi
            </button>
          </div>
        )}
      </div>

      {comparedPlayers.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-600/30">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white mb-2">
            BELUM ADA PEMAIN YANG DIPILIH
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
            Pilih 2 hingga 3 pemain dari tabel Leaderboard atau klik tombol di bawah untuk menambahkan kandidat ke komparasi.
          </p>
          <Link
            to="/manager/leaderboard"
            className="px-6 py-2.5 rounded-xl text-xs font-gaming font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm inline-flex items-center gap-2 uppercase tracking-wider"
          >
            <Trophy className="w-4 h-4" />
            <span>PILIH DARI LEADERBOARD</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Top Cards: Selected Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparedPlayers.map((player, idx) => {
              const isShortlisted = shortlist.some((item) => item.Player_ID === player.Player_ID);
              const cardColor = idx === 0 ? "border-red-600" : "border-zinc-200 dark:border-zinc-800";

              return (
                <div
                  key={player.Player_ID}
                  className={`glass-panel rounded-2xl p-6 border-2 ${cardColor} relative flex flex-col justify-between shadow-sm`}
                >
                  <button
                    onClick={() => removeFromCompare(player.Player_ID)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-600/10 transition-colors"
                    title="Hapus dari komparasi"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          Pemain #{idx + 1}
                        </span>
                        <span className="text-xs font-gaming font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                          {player.Tier}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950 shrink-0 shadow-md">
                        <img
                          src={getPlayerAvatar(player)}
                          alt={player.IGN || player.Player_ID}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white tracking-wide truncate">
                          {player.IGN || player.Player_ID}
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
                          {player.Map} • {player.Favorite_Weapon || "M416"}
                        </p>
                      </div>
                    </div>

                    {/* Score Gauge */}
                    <div className="py-4 flex justify-center">
                      <ScoreGauge score={player.Player_Score} category={player.Score_Category} size="md" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      #{player.Match_Rank} Match Rank
                    </span>

                    <button
                      onClick={() => {
                        if (isShortlisted) {
                          showToast("Pemain sudah ada di dalam shortlist.");
                        } else {
                          setShortlistTargetPlayer(player);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-gaming font-bold flex items-center gap-1 cursor-pointer ${
                        isShortlisted
                          ? "bg-red-600/15 text-red-600 border border-red-600/30"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>{isShortlisted ? "SHORTLISTED" : "+ SHORTLIST"}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Slot Kosong untuk Menambah Pemain (jika kurang dari 3) */}
            {comparedPlayers.length < 3 && (
              <div className="glass-panel rounded-2xl p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center text-center min-h-[300px]">
                <button
                  onClick={() => setShowAddSelector(!showAddSelector)}
                  className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-all flex flex-col items-center gap-2 group"
                >
                  <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-gaming font-bold uppercase tracking-wider">
                    + Tambah Pemain ({comparedPlayers.length}/3)
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Selector Modal / Drawer to add player */}
          {showAddSelector && (
            <div className="glass-panel rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-600" />
                    <span>PILIH PEMAIN DARI TALENT POOL</span>
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-500">
                    Pilih pemain dengan map yang sama untuk perbandingan yang adil (Apple-to-Apple).
                  </p>
                </div>
                <button onClick={() => setShowAddSelector(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Bar: Search + Map Tabs */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Cari IGN atau ID pemain (cth: BTR, P10)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
                />

                {/* Filter Map Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {["ALL", "Erangel", "Miramar", "Sanhok", "Livik", "Vikendi"].map((mapName) => (
                    <button
                      key={mapName}
                      type="button"
                      onClick={() => setMapFilter(mapName)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-gaming font-bold uppercase transition-all shrink-0 cursor-pointer ${
                        mapFilter === mapName
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      {mapName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shortcut: Apple-to-Apple Quick Filter */}
              {primaryMap && mapFilter !== primaryMap && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                    Kandidat pertama bermain di <strong>{primaryMap}</strong>.
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapFilter(primaryMap)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-gaming font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Filter Map {primaryMap} (Apple-to-Apple)
                  </button>
                </div>
              )}

              {/* Candidate Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {availablePlayersForAdding.map((p) => (
                  <button
                    key={p.Player_ID}
                    onClick={() => {
                      addToCompare(p);
                      setShowAddSelector(false);
                    }}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-red-600 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase">
                        {p.Map || "Erangel"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{p.Tier}</span>
                    </div>
                    <p className="text-xs font-gaming font-bold text-zinc-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                      {p.IGN || p.Player_ID}
                    </p>
                    <span className="text-xs font-gaming font-black text-red-600 block mt-1">
                      Skor: {Number(p.Player_Score).toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              APPLE-TO-APPLE MAP ALIGNMENT BANNER
              ========================================================================= */}
          {isAppleToApple && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-sm animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-gaming font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>KOMPARASI APPLE-TO-APPLE VALID</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono">
                    MAP: {uniqueMaps[0].toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-mono leading-relaxed text-zinc-700 dark:text-zinc-300">
                  Seluruh {comparedPlayers.length} kandidat bertanding di map yang sama (<strong>{uniqueMaps[0]}</strong>). Parameter rotasi kendaraan, luas safe zone, dan combat spacing berada pada tolok ukur pengujian yang 100% adil dan objektif.
                </p>
              </div>
            </div>
          )}

          {isDifferentMaps && (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/40 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-gaming font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <span>PERINGATAN KONTEKS: MAP BERBEDA</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-mono">
                      {uniqueMaps.join(" VS ").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-mono leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Kandidat berasal dari map berbeda. Karakteristik map kecil seperti <strong>Sanhok (4x4 km)</strong> bertempo cepat dengan rotasi pendek, sedangkan <strong>Erangel/Miramar (8x8 km)</strong> menuntut makro rotasi kendaraan jarak jauh. Untuk hasil rekrutmen objektif (apple-to-apple), bandingkan pemain di map yang sama.
                  </p>
                </div>
              </div>
              {primaryMap && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSelector(true);
                    setMapFilter(primaryMap);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-gaming font-bold tracking-wider uppercase shrink-0 transition-all shadow-sm cursor-pointer"
                >
                  Cari Map {primaryMap} Saja
                </button>
              )}
            </div>
          )}

          {/* Multi-Radar Chart Overlay Comparison */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Multi-Axis Radar Comparison
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Visualisasi komparasi 5 dimensi (Combat, Survival, Teamwork, Precision, Utility) dalam satu radar.
            </p>

            <PlayerRadarChart players={comparedPlayers} height={340} />
          </div>

          {/* Head-to-Head Detailed Comparison Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-gaming font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Matriks Komparasi Statistik Head-to-Head
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-800 dark:text-zinc-300">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-gaming uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 w-1/3">Metrik Evaluasi</th>
                    {comparedPlayers.map((player, idx) => (
                      <th key={player.Player_ID} className="py-3 px-4 text-center">
                        <span className="text-zinc-900 dark:text-white font-bold">{player.IGN || player.Player_ID}</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">({player.Tier})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono text-xs">
                  {comparisonMetrics.map((metric) => {
                    if (metric.isMapRow) {
                      return (
                        <tr key={metric.key} className="bg-zinc-100/60 dark:bg-white/[0.03]">
                          <td className="py-3 px-4 font-sans text-zinc-900 dark:text-zinc-100 font-bold flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-red-600" />
                            <span>{metric.label}</span>
                          </td>
                          {comparedPlayers.map((player) => (
                            <td key={player.Player_ID} className="py-3 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold uppercase text-[11px] border border-zinc-300 dark:border-zinc-700">
                                {player.Map || "Erangel"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    }

                    const winnerIdx = getWinnerIndex(metric.key, metric.higherIsBetter);

                    return (
                      <tr key={metric.key} className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-sans text-zinc-800 dark:text-zinc-300 font-medium">{metric.label}</td>
                        {comparedPlayers.map((player, idx) => {
                          const isWinner = idx === winnerIdx;
                          const rawVal = player[metric.key];
                          const formatted = metric.format(rawVal);

                          return (
                            <td key={player.Player_ID} className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-1 rounded-md ${
                                  isWinner
                                    ? "bg-red-600/10 text-red-600 font-bold border border-red-600/30"
                                    : "text-zinc-500 dark:text-zinc-400"
                                }`}
                              >
                                {formatted}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Dialog Undangan Shortlist Personal (Pesan Kustom Manajer) */}
      {shortlistTargetPlayer && (
        <ShortlistInviteModal
          isOpen={Boolean(shortlistTargetPlayer)}
          onClose={() => setShortlistTargetPlayer(null)}
          player={shortlistTargetPlayer}
          managerTeam={managerTeam}
          onConfirm={(player, customMessage) => {
            const res = addToShortlist(player, customMessage);
            showToast(res.message);
          }}
        />
      )}
    </div>
  );
};
