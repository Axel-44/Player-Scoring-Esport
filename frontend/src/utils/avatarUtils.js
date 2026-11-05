/**
 * frontend/src/utils/avatarUtils.js
 * Utilitas untuk menghasilkan dan memetakan avatar pemain e-sports yang unik dan beragam.
 * Memastikan setiap pemain dari 2.500 dataset memiliki foto/avatar yang berbeda dan konsisten,
 * serta memisahkan foto unggahan kustom pemain agar tidak menimpa pemain lain di halaman Manager.
 */

// Kumpulan 12 avatar e-sports unik (foto arena & ilustrasi jersey turnamen)
export const ESPORTS_AVATAR_POOL = [
  {
    id: 1,
    src: "/avatars/avatar_1.jpg",
    type: "photo",
    accent: "#3B82F6",
    team: "DRAGON ESPORTS",
  },
  {
    id: 2,
    src: "/avatars/avatar_2.jpg",
    type: "photo",
    accent: "#06B6D4",
    team: "CYBERNETICS",
  },
  {
    id: 3,
    src: "/avatars/avatar_3.jpg",
    type: "photo",
    accent: "#A855F7",
    team: "VISION ESPORTS",
  },
  {
    id: 4,
    src: "/avatars/avatar_4.svg",
    type: "svg",
    accent: "#EF4444",
    team: "NOVA ESPORTS",
  },
  {
    id: 5,
    src: "/avatars/avatar_5.svg",
    type: "svg",
    accent: "#F59E0B",
    team: "ALPHA PRO",
  },
  {
    id: 6,
    src: "/avatars/avatar_6.svg",
    type: "svg",
    accent: "#10B981",
    team: "TITAN SQUAD",
  },
  {
    id: 7,
    src: "/avatars/avatar_7.svg",
    type: "svg",
    accent: "#EC4899",
    team: "VALKYRIE",
  },
  {
    id: 8,
    src: "/avatars/avatar_8.svg",
    type: "svg",
    accent: "#6366F1",
    team: "PHANTOM CLAN",
  },
  {
    id: 9,
    src: "/avatars/avatar_9.svg",
    type: "svg",
    accent: "#14B8A6",
    team: "APEX HUNTERS",
  },
  {
    id: 10,
    src: "/avatars/avatar_10.svg",
    type: "svg",
    accent: "#E11D48",
    team: "INFERNO TEAM",
  },
  {
    id: 11,
    src: "/avatars/avatar_11.svg",
    type: "svg",
    accent: "#8B5CF6",
    team: "VORTEX GAMING",
  },
  {
    id: 12,
    src: "/avatars/avatar_12.svg",
    type: "svg",
    accent: "#F97316",
    team: "SOLARIS",
  },
];

/**
 * Hash string sederhana untuk menghasilkan indeks deterministik
 */
