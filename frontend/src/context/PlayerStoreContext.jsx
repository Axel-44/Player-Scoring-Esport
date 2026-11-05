/**
 * frontend/src/context/PlayerStoreContext.jsx
 * State management terpusat untuk dataset pemain (2.500 data Kaggle),
 * shortlist kandidat, riwayat skor player, dan komparasi head-to-head.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import initialPlayersData from "../data/players.json";

const PlayerStoreContext = createContext(null);

const SHORTLIST_STORAGE_KEY = "pulse_scout_shortlist";
const USER_HISTORY_STORAGE_KEY = "pulse_scout_player_history";
const CUSTOM_PLAYERS_STORAGE_KEY = "pulse_scout_custom_players";
const COMPARED_STORAGE_KEY = "pulse_scout_compared_players";
const AVATAR_STORAGE_KEY = "pulse_scout_custom_avatar";
const PROFILE_STORAGE_KEY = "pulse_scout_player_profile";
const REGISTERED_TEAMS_STORAGE_KEY = "pulse_scout_registered_teams";
const MANAGER_TEAM_STORAGE_KEY = "pulse_scout_manager_team";
const WISHLIST_TEAMS_STORAGE_KEY = "pulse_scout_player_wishlist_teams";
const NOTIFICATIONS_STORAGE_KEY = "pulse_scout_player_notifications";
const MANAGER_NOTIFICATIONS_STORAGE_KEY = "pulse_scout_manager_notifications";

// Notifikasi Default Sambutan & Undangan Scouting untuk Sisi Player
const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "welcome",
    senderName: "PulseScout System",
    teamName: "PulseScout Platform",
    teamTag: "PSC",
    title: "Selamat Datang di Platform PulseScout",
    message: "Lengkapi profil atlet dan mulai input data statistik pertandingan PUBG Mobile Anda untuk mendapatkan penilaian performa Machine Learning.",
    timestamp: "Baru saja",
    read: false,
    actionUrl: "/player/profile",
    actionLabel: "Lengkapi Profil",
  },
];

// Notifikasi Default Khusus Sisi Manager (Aktivitas Talenta & Tim)
const DEFAULT_MANAGER_NOTIFICATIONS = [
  {
    id: "mgr-notif-1",
    type: "welcome",
    senderName: "PulseScout Analytics",
    teamName: "Manajemen Tim",
    teamTag: "MGR",
    title: "Selamat Datang di Portal Eksekutif Manager",
    message: "Lengkapi profil tim e-sports Anda untuk mulai memantau talenta dan membuka bursa rekrutmen trial.",
    timestamp: "Baru saja",
    read: false,
    actionUrl: "/manager/team-profile",
    actionLabel: "Kelola Tim",
  },
];

// Data Default Tim E-Sports Terdaftar: HANYA TIM YANG DIDAFTARKAN AKUN
const DEFAULT_REGISTERED_TEAMS = [];

const DEFAULT_MANAGER_TEAM = {
  id: "manager-apex-esports",
  name: "Apex Predator Esports",
  division: "PUBG Mobile Competitive",
  tag: "APX",
  city: "Bandung, Jawa Barat",
  established: "2024",
  logoText: "APX",
  logoUrl: null,
  badgeColor: "from-red-600 to-zinc-900",
  activeRosterCount: 3,
  maxRosterCount: 5,
  vision: "Membangun skuad PUBG Mobile tier 1 baru dengan memanfaatkan analisis talenta objektif machine learning.",
  mission: "Merekrut 2 talenta potensial berperingkat tinggi, memfasilitasi gaming house modern, dan bersaing di PMGC Qualifier.",
  openRecruitment: true,
  recruitmentRole: "Rusher / Fragger",
  neededRoles: ["Rusher / Fragger", "Support / IGL"],
  recruitmentMinScore: 76.0,
  trialNotes: "Terbuka bagi talenta agresif dengan skor ML minimal 76.0, siap menjalani bootcamp di Bandung, dan punya komitmen turnamen tinggi.",
  contactManager: "Manager Scouting Apex",
  contactPhone: "0812-7788-9900",
  contactEmail: "recruitment@apexpredator.id",
  instagram: "@apexpredator_esports",
  isManagerCreated: true,
};

// Talenta Aktif Terdaftar: Murni Mulai dari 0 (Hanya atlet nyata yang mendaftar & input statistik)
export const DEFAULT_VERIFIED_TALENTS = [];

// Profil Default Demo Ryzen (Hanya untuk Akun Demo Bawaan)
const DEFAULT_RYZEN_PROFILE = {
  ign: "BTR_Ryzen",
  real_name: "Muhammad Albi",
  gameId: "5123984729",
  role: "Rusher / Fragger",
  bio: "Rusher agresif PUBG Mobile dengan spesialisasi close-combat M416. Berorientasi pada rotasi cepat zona akhir dan siap uji tanding (scrim / trial) turnamen.",
  recruitment_status: "Open to Trial / Free Agent",
  team_name: "Free Agent",
  age: "21",
  origin_city: "Jakarta, Indonesia",
  device: "iPhone 13 Pro Max",
  instagram: "@btr_ryzen",
  discord: "ryzen#5512",
  whatsapp: "0812-3456-7890",
  isProfileCompleted: true,
};

// Riwayat Skor Demo Bawaan (Hanya untuk Akun Demo)
const DEFAULT_DEMO_HISTORY = [
  {
    id: "hist-1",
    date: "2026-10-10",
    tier: "Platinum",
    map: "Sanhok",
    favorite_weapon: "AKM",
    kills: 3,
    damage_dealt: 380.5,
    survival_time_minutes: 16.2,
    headshot_percentage: 22.0,
    assists: 1,
    revives: 1,
    distance_travelled_km: 3.2,
    longest_kill_meters: 95.0,
    heals_used: 3,
    boosts_used: 2,
    match_rank: 18,
    player_score: 42.15,
    score_category: "Menengah",
  },
  {
    id: "hist-2",
    date: "2026-10-12",
    tier: "Platinum",
    map: "Miramar",
    favorite_weapon: "M416",
    kills: 5,
    damage_dealt: 510.0,
    survival_time_minutes: 21.4,
    headshot_percentage: 28.5,
    assists: 2,
    revives: 1,
    distance_travelled_km: 4.8,
    longest_kill_meters: 145.0,
    heals_used: 4,
    boosts_used: 4,
    match_rank: 8,
    player_score: 51.40,
    score_category: "Menengah",
  },
  {
    id: "hist-3",
    date: "2026-10-15",
    tier: "Diamond",
    map: "Erangel",
    favorite_weapon: "M416",
    kills: 7,
    damage_dealt: 720.0,
    survival_time_minutes: 27.8,
    headshot_percentage: 36.0,
    assists: 3,
    revives: 2,
    distance_travelled_km: 6.2,
    longest_kill_meters: 210.0,
    heals_used: 5,
    boosts_used: 6,
    match_rank: 3,
    player_score: 64.80,
    score_category: "Tinggi",
  },
];

export const PlayerStoreProvider = ({ children }) => {
  const { user, role } = useAuth();
  const isManager = String(role || user?.user_metadata?.role || "").toLowerCase().trim() === "manager";

  // Helper mendapatkan key penyimpanan terisolasi per akun
  const getUserKey = (authUser) => {
    if (!authUser) return "guest";
    const email = (authUser.email || "").toLowerCase().trim();
    return authUser.id || email.replace(/[^a-zA-Z0-9]/g, "_");
  };

  const currentUserKey = getUserKey(user);
  const currentEmail = (user?.email || "").toLowerCase().trim();
  const isDemoPlayer = currentEmail === "player@esports-talent.id";
  const isDemoManager = currentEmail === "manager@esports-talent.id";

  // 0. Custom Avatar / Foto Profil Pemain (Murni Terisolasi per Akun Pengguna)
  const [playerAvatar, setPlayerAvatar] = useState(() => {
    try {
      if (currentUserKey && currentUserKey !== "guest") {
        return localStorage.getItem(`pulse_scout_avatar_${currentUserKey}`) || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const updatePlayerAvatar = (avatarDataUrl) => {
    setPlayerAvatar(avatarDataUrl);
    try {
      if (currentUserKey && currentUserKey !== "guest") {
        if (avatarDataUrl) {
          localStorage.setItem(`pulse_scout_avatar_${currentUserKey}`, avatarDataUrl);
        } else {
          localStorage.removeItem(`pulse_scout_avatar_${currentUserKey}`);
        }
      }
    } catch (e) {
      console.warn("Gagal menyimpan avatar:", e);
    }

    // Simpan foto avatar ke kolom avatar_url di tabel profiles Supabase
    if (isSupabaseConfigured && supabase && user?.id) {
      supabase
        .from("profiles")
        .update({
          avatar_url: avatarDataUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) console.warn("Supabase avatar update warning:", error);
        });
    }
  };

  // 0b. Profil Atlet Pemain (Terisolasi per Akun)
  const [playerProfile, setPlayerProfile] = useState(() => {
    if (isDemoPlayer) return DEFAULT_RYZEN_PROFILE;
    try {
      const saved = localStorage.getItem(`pulse_scout_profile_${currentUserKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}

    if (!user) return DEFAULT_RYZEN_PROFILE;

    return {
      ign: user.user_metadata?.full_name || "",
      real_name: user.user_metadata?.full_name || "",
      gameId: "",
      role: "",
      bio: "",
      recruitment_status: "Open to Trial / Free Agent",
      team_name: "Free Agent",
      age: "",
      origin_city: "",
      device: "",
      instagram: "",
      discord: "",
      whatsapp: "",
      isProfileCompleted: false,
    };
  });

  const updatePlayerProfile = (newProfile) => {
    setPlayerProfile((prev) => {
      const updated = { ...prev, ...newProfile, isProfileCompleted: true };
      try {
        localStorage.setItem(`pulse_scout_profile_${currentUserKey}`, JSON.stringify(updated));
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Gagal menyimpan profil:", e);
      }
      return updated;
    });

    // Simpan ke Supabase profiles jika terhubung
    if (isSupabaseConfigured && supabase && user?.id) {
      supabase
        .from("profiles")
        .update({
          ign: newProfile.ign || "",
          full_name: newProfile.real_name || newProfile.ign || "",
          game_id: newProfile.gameId || "",
          role_preference: newProfile.role || "Rusher / Fragger",
          bio: newProfile.bio || "",
          recruitment_status: newProfile.recruitment_status || "Open to Trial / Free Agent",
          team_name: newProfile.team_name || "Free Agent",
          age: parseInt(newProfile.age) || null,
          origin_city: newProfile.origin_city || "",
          device: newProfile.device || "",
          instagram: newProfile.instagram || "",
          discord: newProfile.discord || "",
          whatsapp: newProfile.whatsapp || "",
          is_profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) console.warn("Supabase update profiles warning:", error);
        });
    }

    // Sinkronkan nama IGN hanya pada data milik akun sendiri
    if (user?.id && (newProfile.ign || newProfile.role)) {
      const targetIgn = (newProfile.ign || playerProfile?.ign || "").trim();
      const targetRole = newProfile.role || playerProfile?.role || "Rusher / Fragger";

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.profile_id === user.id || p.user_id === user.id) {
            return {
              ...p,
              ...(newProfile.ign ? { IGN: targetIgn } : {}),
              ...(newProfile.role ? { Role: targetRole, role: targetRole } : {}),
            };
          }
          return p;
        })
      );
    }
  };

  // 4. Riwayat Skor Pemain (Player Score History - Terisolasi per Akun)
  const [playerHistory, setPlayerHistory] = useState(() => {
    if (isDemoPlayer) return DEFAULT_DEMO_HISTORY;
    try {
      const saved = localStorage.getItem(`pulse_scout_history_${currentUserKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    if (!user) return DEFAULT_DEMO_HISTORY;
    return []; // Akun baru mulai dari riwayat KOSONG!
  });

  // 5. Profil Tim Manager (Terisolasi per Akun)
  const [managerTeam, setManagerTeam] = useState(() => {
    if (isDemoManager) return { ...DEFAULT_MANAGER_TEAM, isProfileCompleted: true };
    try {
      const saved = localStorage.getItem(`pulse_scout_team_${currentUserKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}

    if (!user) return DEFAULT_MANAGER_TEAM;

    return {
      id: `team-${currentUserKey}`,
      name: user.user_metadata?.full_name ? `Tim ${user.user_metadata.full_name}` : "",
      division: "PUBG Mobile Competitive",
      tag: "",
      city: "",
      established: new Date().getFullYear().toString(),
      logoText: "",
      logoUrl: null,
      badgeColor: "from-blue-600 to-zinc-900",
      activeRosterCount: 0,
      maxRosterCount: 5,
      vision: "",
      mission: "",
      openRecruitment: true,
      recruitmentRole: "All Roles",
      neededRoles: [],
      recruitmentMinScore: 75.0,
      trialNotes: "",
      contactManager: user.user_metadata?.full_name || "",
      contactPhone: "",
      contactEmail: user.email || "",
      instagram: "",
      isProfileCompleted: false,
    };
  });

  // Efek sinkronisasi data saat user login / berganti akun
  useEffect(() => {
    const key = getUserKey(user);
    const email = (user?.email || "").toLowerCase().trim();

    // 0. Avatar Player (Sinkronkan langsung saat user login atau berganti akun)
    if (email === "player@esports-talent.id") {
      setPlayerAvatar(null);
    } else if (user) {
      try {
        const savedAvatar = localStorage.getItem(`pulse_scout_avatar_${key}`);
        setPlayerAvatar(savedAvatar || null);
      } catch {
        setPlayerAvatar(null);
      }
    } else {
      setPlayerAvatar(null);
    }

    // 1. Profil Player
    if (email === "player@esports-talent.id") {
      setPlayerProfile(DEFAULT_RYZEN_PROFILE);
    } else if (user) {
      try {
        const saved = localStorage.getItem(`pulse_scout_profile_${key}`);
        if (saved) {
          setPlayerProfile(JSON.parse(saved));
        } else {
          setPlayerProfile({
            ign: user.user_metadata?.full_name || "",
            real_name: user.user_metadata?.full_name || "",
            gameId: "",
            role: "",
            bio: "",
            recruitment_status: "Open to Trial / Free Agent",
            team_name: "Free Agent",
            age: "",
            origin_city: "",
            device: "",
            instagram: "",
            discord: "",
            whatsapp: "",
            isProfileCompleted: false,
          });
        }
      } catch {}
    }

    // 2. Riwayat Skor
    if (email === "player@esports-talent.id") {
      setPlayerHistory(DEFAULT_DEMO_HISTORY);
    } else if (user) {
      try {
        let historyData = [];
        const saved = localStorage.getItem(`pulse_scout_history_${key}`);
        if (saved) {
          historyData = JSON.parse(saved);
        } else {
          const globalSaved = localStorage.getItem(USER_HISTORY_STORAGE_KEY);
          if (globalSaved) {
            const parsedGlobal = JSON.parse(globalSaved);
            if (Array.isArray(parsedGlobal) && parsedGlobal.length > 0) {
              historyData = parsedGlobal;
            }
          }
        }
        setPlayerHistory(Array.isArray(historyData) ? historyData : []);
      } catch {
        setPlayerHistory([]);
      }
    }

    // 3. Tim Manager
    if (email === "manager@esports-talent.id") {
      setManagerTeam({ ...DEFAULT_MANAGER_TEAM, isProfileCompleted: true });
    } else if (user) {
      try {
        const saved = localStorage.getItem(`pulse_scout_team_${key}`);
        if (saved) {
          setManagerTeam(JSON.parse(saved));
        } else {
          setManagerTeam({
            id: `team-${key}`,
            name: user.user_metadata?.full_name ? `Tim ${user.user_metadata.full_name}` : "",
            division: "PUBG Mobile Competitive",
            tag: "",
            city: "",
            established: new Date().getFullYear().toString(),
            logoText: "",
            logoUrl: null,
            badgeColor: "from-blue-600 to-zinc-900",
            activeRosterCount: 0,
            maxRosterCount: 5,
            vision: "",
            mission: "",
            openRecruitment: true,
            recruitmentRole: "All Roles",
            neededRoles: [],
            recruitmentMinScore: 75.0,
            trialNotes: "",
            contactManager: user.user_metadata?.full_name || "",
            contactPhone: "",
            contactEmail: user.email || "",
            instagram: "",
            isProfileCompleted: false,
          });
        }
      } catch {}
    }
  }, [user]);
  // 1. Data Pemain (Talenta Terdaftar + 2.500 data Kaggle)
  const [players, setPlayers] = useState(() => {
    try {
      const custom = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
      const parsedCustom = custom && custom !== "null" && custom !== "undefined" ? JSON.parse(custom) : [];
      if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
        // Deduplikasi per sesi pertandingan unik (menghindari duplikasi kembar tanpa menimbun match berbeda)
        const seen = new Set();
        const uniqueCustom = [];
        for (const item of parsedCustom) {
          const k = String(
            item.id ||
            item.Player_ID ||
            `${item.user_id}_${item.Kills}_${item.Damage_Dealt}_${item.Player_Score}_${item.Match_Rank}_${item.Map}`
          );
          if (k && !seen.has(k)) {
            seen.add(k);
            uniqueCustom.push(item);
          }
        }
        return [...uniqueCustom, ...initialPlayersData];
      }
    } catch {}
    return [...DEFAULT_VERIFIED_TALENTS, ...initialPlayersData];
  });

  // 2. Shortlist Manager
  const [shortlist, setShortlist] = useState(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      const parsed = saved && saved !== "null" && saved !== "undefined" ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // 3. Kandidat Komparasi (Maksimal 3 pemain)
  const [comparedPlayers, setComparedPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPARED_STORAGE_KEY);
      const parsed = saved && saved !== "null" && saved !== "undefined" ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Tim E-Sports Terdaftar: Dimuat dari Cache & Disinkronkan dengan Supabase Cloud
  const [registeredTeams, setRegisteredTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_TEAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (t) =>
              t.id &&
              !["btr-red-aliens", "rrq-ryu", "alter-ego-limax", "boom-esports", "dewa-united"].includes(t.id) &&
              !t.isVerifiedPro
          );
        }
      }
    } catch {}
    return [];
  });

  // Fungsi sinkronisasi seluruh tim terdaftar dari Supabase Cloud
  const fetchRegisteredTeams = async () => {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        const cloudTeams = data.map((t) => ({
          id: t.id,
          manager_id: t.manager_id,
          name: t.name,
          division: t.division || "PUBG Mobile Competitive",
          tag: t.tag || "",
          city: t.city || "",
          established: String(t.established || "2026"),
          logoUrl: t.logo_url || null,
          logoText: t.tag || t.name?.slice(0, 3).toUpperCase() || "MGR",
          activeRosterCount: t.active_roster_count ?? 0,
          maxRosterCount: t.max_roster_count || 5,
          vision: t.vision || "",
          mission: t.mission || "",
          openRecruitment: t.open_recruitment ?? true,
          recruitmentRole: t.recruitment_role || "All Roles",
          neededRoles: Array.isArray(t.needed_roles) ? t.needed_roles : [],
          recruitmentMinScore: parseFloat(t.recruitment_min_score) || 75.0,
          trialNotes: t.trial_notes || "",
          contactManager: t.contact_manager || "",
          contactPhone: t.contact_phone || "",
          contactEmail: t.contact_email || "",
          instagram: t.instagram || "",
          isManagerCreated: true,
          isProfileCompleted: true,
        }));

        setRegisteredTeams(cloudTeams);
        try {
          localStorage.setItem(REGISTERED_TEAMS_STORAGE_KEY, JSON.stringify(cloudTeams));
        } catch {}
        return cloudTeams;
      }
    } catch (e) {
      console.warn("fetchRegisteredTeams error:", e);
    }
    return [];
  };

  const [playerWishlistTeams, setPlayerWishlistTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_TEAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const userWishlist = parsed.filter(
            (id) => !["btr-red-aliens", "alter-ego-limax", "rrq-ryu", "boom-esports", "dewa-united"].includes(id)
          );
          localStorage.setItem(WISHLIST_TEAMS_STORAGE_KEY, JSON.stringify(userWishlist));
          return userWishlist;
        }
      }
    } catch {}
    return [];
  });

  const updateManagerTeam = async (newTeamData) => {
    const updated = {
      ...managerTeam,
      ...newTeamData,
      isProfileCompleted: true,
      isManagerCreated: true,
    };
    setManagerTeam(updated);

    try {
      localStorage.setItem(`pulse_scout_team_${currentUserKey}`, JSON.stringify(updated));
      localStorage.setItem(MANAGER_TEAM_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Gagal menyimpan tim manager:", e);
    }

    // Perbarui entri tim di daftar tim publik secara instan di sisi lokal
    if (updated.name && updated.name.trim()) {
      setRegisteredTeams((prev) => {
        const filtered = prev.filter(
          (t) => t.id !== updated.id && !(user?.id && t.manager_id === user.id)
        );
        const nextTeams = [updated, ...filtered].filter(
          (t) =>
            t.id &&
            !["btr-red-aliens", "rrq-ryu", "alter-ego-limax", "boom-esports", "dewa-united"].includes(t.id) &&
            !t.isVerifiedPro
        );
        try {
          localStorage.setItem(REGISTERED_TEAMS_STORAGE_KEY, JSON.stringify(nextTeams));
        } catch (e) {
          console.warn("Gagal menyimpan daftar tim:", e);
        }
        return nextTeams;
      });
    }

    // Simpan ke Supabase teams (Sinkronisasi Cloud Multirole Real-time)
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const teamPayload = {
          manager_id: user.id,
          name: updated.name.trim(),
          tag: (updated.tag || updated.name.slice(0, 3) || "BB").trim().toUpperCase(),
          division: updated.division || "PUBG Mobile Competitive",
          city: updated.city || "",
          established: String(updated.established || "2026"),
          logo_url: updated.logoUrl || null,
          active_roster_count: Math.max(0, parseInt(updated.activeRosterCount) || 0),
          max_roster_count: Math.max(1, parseInt(updated.maxRosterCount) || 5),
          vision: updated.vision || "",
          mission: updated.mission || "",
          open_recruitment: updated.openRecruitment ?? true,
          recruitment_role: updated.recruitmentRole || "All Roles",
          needed_roles: Array.isArray(updated.neededRoles) ? updated.neededRoles : [],
          recruitment_min_score: parseFloat(updated.recruitmentMinScore) || 75.0,
          trial_notes: updated.trialNotes || "",
          contact_manager: updated.contactManager || "",
          contact_phone: updated.contactPhone || "",
          contact_email: updated.contactEmail || user.email || "",
          instagram: updated.instagram || "",
          is_profile_completed: true,
          updated_at: new Date().toISOString(),
        };

        // Cek apakah manager ini sudah memiliki profil tim di Supabase
        const { data: existingTeam } = await supabase
          .from("teams")
          .select("id")
          .eq("manager_id", user.id)
          .maybeSingle();

        let finalSavedTeam = null;

        if (existingTeam?.id) {
          const { data, error } = await supabase
            .from("teams")
            .update(teamPayload)
            .eq("id", existingTeam.id)
            .select()
            .single();

          if (error) {
            console.error("Gagal memperbarui profil tim di Supabase:", error);
          } else {
            finalSavedTeam = data;
          }
        } else {
          const { data, error } = await supabase
            .from("teams")
            .insert({ ...teamPayload, created_at: new Date().toISOString() })
            .select()
            .single();

          if (error) {
            console.error("Gagal membuat profil tim baru di Supabase:", error);
          } else {
            finalSavedTeam = data;
          }
        }

        if (finalSavedTeam) {
          const syncedTeam = {
            ...updated,
            id: finalSavedTeam.id,
            manager_id: user.id,
            tag: finalSavedTeam.tag,
            established: finalSavedTeam.established,
            logoUrl: finalSavedTeam.logo_url,
          };
          setManagerTeam(syncedTeam);
          try {
            localStorage.setItem(`pulse_scout_team_${currentUserKey}`, JSON.stringify(syncedTeam));
            localStorage.setItem(MANAGER_TEAM_STORAGE_KEY, JSON.stringify(syncedTeam));
          } catch {}

          // Refresh seluruh daftar tim dari cloud
          await fetchRegisteredTeams();
        }
      } catch (err) {
        console.error("Terjadi error saat sinkronisasi tim ke Supabase:", err);
      }
    }

    return { success: true };
  };

  const toggleWishlistTeam = (teamId) => {
    setPlayerWishlistTeams((prev) => {
      let next;
      const isAdding = !prev.includes(teamId);
      if (prev.includes(teamId)) {
        next = prev.filter((id) => id !== teamId);
      } else {
        next = [...prev, teamId];
      }
      try {
        localStorage.setItem(WISHLIST_TEAMS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Gagal menyimpan wishlist tim:", e);
      }

      // Jika atlet mem-bookmark tim manajer, kirim notifikasi ke sisi manajer!
      if (isAdding && teamId === managerTeam?.id) {
        const mgrNotif = {
          id: `mgr-notif-${Date.now()}`,
          type: "wishlist_alert",
          senderName: "Sistem Rekrutmen",
          teamName: managerTeam?.name || "Apex Predator Esports",
          teamTag: managerTeam?.tag || "APX",
          title: "Tim Ditandai ke Wishlist Atlet",
          message: `Atlet ${playerProfile?.ign || "BTR_Ryzen"} baru saja menambahkan tim ${managerTeam?.name} ke dalam Dream Team Wishlist!`,
          timestamp: "Baru saja",
          read: false,
          actionUrl: "/manager/team-profile",
          actionLabel: "Lihat Profil Tim",
        };
        setManagerNotifications((mPrev) => {
          const mUpdated = [mgrNotif, ...mPrev];
          try {
            localStorage.setItem(MANAGER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mUpdated));
          } catch {}
          return mUpdated;
        });
      }

      return next;
    });
  };

  const isTeamWishlisted = (teamId) => playerWishlistTeams.includes(teamId);

  // 6. Sistem Notifikasi Rekrutmen Terpisah (Role Player vs Manager)
  const [playerNotifications, setPlayerNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validPlayerOnly = parsed.filter(
            (n) => !n.id?.startsWith("mgr-") && n.type !== "wishlist_alert" && n.type !== "candidate_match"
          );
          if (validPlayerOnly.length > 0) return validPlayerOnly;
        }
      }
    } catch {}
    return DEFAULT_NOTIFICATIONS;
  });

  const [managerNotifications, setManagerNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(MANAGER_NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validManagerOnly = parsed.filter(
            (n) =>
              n.id?.startsWith("mgr-") ||
              ["candidate_match", "wishlist_alert", "shortlist_confirm"].includes(n.type)
          );
          if (validManagerOnly.length > 0) return validManagerOnly;
        }
      }
    } catch {}
    return DEFAULT_MANAGER_NOTIFICATIONS;
  });

  // Notifikasi dinamis sesuai peran (role) pengguna aktif saat ini
  const notifications = isManager ? managerNotifications : playerNotifications;

  const markAllNotificationsAsRead = () => {
    if (isManager) {
      setManagerNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        try {
          localStorage.setItem(MANAGER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setPlayerNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const markNotificationAsRead = (id) => {
    if (isManager) {
      setManagerNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        try {
          localStorage.setItem(MANAGER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setPlayerNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const removeNotification = (id) => {
    if (isManager) {
      setManagerNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(MANAGER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setPlayerNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Simpan shortlist ke localStorage
  useEffect(() => {
    localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlist));
  }, [shortlist]);

  // Simpan history ke localStorage
  useEffect(() => {
    localStorage.setItem(USER_HISTORY_STORAGE_KEY, JSON.stringify(playerHistory));
    if (currentUserKey && currentUserKey !== "guest") {
      localStorage.setItem(`pulse_scout_history_${currentUserKey}`, JSON.stringify(playerHistory));
    }
  }, [playerHistory, currentUserKey]);

  // Simpan comparedPlayers ke localStorage jika role adalah manager
  useEffect(() => {
    if (isManager) {
      localStorage.setItem(COMPARED_STORAGE_KEY, JSON.stringify(comparedPlayers));
    }
  }, [comparedPlayers, isManager]);

  // Reset daftar komparasi jika role bukan manager atau pengguna berganti akun
  useEffect(() => {
    if (!isManager) {
      setComparedPlayers([]);
      try {
        localStorage.removeItem(COMPARED_STORAGE_KEY);
      } catch {}
    }
  }, [user?.id, isManager]);

  // Sinkronisasi IGN pemain jika profil diubah (hanya pada kartu milik akun sendiri)
  useEffect(() => {
    if (!playerProfile?.ign || !user?.id) return;
    const currentIgn = playerProfile.ign.trim();

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.profile_id === user.id || p.user_id === user.id) {
          return { ...p, IGN: currentIgn, is_current_user: true };
        }
        return p;
      })
    );
  }, [playerProfile?.ign, user?.id]);

  // Sinkronisasi data profil & tim dengan Supabase Cloud saat user login
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;

    // 1. Ambil data profil dari Supabase
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data && !error) {
          setPlayerAvatar(data.avatar_url || null);
          setPlayerProfile((prev) => ({
            ...prev,
            ign: data.ign || prev.ign,
            real_name: data.full_name || prev.real_name,
            gameId: data.game_id || prev.gameId,
            role: data.role_preference || prev.role,
            bio: data.bio || prev.bio,
            recruitment_status: data.recruitment_status || prev.recruitment_status,
            team_name: data.team_name || prev.team_name,
            age: data.age ? String(data.age) : prev.age,
            origin_city: data.origin_city || prev.origin_city,
            device: data.device || prev.device,
            instagram: data.instagram || prev.instagram,
            discord: data.discord || prev.discord,
            whatsapp: data.whatsapp || prev.whatsapp,
            isProfileCompleted: data.is_profile_completed ?? prev.isProfileCompleted,
          }));
        }
      });

    // 2. Jika role adalah manager, ambil tim yang dikelola
    if (isManager) {
      supabase
        .from("teams")
        .select("*")
        .eq("manager_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data && !error) {
            setManagerTeam({
              id: data.id,
              manager_id: data.manager_id,
              name: data.name,
              division: data.division || "PUBG Mobile Competitive",
              tag: data.tag || "",
              city: data.city || "",
              established: String(data.established || "2026"),
              logoUrl: data.logo_url || null,
              logoText: data.tag || data.name?.slice(0, 3).toUpperCase() || "MGR",
              badgeColor: "from-zinc-800 to-zinc-950",
              activeRosterCount: data.active_roster_count ?? 0,
              maxRosterCount: data.max_roster_count || 5,
              vision: data.vision || "",
              mission: data.mission || "",
              openRecruitment: data.open_recruitment ?? true,
              recruitmentRole: data.recruitment_role || "All Roles",
              neededRoles: Array.isArray(data.needed_roles) ? data.needed_roles : [],
              recruitmentMinScore: parseFloat(data.recruitment_min_score) || 75.0,
              trialNotes: data.trial_notes || "",
              contactManager: data.contact_manager || "",
              contactPhone: data.contact_phone || "",
              contactEmail: data.contact_email || "",
              instagram: data.instagram || "",
              isManagerCreated: true,
              isProfileCompleted: true,
            });
          }
        });
    }

    // 3. Ambil seluruh tim terdaftar dari Supabase untuk direktori publik
    fetchRegisteredTeams();

    // 4. Ambil dan sinkronkan data skor pertandingan atlet riil dari Supabase
    const syncCloudMatchData = async () => {
      try {
        const [{ data: matchRows, error: matchErr }, { data: profilesRows }] = await Promise.all([
          supabase.from("players").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("*"),
        ]);

        if (matchErr) {
          console.warn("Gagal mengambil data matches dari Supabase:", matchErr);
          return;
        }

        const profileMap = new Map((profilesRows || []).map((pr) => [pr.id, pr]));
        let allMatches = matchRows || [];

        // Helper cek apakah match disembunyikan oleh pemiliknya
        const isMatchHiddenByOwner = (userId, match) => {
          if (!userId) return false;
          try {
            const raw = localStorage.getItem(`pulse_scout_hidden_${userId}`);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                const fp1 = String(match.id);
                const fp2 = `${match.kills}_${match.damage_dealt}_${match.player_score}_${match.match_rank}`;
                return list.includes(fp1) || list.includes(fp2);
              }
            }
          } catch {}
          return false;
        };

        // 1. Bersihkan Duplikasi Berlebih di Supabase jika ada akibat bug klik berulang sebelumnya
        const seenCloudFingerprints = new Set();
        const duplicateIdsToDelete = [];
        const cleanedMatches = [];

        for (const m of allMatches) {
          if (m.user_id) {
            const fp = `${m.user_id}_${m.kills}_${m.damage_dealt}_${m.player_score}_${m.match_rank}`;
            if (seenCloudFingerprints.has(fp)) {
              duplicateIdsToDelete.push(m.id);
            } else {
              seenCloudFingerprints.add(fp);
              cleanedMatches.push(m);
            }
          } else {
            cleanedMatches.push(m);
          }
        }

        if (duplicateIdsToDelete.length > 0) {
          console.log("Membersihkan duplikat di Supabase:", duplicateIdsToDelete.length);
          supabase.from("players").delete().in("id", duplicateIdsToDelete).then(() => {});
          allMatches = cleanedMatches;
        }

        // 2. Sinkronkan riwayat match lokal atlet yang sedang login (dengan DEDUPLIKASI KETAT & PERSISTENSI PRIVASI)
        if (user?.id) {
          const userMatchesInCloud = allMatches.filter((m) => m.user_id === user.id);
          const localKey = getUserKey(user);

          // Auto-cleanup: jika user saat ini memiliki match di cloud yang sebelumnya disembunyikan (privat)
          // tapi gagal terhapus karena kendala policy sebelumnya, bersihkan dari Supabase sekarang
          for (const cm of userMatchesInCloud) {
            if (isMatchHiddenByOwner(user.id, cm)) {
              supabase.from("players").delete().eq("id", cm.id).then(() => {});
            }
          }

          let localSavedHistory = [];
          try {
            const rawHist =
              localStorage.getItem(`pulse_scout_history_${localKey}`) ||
              localStorage.getItem(USER_HISTORY_STORAGE_KEY);
            if (rawHist) {
              const parsed = JSON.parse(rawHist);
              if (Array.isArray(parsed)) localSavedHistory = parsed;
            }
          } catch {}

          // Deduplikasi localSavedHistory agar tidak pernah ada duplikat berulang
          const uniqueLocalHistory = [];
          const seenLocalFp = new Set();
          for (const item of localSavedHistory) {
            const fp = `${item.kills}_${item.damage_dealt}_${item.player_score}_${item.match_rank}`;
            if (!seenLocalFp.has(fp)) {
              seenLocalFp.add(fp);
              // Cek apakah match ini ditandai privat / hidden
              const isHidden = isMatchHiddenByOwner(user.id, item);

              // Cek apakah match ini ada di Supabase
              const matchInCloud = userMatchesInCloud.find(
                (cm) =>
                  String(cm.id) === String(item.supabase_id) ||
                  (Number(cm.kills) === Number(item.kills) &&
                    Number(cm.damage_dealt) === Number(item.damage_dealt) &&
                    Number(cm.player_score) === Number(item.player_score))
              );

              uniqueLocalHistory.push({
                ...item,
                is_published: isHidden ? false : Boolean(matchInCloud && item.is_published !== false),
                supabase_id: matchInCloud ? matchInCloud.id : item.supabase_id,
              });
            }
          }

          // Tambahkan match dari cloud jika ada di cloud tapi belum ada di riwayat lokal
          for (const cm of userMatchesInCloud) {
            const fp = `${cm.kills}_${cm.damage_dealt}_${cm.player_score}_${cm.match_rank}`;
            if (!seenLocalFp.has(fp)) {
              seenLocalFp.add(fp);
              const isHidden = isMatchHiddenByOwner(user.id, cm);
              uniqueLocalHistory.push({
                id: `USR-${String(cm.id).slice(0, 8).toUpperCase()}`,
                supabase_id: cm.id,
                date: cm.created_at ? new Date(cm.created_at).toLocaleDateString("id-ID") : "Match",
                tier: cm.tier,
                map: cm.map,
                favorite_weapon: cm.favorite_weapon,
                kills: cm.kills,
                damage_dealt: Number(cm.damage_dealt),
                survival_time_minutes: Number(cm.survival_time_minutes),
                headshot_percentage: Number(cm.headshot_percentage),
                assists: cm.assists,
                revives: cm.revives,
                distance_travelled_km: Number(cm.distance_travelled_km),
                longest_kill_meters: Number(cm.longest_kill_meters),
                heals_used: cm.heals_used,
                boosts_used: cm.boosts_used,
                match_rank: cm.match_rank,
                player_score: Number(cm.player_score),
                score_category: cm.score_category,
                match_screenshot_url: cm.match_screenshot_url || null,
                is_published: !isHidden,
              });
            }
          }

          setPlayerHistory(uniqueLocalHistory);
          try {
            localStorage.setItem(`pulse_scout_history_${localKey}`, JSON.stringify(uniqueLocalHistory));
          } catch {}
        }

        // 3. Leaderboard: Setiap Sesi Pertandingan Publik memiliki Kartu Sendiri
        // (Dideduplikasi secara ketat per sesi pertandingan agar tidak ada duplikasi kembar)
        const matchSessionsMap = new Map();
        for (const p of allMatches) {
          // Lewati jika match disembunyikan oleh pemiliknya
          if (p.user_id && isMatchHiddenByOwner(p.user_id, p)) {
            continue;
          }

          const prof = profileMap.get(p.user_id) || {};

          // JANGAN masukkan akun Manager ke Leaderboard Atlet
          if (prof.role === "manager") {
            continue;
          }

          // Kunci unik per sesi pertandingan (id supabase atau fingerprint statistik lengkap)
          const sessionKey = p.id
            ? String(p.id)
            : `${p.user_id}_${p.kills}_${p.damage_dealt}_${p.player_score}_${p.match_rank}_${p.map}`;

          if (!matchSessionsMap.has(sessionKey)) {
            matchSessionsMap.set(sessionKey, {
              id: p.id,
              profile_id: p.user_id,
              user_id: p.user_id,
              Player_ID: `USR-${String(p.id).slice(0, 8).toUpperCase()}`,
              IGN: prof.ign || p.ign,
              real_name: prof.full_name || prof.ign || p.ign,
              gameId: prof.game_id || "",
              avatar: prof.avatar_url || null,
              team_name: prof.team_name || "Free Agent",
              recruitment_status: prof.recruitment_status || "Open to Trial / Free Agent",
              origin_city: prof.origin_city || "",
              device: prof.device || "",
              instagram: prof.instagram || "",
              discord: prof.discord || "",
              whatsapp: prof.whatsapp || "",
              Role: prof.role_preference || p.role,
              role: prof.role_preference || p.role,
              Tier: p.tier,
              Map: p.map,
              Kills: p.kills,
              Damage_Dealt: Number(p.damage_dealt),
              Survival_Time_Minutes: Number(p.survival_time_minutes),
              Headshot_Percentage: Number(p.headshot_percentage),
              Assists: p.assists,
              Revives: p.revives,
              Distance_Travelled_km: Number(p.distance_travelled_km),
              Longest_Kill_meters: Number(p.longest_kill_meters),
              Heals_Used: p.heals_used,
              Boosts_Used: p.boosts_used,
              Match_Rank: p.match_rank,
              Favorite_Weapon: p.favorite_weapon,
              Player_Score: Number(p.player_score),
              Score_Category: p.score_category,
              match_screenshot_url: p.match_screenshot_url || null,
              created_at: p.created_at,
              is_current_user: user ? p.user_id === user.id : false,
              isRealTalent: true,
            });
          }
        }

        const cloudPlayers = Array.from(matchSessionsMap.values());
        try {
          localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(cloudPlayers));
        } catch {}
        setPlayers([...cloudPlayers, ...initialPlayersData]);
      } catch (err) {
        console.error("Error in syncCloudMatchData:", err);
      }
    };

    syncCloudMatchData();
  }, [user?.id, isManager]);

  // Sinkronisasi realtime daftar tim di seluruh jendela browser / multi-tab secara langsung
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    fetchRegisteredTeams();

    const channel = supabase
      .channel("realtime-teams-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          fetchRegisteredTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // --- Fungsi Aksi Pemain ---

  // Menambahkan hasil skor pemain baru dari form /player/input
  // shouldPublish: boolean (true = unggah ke leaderboard manajer, false = simpan privat di profil saja)
  const recordPlayerScore = (playerInputData, predictionResult, shouldPublish = false) => {
    const newId = "USR-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const activeIgn = playerProfile?.ign || playerInputData.ign || `Player_${newId}`;
    const activeRole = playerInputData.role || playerProfile?.role || "Rusher / Fragger";

    // 1. Catatan Riwayat Lengkap (Selalu tersimpan di profil atlet)
    const historyItem = {
      id: newId,
      date: new Date().toLocaleDateString("id-ID"),
      tier: playerInputData.tier || "Crown",
      map: playerInputData.map || "Erangel",
      favorite_weapon: playerInputData.favorite_weapon || "M416",
      kills: Math.max(0, Number(playerInputData.kills) || 0),
      damage_dealt: Math.max(0, Number(playerInputData.damage_dealt) || 0),
      survival_time_minutes: Math.max(0, Number(playerInputData.survival_time_minutes) || 0),
      headshot_percentage: Math.min(100, Math.max(0, Number(playerInputData.headshot_percentage) || 0)),
      assists: Math.max(0, Number(playerInputData.assists) || 0),
      revives: Math.max(0, Number(playerInputData.revives) || 0),
      distance_travelled_km: Math.max(0, Number(playerInputData.distance_travelled_km) || 0),
      longest_kill_meters: Math.max(0, Number(playerInputData.longest_kill_meters) || 0),
      heals_used: Math.max(0, Number(playerInputData.heals_used) || 0),
      boosts_used: Math.max(0, Number(playerInputData.boosts_used) || 0),
      match_rank: Math.min(100, Math.max(1, Number(playerInputData.match_rank) || 50)),
      player_score: Number(predictionResult.player_score),
      score_category: predictionResult.score_category,
      match_screenshot_url: playerInputData.match_screenshot_url || null,
      is_published: Boolean(shouldPublish),
      created_at: new Date().toISOString(),
    };

    setPlayerHistory((prev) => [historyItem, ...prev]);

    // 2. Jika pemain memilih untuk UNGGAH ke Leaderboard Publik
    if (shouldPublish) {
      const newRecord = {
        id: newId,
        profile_id: user?.id,
        user_id: user?.id,
        user_key: currentUserKey,
        Player_ID: newId,
        IGN: activeIgn,
        real_name: playerProfile?.real_name || activeIgn,
        Role: activeRole,
        role: activeRole,
        avatar: playerAvatar || null,
        Map: historyItem.map,
        Tier: historyItem.tier,
        Kills: historyItem.kills,
        Damage_Dealt: historyItem.damage_dealt,
        Survival_Time_Minutes: historyItem.survival_time_minutes,
        Headshot_Percentage: historyItem.headshot_percentage,
        Assists: historyItem.assists,
        Revives: historyItem.revives,
        Distance_Travelled_km: historyItem.distance_travelled_km,
        Longest_Kill_meters: historyItem.longest_kill_meters,
        Heals_Used: historyItem.heals_used,
        Boosts_Used: historyItem.boosts_used,
        Match_Rank: historyItem.match_rank,
        Favorite_Weapon: historyItem.favorite_weapon,
        Player_Score: historyItem.player_score,
        Score_Category: historyItem.score_category,
        match_screenshot_url: historyItem.match_screenshot_url,
        created_at: historyItem.created_at,
        is_current_user: true,
        isRealTalent: true,
      };

      setPlayers((prev) => [newRecord, ...prev]);

      // Simpan ke custom players storage
      try {
        const custom = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
        const parsedCustom = custom ? JSON.parse(custom) : [];
        localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify([newRecord, ...parsedCustom]));
      } catch (e) {
        console.warn("Gagal menyimpan custom player:", e);
      }

      // Simpan ke Supabase players jika terhubung
      if (isSupabaseConfigured && supabase && user?.id) {
        supabase
          .from("players")
          .insert({
            user_id: user.id,
            ign: activeIgn,
            role: activeRole,
            tier: historyItem.tier,
            map: historyItem.map,
            favorite_weapon: historyItem.favorite_weapon,
            kills: historyItem.kills,
            damage_dealt: historyItem.damage_dealt,
            survival_time_minutes: historyItem.survival_time_minutes,
            headshot_percentage: historyItem.headshot_percentage,
            assists: historyItem.assists,
            revives: historyItem.revives,
            distance_travelled_km: historyItem.distance_travelled_km,
            longest_kill_meters: historyItem.longest_kill_meters,
            heals_used: historyItem.heals_used,
            boosts_used: historyItem.boosts_used,
            match_rank: historyItem.match_rank,
            player_score: historyItem.player_score,
            score_category: historyItem.score_category,
            match_screenshot_url: historyItem.match_screenshot_url,
          })
          .select()
          .then(({ data, error }) => {
            if (!error && data && data[0]) {
              setPlayerHistory((prev) =>
                prev.map((h) => (h.id === newId ? { ...h, supabase_id: data[0].id } : h))
              );
            }
          });
      }
    }

    return historyItem;
  };

  // Mempublikasikan match dari riwayat privat ke Leaderboard publik
  const publishMatchToLeaderboard = async (matchId) => {
    const item = playerHistory.find((h) => h.id === matchId);
    if (!item) return { success: false, message: "Pertandingan tidak ditemukan." };

    const activeIgn = playerProfile?.ign || user?.user_metadata?.full_name || "Player";
    const activeRole = playerProfile?.role || "Rusher / Fragger";

    // 0. Hapus dari daftar match tersembunyi (hidden)
    if (user?.id) {
      try {
        const raw = localStorage.getItem(`pulse_scout_hidden_${user.id}`);
        const list = raw ? JSON.parse(raw) : [];
        const fp = `${item.kills}_${item.damage_dealt}_${item.player_score}_${item.match_rank}`;
        const updatedHidden = list.filter((id) => id !== matchId && id !== item.supabase_id && id !== fp);
        localStorage.setItem(`pulse_scout_hidden_${user.id}`, JSON.stringify(updatedHidden));
      } catch {}
    }

    // 1. Update status history menjadi terpublikasi
    setPlayerHistory((prev) =>
      prev.map((h) => (h.id === matchId ? { ...h, is_published: true } : h))
    );

    // 2. Tambahkan ke Leaderboard
    const newRecord = {
      id: item.id,
      profile_id: user?.id,
      user_id: user?.id,
      Player_ID: item.id,
      IGN: activeIgn,
      real_name: playerProfile?.real_name || activeIgn,
      Role: activeRole,
      role: activeRole,
      avatar: playerAvatar || null,
      Map: item.map,
      Tier: item.tier,
      Kills: item.kills,
      Damage_Dealt: item.damage_dealt,
      Survival_Time_Minutes: item.survival_time_minutes,
      Headshot_Percentage: item.headshot_percentage,
      Assists: item.assists,
      Revives: item.revives,
      Distance_Travelled_km: item.distance_travelled_km,
      Longest_Kill_meters: item.longest_kill_meters,
      Heals_Used: item.heals_used,
      Boosts_Used: item.boosts_used,
      Match_Rank: item.match_rank,
      Favorite_Weapon: item.favorite_weapon,
      Player_Score: item.player_score,
      Score_Category: item.score_category,
      match_screenshot_url: item.match_screenshot_url || null,
      created_at: item.created_at || new Date().toISOString(),
      is_current_user: true,
      isRealTalent: true,
    };

    setPlayers((prev) => [newRecord, ...prev.filter((p) => p.Player_ID !== matchId && p.id !== matchId)]);

    // 3. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase && user?.id) {
      const { data, error } = await supabase
        .from("players")
        .insert({
          user_id: user.id,
          ign: activeIgn,
          role: activeRole,
          tier: item.tier,
          map: item.map,
          favorite_weapon: item.favorite_weapon,
          kills: item.kills,
          damage_dealt: item.damage_dealt,
          survival_time_minutes: item.survival_time_minutes,
          headshot_percentage: item.headshot_percentage,
          assists: item.assists,
          revives: item.revives,
          distance_travelled_km: item.distance_travelled_km,
          longest_kill_meters: item.longest_kill_meters,
          heals_used: item.heals_used,
          boosts_used: item.boosts_used,
          match_rank: item.match_rank,
          player_score: item.player_score,
          score_category: item.score_category,
          match_screenshot_url: item.match_screenshot_url || null,
        })
        .select();

      if (!error && data && data[0]) {
        setPlayerHistory((prev) =>
          prev.map((h) => (h.id === matchId ? { ...h, supabase_id: data[0].id } : h))
        );
      }
    }

    return { success: true };
  };

  // Menarik kembali match dari Leaderboard (menjadikannya privat di profil saja)
  const unpublishMatchFromLeaderboard = async (matchId) => {
    const item = playerHistory.find((h) => h.id === matchId);
    if (!item) return { success: false };

    // 0. Tandai ke daftar match tersembunyi (agar persisten saat refresh / ganti akun)
    if (user?.id) {
      try {
        const raw = localStorage.getItem(`pulse_scout_hidden_${user.id}`);
        const list = raw ? JSON.parse(raw) : [];
        const fp = `${item.kills}_${item.damage_dealt}_${item.player_score}_${item.match_rank}`;
        const updatedHidden = Array.from(new Set([...list, matchId, item.supabase_id, fp].filter(Boolean)));
        localStorage.setItem(`pulse_scout_hidden_${user.id}`, JSON.stringify(updatedHidden));
      } catch {}
    }

    // 1. Update status history menjadi privat
    setPlayerHistory((prev) =>
      prev.map((h) => (h.id === matchId ? { ...h, is_published: false } : h))
    );

    // 2. Hapus dari state players (Leaderboard)
    setPlayers((prev) =>
      prev.filter(
        (p) =>
          p.Player_ID !== matchId &&
          p.id !== matchId &&
          (!item.supabase_id || p.id !== item.supabase_id)
      )
    );

    try {
      const custom = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (p) =>
              p.Player_ID !== matchId &&
              p.id !== matchId &&
              (!item.supabase_id || p.id !== item.supabase_id)
          );
          localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch {}

    // 3. Hapus dari Supabase jika ada
    if (isSupabaseConfigured && supabase && user?.id) {
      if (item.supabase_id) {
        await supabase.from("players").delete().eq("id", item.supabase_id);
      }
      await supabase
        .from("players")
        .delete()
        .eq("user_id", user.id)
        .eq("player_score", item.player_score)
        .eq("kills", item.kills);
    }

    // Perbarui state leaderboard lokal seketika
    const localKey = getUserKey(user);
    try {
      const updated = playerHistory.map((h) => (h.id === matchId ? { ...h, is_published: false } : h));
      localStorage.setItem(`pulse_scout_history_${localKey}`, JSON.stringify(updated));
    } catch {}

    return { success: true };
  };

  // Menghapus match sepenuhnya dari riwayat dan Leaderboard
  const deleteMatchHistory = async (matchId) => {
    const item = playerHistory.find((h) => h.id === matchId);

    // 0. Hapus dari hidden list jika ada
    if (user?.id && item) {
      try {
        const raw = localStorage.getItem(`pulse_scout_hidden_${user.id}`);
        const list = raw ? JSON.parse(raw) : [];
        const fp = `${item.kills}_${item.damage_dealt}_${item.player_score}_${item.match_rank}`;
        const updatedHidden = list.filter((id) => id !== matchId && id !== item.supabase_id && id !== fp);
        localStorage.setItem(`pulse_scout_hidden_${user.id}`, JSON.stringify(updatedHidden));
      } catch {}
    }

    // 1. Hapus dari history
    setPlayerHistory((prev) => prev.filter((h) => h.id !== matchId));

    // 2. Hapus dari Leaderboard jika pernah di-publish
    setPlayers((prev) =>
      prev.filter(
        (p) =>
          p.Player_ID !== matchId &&
          p.id !== matchId &&
          (!item?.supabase_id || p.id !== item.supabase_id)
      )
    );

    try {
      const custom = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (p) =>
              p.Player_ID !== matchId &&
              p.id !== matchId &&
              (!item?.supabase_id || p.id !== item.supabase_id)
          );
          localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch {}

    // 3. Hapus dari Supabase jika terhubung
    if (isSupabaseConfigured && supabase && user?.id && item) {
      if (item.supabase_id) {
        await supabase.from("players").delete().eq("id", item.supabase_id);
      } else {
        await supabase
          .from("players")
          .delete()
          .eq("user_id", user.id)
          .eq("player_score", item.player_score);
      }
    }

    return { success: true };
  };

  // --- Fungsi Shortlist & Kirim Pesan Undangan ---
  const addToShortlist = (player, customMessage = "") => {
    if (!isManager) {
      return { success: false, message: "Fitur shortlist hanya tersedia untuk akun Manager." };
    }

    if (shortlist.some((item) => item.Player_ID === player.Player_ID)) {
      return { success: false, message: "Pemain sudah ada di dalam shortlist." };
    }

    const finalNotes = customMessage?.trim() || "Kandidat potensial hasil scouting.";

    const newItem = {
      ...player,
      notes: finalNotes,
      added_at: new Date().toLocaleDateString("id-ID"),
    };

    setShortlist((prev) => [newItem, ...prev]);

    // 1. Memicu Notifikasi Resmi ke Sisi Player (Pesan Pribadi dari Manajer)
    const playerNotifItem = {
      id: `notif-${Date.now()}`,
      type: "shortlist",
      senderName: `Coach / Manajer ${managerTeam?.name || "Apex Predator Esports"}`,
      teamName: managerTeam?.name || "Apex Predator Esports",
      teamTag: managerTeam?.tag || "APX",
      title: `Undangan Masuk Shortlist & Scrim: ${managerTeam?.name || "Apex Predator Esports"}`,
      message: customMessage?.trim() || `Manajer ${managerTeam?.name} baru saja menandai profil Anda (${player.IGN || player.Player_ID}) ke dalam daftar radar scouting & rekrutmen!`,
      timestamp: "Baru saja",
      read: false,
      actionUrl: "/teams",
      actionLabel: "Lihat Profil Tim & Hubungi",
    };
    setPlayerNotifications((prev) => {
      const updated = [playerNotifItem, ...prev];
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Memicu Notifikasi Konfirmasi untuk Sisi Manajer Sendiri
    const managerNotifItem = {
      id: `mgr-notif-${Date.now()}`,
      type: "shortlist_confirm",
      senderName: "Pulse Scout System",
      teamName: managerTeam?.name || "Apex Predator Esports",
      teamTag: managerTeam?.tag || "APX",
      title: "Kandidat Berhasil Masuk Shortlist",
      message: `Undangan scouting untuk ${player.IGN || player.Player_ID} berhasil dikirim dan tersimpan di Shortlist Roster.`,
      timestamp: "Baru saja",
      read: false,
      actionUrl: "/manager/shortlists",
      actionLabel: "Buka Shortlist",
    };
    setManagerNotifications((prev) => {
      const updated = [managerNotifItem, ...prev];
      try {
        localStorage.setItem(MANAGER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return { success: true, message: `${player.IGN || player.Player_ID} berhasil diundang dan masuk ke shortlist.` };
  };

  const removeFromShortlist = (playerId) => {
    setShortlist((prev) => prev.filter((item) => item.Player_ID !== playerId));
  };

  const updateShortlistNotes = (playerId, newNotes) => {
    setShortlist((prev) =>
      prev.map((item) => (item.Player_ID === playerId ? { ...item, notes: newNotes } : item))
    );
  };

  // Ekspor Shortlist ke file CSV (FR-08, BB-09)
  const exportShortlistToCSV = (filename = "PUBG_Talent_Scouting_Shortlist.csv") => {
    if (shortlist.length === 0) {
      alert("Shortlist masih kosong. Tambahkan pemain terlebih dahulu.");
      return;
    }

    const headers = [
      "Player_ID",
      "IGN",
      "Tier",
      "Player_Score",
      "Score_Category",
      "Kills",
      "Damage_Dealt",
      "Survival_Time_Minutes",
      "Match_Rank",
      "Favorite_Weapon",
      "Notes",
      "Added_At",
    ];

    const rows = shortlist.map((item) => [
      `"${item.Player_ID}"`,
      `"${item.IGN || item.Player_ID}"`,
      `"${item.Tier}"`,
      item.Player_Score,
      `"${item.Score_Category}"`,
      item.Kills,
      item.Damage_Dealt,
      item.Survival_Time_Minutes,
      item.Match_Rank,
      `"${item.Favorite_Weapon || '-'}"`,
      `"${(item.notes || "").replace(/"/g, '""')}"`,
      `"${item.added_at || '-'}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Fungsi Komparasi Pemain ---
  const addToCompare = (player) => {
    if (!isManager) {
      return { success: false, message: "Fitur komparasi hanya tersedia untuk akun Manager." };
    }
    if (comparedPlayers.some((p) => p.Player_ID === player.Player_ID)) {
      return { success: false, message: "Pemain sudah ada di daftar komparasi." };
    }
    if (comparedPlayers.length >= 3) {
      alert("Maksimal 3 pemain yang dapat dibandingkan sekaligus.");
      return { success: false, message: "Maksimal 3 pemain yang dapat dibandingkan sekaligus." };
    }
    setComparedPlayers((prev) => [...prev, player]);
    return { success: true, message: "Pemain berhasil ditambahkan ke komparasi." };
  };

  const removeFromCompare = (playerId) => {
    setComparedPlayers((prev) => prev.filter((p) => p.Player_ID !== playerId));
  };

  const clearCompare = () => {
    setComparedPlayers([]);
  };

  const value = {
    players,
    shortlist,
    comparedPlayers,
    playerHistory,
    playerAvatar,
    updatePlayerAvatar,
    playerProfile,
    updatePlayerProfile,
    recordPlayerScore,
    publishMatchToLeaderboard,
    unpublishMatchFromLeaderboard,
    deleteMatchHistory,
    addToShortlist,
    removeFromShortlist,
    updateShortlistNotes,
    exportShortlistToCSV,
    addToCompare,
    removeFromCompare,
    clearCompare,
    // Tim E-Sports & Bursa Roster
    managerTeam,
    registeredTeams,
    fetchRegisteredTeams,
    updateManagerTeam,
    playerWishlistTeams,
    toggleWishlistTeam,
    isTeamWishlisted,
    // Sistem Notifikasi Pesan Rekrutmen (Sisi Player)
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    removeNotification,
  };

  return <PlayerStoreContext.Provider value={value}>{children}</PlayerStoreContext.Provider>;
};

export const usePlayerStore = () => {
  const context = useContext(PlayerStoreContext);
  if (!context) {
    throw new Error("usePlayerStore harus digunakan di dalam PlayerStoreProvider");
  }
  return context;
};
