/**
 * frontend/src/pages/auth/Register.jsx
 * Halaman Registrasi Pengguna Baru Bertema E-Sports Split-Screen.
 * Mendukung penuh Pengujian Blackbox (Validasi Lengkap, Feedback Real-Time, Email Unik).
 * Mendukung penuh Light Mode (Teks Hitam) & Dark Mode (Teks Putih).
 * Font Poppins selaras, tanpa huruf kekecilan, tanpa garis miring.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Crosshair,
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("manager");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Kriteria Kekuatan Kata Sandi
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    // 1. Validasi Input Kosong Spesifik (Blackbox Test Scenarios)
    if (!trimmedName && !trimmedEmail) {
      setError("Nama lengkap dan alamat email wajib diisi.");
      return;
    }

    if (!trimmedName && trimmedEmail) {
      setError("Nama pengguna / In-Game Name (IGN) wajib diisi.");
      return;
    }

    if (trimmedName && !trimmedEmail) {
      setError("Alamat email wajib diisi.");
      return;
    }

    // 2. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Format alamat email tidak valid (contoh: nama@email.com).");
      return;
    }

    // 3. Validasi Kata Sandi
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    if (!hasMinLength) {
      setError("Kata sandi minimal harus 8 karakter.");
      return;
    }

    if (!hasUpper || !hasLower || !hasNumber) {
      setError(
        "Kata sandi harus mengandung kombinasi huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9)."
      );
      return;
    }

    // 4. Validasi Konfirmasi Sandi
    if (!confirmPassword) {
      setError("Konfirmasi kata sandi wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Pastikan kedua kata sandi sama.");
      return;
    }

    setLoading(true);
    const result = await register(trimmedEmail, password, trimmedName, selectedRole);
    setLoading(false);

    if (result.success) {
      setSuccessMessage("Akun berhasil dibuat! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        navigate("/login", {
          state: { email: trimmedEmail, registeredSuccess: true },
        });
      }, 500);
    } else {
      setError(result.error || "Gagal melakukan pendaftaran. Silakan coba kembali.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#09090b] text-black dark:text-white font-sans transition-colors duration-200">
      
      {/* =========================================================================
          KOLOM KIRI: FORMULIR PENDAFTARAN
          ========================================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header Bersih (Badge REGISTRASI TALENTA E-SPORTS Dihapus Sesuai Permintaan) */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black dark:text-white leading-tight">
              DAFTAR AKUN <span className="text-red-600">BARU</span>
            </h1>
            
            <p className="text-sm font-normal text-black dark:text-white leading-relaxed">
              Bergabung dengan platform scouting PUBG Mobile berbasis kecerdasan buatan XGBoost.
            </p>
          </div>

          {/* Notifikasi Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-600 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Notifikasi Berhasil */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Pilihan Peran (Role Selection) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2">
                PILIH PERAN ANDA (ROLE)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Manager */}
                <div
                  onClick={() => setSelectedRole("manager")}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col gap-1.5 relative ${
                    selectedRole === "manager"
                      ? "bg-red-600/10 border-red-600 shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {selectedRole === "manager" && (
                    <CheckCircle2 className="w-4 h-4 text-red-600 absolute top-3 right-3" />
                  )}
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-600 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-black dark:text-white">MANAGER TIM</p>
                    <p className="text-xs text-black dark:text-white font-normal mt-0.5 leading-snug">
                      Leaderboard, radar scouting, dan shortlist pemain
                    </p>
                  </div>
                </div>

                {/* Player */}
                <div
                  onClick={() => setSelectedRole("player")}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col gap-1.5 relative ${
                    selectedRole === "player"
                      ? "bg-red-600/10 border-red-600 shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {selectedRole === "player" && (
                    <CheckCircle2 className="w-4 h-4 text-red-600 absolute top-3 right-3" />
                  )}
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-600 flex items-center justify-center">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-black dark:text-white">PLAYER ATLET</p>
                    <p className="text-xs text-black dark:text-white font-normal mt-0.5 leading-snug">
                      Kalkulasi Player Score real-time & Kartu Vision
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nama Lengkap / IGN */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                Nama Lengkap / In-Game Name (IGN)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Contoh: Muhammad Albi / Ryzen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                Alamat Email Aktif
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Kata Sandi & Konfirmasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Konfirmasi Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Kekuatan Kata Sandi Real-Time */}
            {password.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1 animate-fadeIn">
                <span className="font-bold text-black dark:text-white block mb-1">
                  Syarat Keamanan Kata Sandi:
                </span>
                <div className="grid grid-cols-2 gap-1 font-mono">
                  <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Minimal 8 karakter
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}>
                    {hasUpper ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Huruf besar (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}>
                    {hasLower ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Huruf kecil (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    Angka (0-9)
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(successMessage)}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold tracking-wider text-white bg-red-600 hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2 uppercase disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>MENDAFTARKAN...</span>
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>BERHASIL TERDAFTAR</span>
                </>
              ) : (
                <>
                  <span>DAFTAR SEKARANG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center text-xs text-black dark:text-white pt-2">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="text-red-600 hover:underline font-bold">
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KOLOM KANAN: PANGGUNG E-SPORTS PMGC TOURNAMENT (Visual Bersih & Megah)
          ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden items-end justify-start">
        <div className="absolute inset-0 z-0">
          <img
            src="/pmgc_stage.jpg"
            alt="PMGC Tournament Stage"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 p-10 lg:p-14 w-full">
          <div className="inline-block border-l-4 border-red-600 pl-4 py-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-lg leading-tight font-sans">
              PLAYER SCORING FOR TALENT
            </h2>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;