function hashString(str) {
  let hash = 0;
  if (!str || str.length === 0) return 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Mendapatkan inisial nama pemain (maksimal 2 huruf)
 */
export function getPlayerInitials(player) {
  if (!player) return "EP";
  const name = String(player.IGN || player.ign || player.real_name || player.Player_ID || "EP").trim();
  if (name.includes("_")) {
    const parts = name.split("_").filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  if (name.includes(" ")) {
    const parts = name.split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Menghasilkan avatar inisial e-sports bersih (SVG Data URL)
 * Menggantikan gambar generate AI agar tampilan profil pemain dari CSV tetap profesional dan rapi
 */
export function generateInitialsAvatar(initials) {
  const cleanInitials = (initials || "EP").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="esportsBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#27272a"/>
        <stop offset="100%" stop-color="#121215"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="20" fill="url(#esportsBg)" stroke="#3f3f46" stroke-width="2"/>
    <circle cx="60" cy="60" r="42" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="60" y="70" font-family="'Poppins', 'Rajdhani', sans-serif" font-size="38" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${cleanInitials}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Mendapatkan URL avatar untuk pemain tertentu.
 * - Jika pemain telah mengunggah foto asli (customAvatar atau player.avatar kustom), kembalikan foto kustom.
 * - Untuk pemain dari CSV dataset atau pemain yang belum unggah foto: KOSONGKAN GAMBAR GENERATE AI
 *   dan ganti dengan Avatar Inisial E-Sports Minimalis Bersih.
 */
export function getPlayerAvatar(player, currentUserId = null, customAvatar = null) {
  if (!player) return generateInitialsAvatar("EP");

  // 1. Jika customAvatar diberikan secara eksplisit untuk pemain ini
  if (customAvatar) return customAvatar;

  // 2. Jika player memiliki avatar sendiri yang valid (bukan gambar AI avatar_X)
  if (player.avatar && !String(player.avatar).includes("/avatars/avatar_")) {
    return player.avatar;
  }

  // 2b. Pemetaan otomatis foto resmi atlet pro terverifikasi
  const ignNormalized = String(player.IGN || player.ign || player.real_name || "").toLowerCase().trim();
  if (ignNormalized.includes("luxxy")) return "/players/luxxy.jpg";
  if (ignNormalized.includes("zuxxy")) return "/players/zuxxy.jpg";
  if (ignNormalized.includes("rosemary")) return "/players/rosemary.jpg";
  if (ignNormalized.includes("ryzen")) return "/player_card_hero.jpg";

  // 3. Jika player memiliki avatar kustom
  if (player.avatar && typeof player.avatar === "string" && player.avatar.trim()) {
    return player.avatar;
  }

  // 4. Untuk data pemain tanpa foto kustom:
  // Gunakan Avatar Inisial E-Sports Minimalis
  const initials = getPlayerInitials(player);
  return generateInitialsAvatar(initials);
}

/**
 * Mendapatkan Role E-Sports yang dinamis berdasarkan spesialisasi pilihan atau statistik pertandingan
 */
export function getPlayerRoleInfo(player) {
  // 1. Jika atlet telah memilih / memiliki Role spesialisasi eksplisit (Preferred Role)
  const explicitRole = player?.Role || player?.role || player?.preferred_role;
  if (explicitRole) {
    const r = String(explicitRole).toLowerCase();
    if (r.includes("rusher") || r.includes("fragger")) {
      return {
        title: "Rusher / Fragger",
        category: "Fraggers",
        tag: "⚡ ENTRY FRAGGER",
        color: "from-rose-500 to-amber-500",
        textColor: "text-rose-400",
        bgBadge: "bg-rose-950/60 border-rose-500/40 text-rose-300",
      };
    }
    if (r.includes("sniper") || r.includes("marksman")) {
      return {
        title: "Sniper / Marksman",
        category: "Snipers",
        tag: "🎯 SHARPSHOOTER",
        color: "from-zinc-700 to-zinc-900",
        textColor: "text-zinc-200",
        bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
      };
    }
    if (r.includes("zone") || r.includes("controller")) {
      return {
        title: "Zone Controller",
        category: "Zone Controllers",
        tag: "🛡️ ZONE ANCHOR",
        color: "from-zinc-700 to-zinc-900",
        textColor: "text-zinc-200",
        bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
      };
    }
    if (r.includes("support") || r.includes("igl")) {
      return {
        title: "Support / IGL",
        category: "Support / IGL",
        tag: "🧠 PLAYMAKER",
        color: "from-zinc-700 to-zinc-900",
        textColor: "text-zinc-200",
        bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
      };
    }
  }

  // 2. Jika tidak ada input role eksplisit (seperti 2.500 data awal Kaggle), diagnosis dari metrik match
  const kills = Number(player?.Kills ?? player?.kills ?? 0);
  const damage = Number(player?.Damage_Dealt ?? player?.damage_dealt ?? 0);
  const headshot = Number(player?.Headshot_Percentage ?? player?.headshot_percentage ?? 0);
  const survival = Number(player?.Survival_Time_Minutes ?? player?.survival_time_minutes ?? 0);
  const assists = Number(player?.Assists ?? player?.assists ?? 0);
  const revives = Number(player?.Revives ?? player?.revives ?? 0);
  const rank = Number(player?.Match_Rank ?? player?.match_rank ?? 50);

  if (kills >= 6 || damage >= 700) {
    return {
      title: "Rusher / Fragger",
      category: "Fraggers",
      tag: "⚡ ENTRY FRAGGER",
      color: "from-rose-500 to-amber-500",
      textColor: "text-rose-400",
      bgBadge: "bg-rose-950/60 border-rose-500/40 text-rose-300",
    };
  }
  if (headshot >= 30 || Number(player?.Longest_Kill_meters ?? player?.longest_kill_meters ?? 0) >= 150) {
    return {
      title: "Sniper / Marksman",
      category: "Snipers",
      tag: "🎯 SHARPSHOOTER",
      color: "from-zinc-700 to-zinc-900",
      textColor: "text-zinc-200",
      bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
    };
  }
  if (survival >= 24 && rank <= 8) {
    return {
      title: "Zone Controller",
      category: "Zone Controllers",
      tag: "🛡️ ZONE ANCHOR",
      color: "from-zinc-700 to-zinc-900",
      textColor: "text-zinc-200",
      bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
    };
  }
  if (assists >= 3 || revives >= 2) {
    return {
      title: "Support / IGL",
      category: "Support / IGL",
      tag: "🧠 PLAYMAKER",
      color: "from-zinc-700 to-zinc-900",
      textColor: "text-zinc-200",
      bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
    };
  }
  return {
    title: "Flex Operator",
    category: "Flex",
    tag: "🎮 VERSATILE",
    color: "from-zinc-700 to-zinc-900",
    textColor: "text-zinc-200",
    bgBadge: "bg-zinc-800 border-zinc-700 text-zinc-300",
  };
}

const PRO_ESPORTS_TEAMS = [
  "Bigetron Esports",
  "RRQ Ryu",
  "Alter Ego Limax",
  "BOOM Esports",
  "Dewa United",
  "VOIN Esports",
  "Genesis Dogma",
  "Talon Esports",
  "Morph GGG",
  "Kagendra",
];

function formatRecruitmentBadge(status, team) {
  const isFreeAgent =
    status.toLowerCase().includes("open to trial") ||
    status.toLowerCase().includes("free agent");
  const isOpenOffers = status.toLowerCase().includes("offers");
  const isContracted = status.toLowerCase().includes("contract");

  let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  let dotColor = "bg-emerald-500 animate-pulse";
  let shortLabel = "Free Agent";

  if (isContracted) {
    badgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    dotColor = "bg-blue-500";
    shortLabel = "Contracted";
  } else if (isOpenOffers) {
    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    dotColor = "bg-amber-500";
    shortLabel = "Open Offers";
  }

  return {
    status,
    team,
    isFreeAgent,
    isOpenOffers,
    isContracted,
    badgeColor,
    dotColor,
    shortLabel,
  };
}

/**
 * Mendapatkan Status Rekrutmen & Tim Organisasi untuk pemain tertentu:
 * - Mengambil profil aktif pengguna (dari localStorage) jika pemain adalah akun login.
 * - Mengambil properti eksplisit player jika ada.
 * - Memberikan distribusi deterministik yang realistis untuk 2.500 data pemain Kaggle:
 *   55% Free Agent, 25% Open to Offers, 20% Under Contract di tim pro resmi.
 */
export function getPlayerRecruitmentInfo(player) {
  if (!player) return formatRecruitmentBadge("Open to Trial / Free Agent", "Free Agent");

  // 1. Cek jika pemain adalah akun user login saat ini
  const isCurrentUser =
    player.isCurrentUser ||
    player.is_current_user ||
    (player.Player_ID && String(player.Player_ID).startsWith("USR-"));

  if (isCurrentUser && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("pulse_scout_player_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        const status = parsed.recruitment_status || "Open to Trial / Free Agent";
        const team = parsed.team_name || "Free Agent";
        return formatRecruitmentBadge(status, team);
      }
    } catch {}
  }

  // 2. Jika player memiliki data eksplisit
  if (player.recruitment_status || player.team_name) {
    const status = player.recruitment_status || "Open to Trial / Free Agent";
    const team = player.team_name || "Free Agent";
    return formatRecruitmentBadge(status, team);
  }

  // 3. Distribusi deterministik untuk data 2.500 Kaggle
  const key = String(player.Player_ID || player.IGN || player.id || "P1");
  const hash = hashString(key);
  const mod = hash % 100;

  if (mod < 55) {
    // 55% Free Agent / Open to Trial
    return formatRecruitmentBadge("Open to Trial / Free Agent", "Free Agent");
  } else if (mod < 80) {
    // 25% Open to Offers
    const hasSmallTeam = hash % 3 === 0;
    const team = hasSmallTeam ? "Academy Team" : "Free Agent";
    return formatRecruitmentBadge("Open to Offers", team);
  } else {
    // 20% Under Contract di tim pro e-sports resmi
    const teamIndex = (hash >> 3) % PRO_ESPORTS_TEAMS.length;
    return formatRecruitmentBadge("Under Contract", PRO_ESPORTS_TEAMS[teamIndex]);
  }
}
