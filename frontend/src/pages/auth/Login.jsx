/**
 * frontend/src/pages/auth/Login.jsx
 * Halaman Masuk (Login) Modern E-Sports Split-Screen.
 * Mendukung penuh Pengujian Blackbox (Validasi Field Kosong, Notifikasi Kredensial Spesifik, Reset Password).
 * Mendukung penuh Light Mode (Teks Hitam) & Dark Mode (Teks Putih).
 * Font Poppins selaras, tanpa huruf kekecilan, tanpa garis miring.
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Crosshair,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  KeyRound,
} from "lucide-react";

export const Login = () => {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registrationNotice, setRegistrationNotice] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tangkap redirect dari registrasi sukses
  React.useEffect(() => {
    if (location.state?.registeredSuccess) {
      if (location.state.email) {
        setEmail(location.state.email);
      }
      setRegistrationNotice(
        "Pendaftaran berhasil! Akun Anda telah terdaftar. Silakan masukkan kata sandi Anda untuk masuk."
      );
    }
  }, [location.state]);

  // State Modal Lupa Kata Sandi (Password Reset)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoginSuccess(false);

    const trimmedEmail = email.trim();

    // 1. Validasi Input Kosong Spesifik (Blackbox Test Scenarios)
    if (!trimmedEmail && !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    if (!trimmedEmail && password) {
      setError("Alamat email wajib diisi.");
      return;
    }

    if (trimmedEmail && !password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    // 2. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Format alamat email tidak valid (contoh: nama@email.com).");
      return;
    }

    setLoading(true);
    const result = await login(trimmedEmail, password);
    setLoading(false);

    if (result.success) {
      setRegistrationNotice("");
      setLoginSuccess(true);
      const targetUser = result.user;
      const userRole = targetUser?.user_metadata?.role || "player";
      const userEmail = (targetUser?.email || "").toLowerCase().trim();
      const userKey = targetUser?.id || userEmail.replace(/[^a-zA-Z0-9]/g, "_");

      setTimeout(() => {
        if (userRole === "manager") {
          // Logika Alur Onboarding Manager
          let isCompleted = false;
          try {
            const savedTeam = localStorage.getItem(`pulse_scout_team_${userKey}`);
            if (savedTeam) {
              const parsed = JSON.parse(savedTeam);
              isCompleted = Boolean(parsed.isProfileCompleted);
            } else if (userEmail === "manager@esports-talent.id") {
              isCompleted = true;
            }
          } catch {}

          if (!isCompleted) {
            navigate("/manager/team-profile", { replace: true, state: { isFirstTime: true } });
          } else if (location.state?.from?.pathname && location.state.from.pathname !== "/") {
            navigate(location.state.from.pathname, { replace: true });
          } else {
            navigate("/manager/dashboard", { replace: true });
          }
        } else {
          // Logika Alur Onboarding Player
          let isCompleted = false;
          try {
            const savedProfile = localStorage.getItem(`pulse_scout_profile_${userKey}`);
            if (savedProfile) {
              const parsed = JSON.parse(savedProfile);
              isCompleted = Boolean(parsed.isProfileCompleted);
            } else if (userEmail === "player@esports-talent.id") {
              isCompleted = true;
            }
          } catch {}

          if (!isCompleted) {
            navigate("/player/profile", { replace: true, state: { isFirstTime: true } });
          } else if (location.state?.from?.pathname && location.state.from.pathname !== "/") {
            navigate(location.state.from.pathname, { replace: true });
          } else {
            navigate("/player/dashboard", { replace: true });
          }
        }
      }, 1000);
    } else {
      setError(
        result.error ||
          "Kata sandi yang Anda masukkan salah. Tolong periksa email atau kata sandi agar sesuai."
      );
    }
  };

  // Handler Kirim Tautan Lupa Sandi
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotError("Alamat email wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setForgotError("Format email tidak valid (contoh: nama@email.com).");
      return;
    }

    setForgotLoading(true);
    const res = await resetPassword(trimmed);
    setForgotLoading(false);

    if (res.success) {
      setForgotSuccess(
        "Tautan reset kata sandi telah dikirim ke email Anda! Silakan periksa kotak masuk atau folder spam."
      );
    } else {
      setForgotError(res.error || "Gagal mengirim tautan reset kata sandi.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#09090b] text-black dark:text-white font-sans transition-colors duration-200">
      
      {/* =========================================================================
          KOLOM KIRI: FORMULIR LOGIN (Bersih, Rapi, Pengujian Blackbox)
          ========================================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 z-10">
        <div className="w-full max-w-md space-y-7">
          
          {/* Header Brand */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black dark:text-white leading-tight">
              MASUK KE <span className="text-red-600">PULSE SCOUT</span>
            </h1>
            
            <p className="text-sm font-normal text-black dark:text-white leading-relaxed">
              Platform Penilaian Pemain PUBG Mobile Berbasis Machine Learning XGBoost Regressor.
            </p>
          </div>

          {/* Notifikasi Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-600 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Notifikasi Berhasil Registrasi / Berhasil Masuk */}
          {registrationNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-bold">{registrationNotice}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-bold">Berhasil masuk! Memeriksa status profil akun...</span>
            </div>
          )}

          {/* Form Login Standar */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  onChange={(e) => {
                    setEmail(e.target.value.toLowerCase().trim());
                    if (error) setError("");
                  }}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(email);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  className="text-xs text-red-600 hover:underline font-bold transition-colors cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 text-sm font-medium focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loginSuccess}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold tracking-wider text-white bg-red-600 hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2 uppercase disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>MEMPROSES...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>BERHASIL MASUK</span>
                </>
              ) : (
                <>
                  <span>MASUK SEKARANG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="text-center text-xs text-black dark:text-white pt-2">
            Belum memiliki akun?{" "}
            <Link to="/register" className="text-red-600 hover:underline font-bold">
              Daftar Akun Baru
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

      {/* =========================================================================
          MODAL: LUPA KATA SANDI (PASSWORD RESET VIA EMAIL)
          ========================================================================= */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-black dark:text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base uppercase">Reset Kata Sandi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Masukkan alamat email Anda yang terdaftar. Sistem akan mengirimkan tautan aman untuk membuat kata sandi baru ke inbox email Anda.
            </p>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{forgotSuccess}</span>
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword} noValidate className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer uppercase"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <span>Kirim Tautan Reset</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer uppercase"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;