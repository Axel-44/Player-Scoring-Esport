/**
 * frontend/src/components/auth/ProtectedRoute.jsx
 * Route guard untuk melindungi halaman privat dan memastikan akses berdasarkan role (Manager / Player).
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-600 font-gaming font-bold text-sm">P</span>
          </div>
        </div>
        <p className="mt-4 text-xs font-gaming tracking-widest text-zinc-500 dark:text-zinc-400 animate-pulse uppercase">
          MEMVERIFIKASI AKSES PERAN...
        </p>
      </div>
    );
  }

  // Jika belum login, redirect ke halaman Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalisasi role pengguna (case-insensitive & fallback metadata)
  const userRole = String(role || user?.user_metadata?.role || "player").toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles.map((r) => String(r).toLowerCase().trim());

  // Jika role dibatasi dan user tidak memiliki role yang diizinkan
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    // Alihkan ke halaman utama sesuai role yang dimiliki (hindari redirect berulang ke halaman yang sama)
    const targetPath = userRole === "manager" ? "/manager/dashboard" : "/player/dashboard";
    if (location.pathname !== targetPath) {
      return <Navigate to={targetPath} replace />;
    }

    return (
      <div className="min-h-[60vh] bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-gaming font-bold mb-2">AKSES TIDAK DIIZINKAN</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6 text-xs sm:text-sm">
          Akun Anda ({userRole}) tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya untuk role:{" "}
          <span className="text-red-600 font-semibold">{allowedRoles.join(", ")}</span>.
        </p>
        <button
          onClick={() => window.location.href = targetPath}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs uppercase tracking-wider transition-colors"
        >
          KEMBALI KE BERANDA
        </button>
      </div>
    );
  }

  return children;
};
