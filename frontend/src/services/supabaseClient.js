/**
 * frontend/src/services/supabaseClient.js
 * Inisialisasi client Supabase dengan penanganan mode demo lokal ketika kredensial
 * belum diisi di .env, sehingga frontend tetap dapat berjalan dan diuji sepenuhnya.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("your-project") &&
  supabaseUrl.startsWith("http")
);

// Inisialisasi client resmi jika kredensial valid
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Mock Auth Service untuk pengujian offline / sebelum Supabase dihubungkan
 */
const MOCK_STORAGE_KEY = "pulse_scout_mock_session";
const MOCK_USERS_STORAGE_KEY = "pulse_scout_mock_users";

// Akun bawaan sistem untuk pengujian
const DEFAULT_MOCK_USERS = [
  {
    email: "manager@esports-talent.id",
    password: "password123",
    fullName: "Alex Mercer (Manager Scout)",
    role: "manager",
  },
  {
    email: "player@esports-talent.id",
    password: "password123",
    fullName: "BTR Ryzen (Pro Player)",
    role: "player",
  },
];

const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return DEFAULT_MOCK_USERS;
};

export const mockAuth = {
  getSession: () => {
    try {
      const data = localStorage.getItem(MOCK_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession: (session) => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));
  },

  clearSession: () => {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  },

  signInWithPassword: async ({ email, password }) => {
    // Simulasi delay jaringan
    await new Promise((r) => setTimeout(r, 400));

    const normalizedEmail = (email || "").trim().toLowerCase();
    const users = getStoredUsers();

    // Cek apakah email terdaftar
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return {
        data: null,
        error: { message: "Akun dengan email ini belum terdaftar. Silakan periksa kembali atau daftar akun baru." },
      };
    }

    const isValidUser =
      foundUser &&
      (foundUser.password === password || password === "demo-password" || password === "password123");

    if (!isValidUser) {
      return {
        data: null,
        error: { message: "Kata sandi yang Anda masukkan salah. Tolong periksa email atau kata sandi agar sesuai." },
      };
    }

    const mockUser = {
      id: "mock-" + foundUser.email.replace(/[^a-zA-Z0-9]/g, "_"),
      email: foundUser.email,
      user_metadata: { full_name: foundUser.fullName, role: foundUser.role },
    };

    const session = {
      user: mockUser,
      profile: {
        id: mockUser.id,
        full_name: foundUser.fullName,
        role: foundUser.role,
      },
    };

    mockAuth.setSession(session);
    return { data: { user: mockUser, session }, error: null };
  },

  signUp: async ({ email, password, options }) => {
    await new Promise((r) => setTimeout(r, 400));
    const normalizedEmail = (email || "").trim().toLowerCase();
    const fullName = options?.data?.full_name || "New User";
    const role = options?.data?.role || "player";

    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return {
        data: null,
        error: { message: "Akun dengan email ini sudah terdaftar. Silakan gunakan email lain atau masuk." },
      };
    }

    const newUser = {
      email: normalizedEmail,
      password: password,
      fullName: fullName,
      role: role,
    };

    const updatedUsers = [...users, newUser];
    try {
      localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch {}

    const mockUser = {
      id: "mock-" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_"),
      email: normalizedEmail,
      user_metadata: { full_name: fullName, role },
    };

    const session = {
      user: mockUser,
      profile: {
        id: mockUser.id,
        full_name: fullName,
        role: role,
      },
    };

    mockAuth.setSession(session);
    return { data: { user: mockUser, session }, error: null };
  },

  resetPasswordForEmail: async (email) => {
    await new Promise((r) => setTimeout(r, 400));
    const normalizedEmail = (email || "").trim().toLowerCase();
    const users = getStoredUsers();
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return {
        data: null,
        error: { message: "Akun dengan email ini belum terdaftar. Silakan periksa kembali." },
      };
    }

    return {
      data: { message: "Tautan reset kata sandi telah dikirim ke email Anda." },
      error: null,
    };
  },

  signOut: async () => {
    mockAuth.clearSession();
    return { error: null };
  },
};
