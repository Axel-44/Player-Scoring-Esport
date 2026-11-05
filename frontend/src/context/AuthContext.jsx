/**
 * frontend/src/context/AuthContext.jsx
 * Context autentikasi pengguna dengan integrasi Supabase Auth & proteksi role (FR-01).
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { isSupabaseConfigured, mockAuth, supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inisialisasi status sesi saat komponen pertama kali dimuat
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          try {
            // 1. Ambil session dari Supabase Auth
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user);
            } else {
              // Jika Supabase aktif dan tidak ada user yang sedang login, pastikan sesi bersih
              setUser(null);
              setProfile(null);
              setRole(null);
            }
            return;
          } catch (supaInitErr) {
            console.warn("Gagal inisialisasi Supabase session, fallback ke mock storage:", supaInitErr);
          }
        }
        
        // 2. Ambil session dari Mock Storage HANYA jika Supabase tidak dikonfigurasi
        const mockSession = mockAuth.getSession();
        if (mockSession?.user) {
          setUser(mockSession.user);
          setProfile(mockSession.profile);
          setRole(mockSession.profile.role);
        }
      } catch (err) {
        console.error("Gagal menginisialisasi sesi auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listener Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
            setRole(null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  // Mengambil profile dan role dari tabel profiles atau metadata
  const fetchProfile = async (authUser) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (data && !error) {
          setProfile(data);
          setRole(data.role);
          return;
        }
      }
      
      // Fallback ke user_metadata jika belum ada di tabel profiles
      const fallbackRole = authUser.user_metadata?.role || "player";
      const fallbackProfile = {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        role: fallbackRole,
      };
      setProfile(fallbackProfile);
      setRole(fallbackRole);
    } catch (err) {
      console.warn("Gagal mengambil profile, menggunakan fallback:", err);
    }
  };

  // Login dengan email & password
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            let msg = error.message;
            if (msg.toLowerCase().includes("invalid login credentials")) {
              msg = "Email atau kata sandi yang Anda masukkan salah. Tolong periksa kembali.";
            } else if (msg.toLowerCase().includes("email not confirmed")) {
              msg = "Email belum dikonfirmasi. Pastikan opsi 'Confirm email' telah dimatikan di Supabase Providers.";
            }
            return { success: false, error: msg };
          }
          setUser(data.user);
          await fetchProfile(data.user);
          return { success: true, user: data.user };
        } catch (supaErr) {
          console.warn("Koneksi Supabase login gagal:", supaErr);
          return { success: false, error: supaErr.message || "Gagal terhubung ke server autentikasi." };
        }
      } else {
        const { data, error } = await mockAuth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        setProfile(data.session.profile);
        setRole(data.session.profile.role);
        return { success: true, user: data.user };
      }
    } catch (error) {
      return { success: false, error: error.message || "Gagal masuk." };
    } finally {
      setLoading(false);
    }
  };

  // Registrasi pengguna baru dengan pemilihan role (Manager / Player)
  // Setelah registrasi sukses, pengguna diarahkan login manual (tidak otomatis login)
  const register = async (email, password, fullName, selectedRole) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: selectedRole,
              },
            },
          });
          if (error) {
            let msg = error.message;
            if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
              msg = "Akun dengan email ini sudah terdaftar. Silakan gunakan email lain atau langsung masuk.";
            }
            return { success: false, error: msg };
          }
          // Pastikan sesi lokal tetap bersih agar diarahkan login manual
          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch {}
          setUser(null);
          setProfile(null);
          setRole(null);
          return { success: true, user: data.user };
        } catch (supaErr) {
          console.warn("Koneksi Supabase register gagal:", supaErr);
          return { success: false, error: supaErr.message || "Gagal melakukan pendaftaran ke Supabase." };
        }
      } else {
        const { data, error } = await mockAuth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
            },
          },
        });
        if (error) throw error;
        mockAuth.clearSession();
        setUser(null);
        setProfile(null);
        setRole(null);
        return { success: true, user: data?.user };
      }
    } catch (error) {
      return { success: false, error: error.message || "Gagal melakukan pendaftaran." };
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login untuk kemudahan evaluasi & pengujian
  const loginAsDemo = async (targetRole = "manager") => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem("pulse_scout_compared_players");
      } catch {}
      const email = targetRole === "manager" ? "manager@esports-talent.id" : "player@esports-talent.id";
      const { data } = await mockAuth.signInWithPassword({ email, password: "demo-password" });
      setUser(data.user);
      setProfile(data.session.profile);
      setRole(data.session.profile.role);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      } else {
        await mockAuth.signOut();
      }
      setUser(null);
      setProfile(null);
      setRole(null);
      try {
        localStorage.removeItem("pulse_scout_compared_players");
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Reset Password via Email
  const resetPassword = async (email) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true, data };
      } else {
        const { data, error } = await mockAuth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true, data };
      }
    } catch (err) {
      return { success: false, error: err.message || "Gagal mengirim tautan reset kata sandi." };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    role,
    loading,
    isSupabaseConfigured,
    login,
    register,
    loginAsDemo,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
