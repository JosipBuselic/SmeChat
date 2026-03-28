// Gamification types. U Supabase idu samo: streak, points, sorted_items_count, updated_at.
// „Isti dan” za streak = lokalni kalendar datuma od updated_at + sorted_items_count.
// Broj po tipu otpada i bedževi su u UI stanju (sesija).

export interface WasteTypeStats {
  batteries: number;
  plastic: number;
  paper: number;
  glass: number;
  textile: number;
  bio: number;
}

export interface UserStats {
  totalItems: number;
  currentStreak: number;
  longestStreak: number;
  ecoScore: number;
  points: number;
  lastScanDate: string;
  /** Otključane partnerske nagrade (ID iz REWARD_INFO) */
  rewards: string[];
  wasteTypes: WasteTypeStats;
}

export const WASTE_TYPE_POINTS: Record<keyof WasteTypeStats, number> = {
  batteries: 50,
  plastic: 20,
  paper: 15,
  glass: 15,
  textile: 10,
  bio: 10,
};

export const DEFAULT_WASTE_TYPES: WasteTypeStats = {
  batteries: 0,
  plastic: 0,
  paper: 0,
  glass: 0,
  textile: 0,
  bio: 0,
};

export const DEFAULT_STATS: UserStats = {
  totalItems: 0,
  currentStreak: 0,
  longestStreak: 0,
  ecoScore: 0,
  points: 0,
  lastScanDate: "",
<<<<<<< HEAD
  rewards: [],
  wasteTypes: {
    batteries: 0,
    plastic: 0,
    paper: 0,
    glass: 0,
    textile: 0,
    bio: 0,
  },
};

export function getUserStats(): UserStats {
  const stored = localStorage.getItem("snap-sort-stats");
  if (!stored) return DEFAULT_STATS;

  try {
    const parsed = JSON.parse(stored) as Partial<UserStats> & { badges?: string[] };
    if (!parsed.wasteTypes) {
      parsed.wasteTypes = { ...DEFAULT_STATS.wasteTypes };
    }
    const rewards = Array.isArray(parsed.rewards)
      ? parsed.rewards
      : Array.isArray(parsed.badges)
        ? []
        : [];
    const { badges: _legacy, ...rest } = parsed;
    return {
      ...DEFAULT_STATS,
      ...rest,
      wasteTypes: { ...DEFAULT_STATS.wasteTypes, ...parsed.wasteTypes },
      rewards,
    };
  } catch {
    return DEFAULT_STATS;
  }
=======
  badges: [],
  wasteTypes: { ...DEFAULT_WASTE_TYPES },
};

export function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
>>>>>>> c0f2a7e6ce6a1f06b9eae5770ba53878090313b7
}

export function yesterdayIsoLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

<<<<<<< HEAD
function awardRewards(stats: UserStats): string[] {
  const next = [...stats.rewards];
  const { bio, plastic, batteries } = stats.wasteTypes;

  const tryPush = (id: string, condition: boolean) => {
    if (condition && !next.includes(id)) next.push(id);
  };

  tryPush("coffee-gradska", bio >= 5);
  tryPush("compost-home", bio >= 20);
  tryPush("bio-workshop", bio >= 40);
  tryPush("plastic-partner", plastic >= 12);
  tryPush("battery-bonus", batteries >= 3);
  tryPush("streak-partner", stats.currentStreak >= 7);

  return next;
}

export function updateStatsAfterScan(wasteType?: keyof WasteTypeStats): UserStats {
  const stats = getUserStats();
  const today = new Date().toDateString();

  stats.totalItems += 1;

  if (wasteType && wasteType in WASTE_TYPE_POINTS) {
    stats.wasteTypes[wasteType] += 1;
    stats.points += WASTE_TYPE_POINTS[wasteType];
  } else {
    stats.points += 10;
  }

  if (stats.lastScanDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (stats.lastScanDate === yesterday.toDateString()) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }

    stats.lastScanDate = today;
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  stats.ecoScore = stats.totalItems * 10 + stats.currentStreak * 50;
  stats.rewards = awardRewards(stats);

  saveUserStats(stats);
  return stats;
}

/** Ikone za nagrade (naziv i opis u i18n) */
export const REWARD_INFO: Record<string, { icon: string }> = {
  "coffee-gradska": { icon: "☕" },
  "compost-home": { icon: "🪴" },
  "bio-workshop": { icon: "🌿" },
  "plastic-partner": { icon: "♻️" },
  "battery-bonus": { icon: "🔋" },
  "streak-partner": { icon: "🎁" },
};

export const PROFILE_REWARD_IDS = [
  "coffee-gradska",
  "compost-home",
  "bio-workshop",
  "plastic-partner",
  "battery-bonus",
  "streak-partner",
] as const;
=======
export function localDateFromIsoTimestamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Ista logika kao record_user_scan u bazi (fallback ako RPC ne postoji). */
export function nextRowAfterScanFromDb(
  row: {
    streak: number;
    points: number;
    sorted_items_count: number;
    updated_at: string;
  },
  pointsAdd: number,
): { streak: number; points: number; sorted_items_count: number } {
  const newSorted = (row.sorted_items_count ?? 0) + 1;
  const newPoints = (row.points ?? 0) + pointsAdd;
  const today = todayIsoLocal();
  const yesterday = yesterdayIsoLocal();
  const lastAct = localDateFromIsoTimestamp(row.updated_at);

  let newStreak = row.streak ?? 0;
  if ((row.sorted_items_count ?? 0) === 0) {
    newStreak = 1;
  } else if (lastAct === today) {
    newStreak = row.streak ?? 0;
  } else if (lastAct === yesterday) {
    newStreak = (row.streak ?? 0) + 1;
  } else {
    newStreak = 1;
  }
  return { streak: newStreak, points: newPoints, sorted_items_count: newSorted };
}

/** Red iz public.users (samo tvoji stupci). */
export function userStatsFromDbRow(row: {
  streak: number;
  points: number;
  sorted_items_count: number;
  updated_at?: string | null;
}): UserStats {
  const totalItems = row.sorted_items_count ?? 0;
  const currentStreak = row.streak ?? 0;
  const points = row.points ?? 0;
  return {
    totalItems,
    currentStreak,
    longestStreak: currentStreak,
    points,
    lastScanDate: row.updated_at ? localDateFromIsoTimestamp(row.updated_at) : "",
    badges: [],
    wasteTypes: { ...DEFAULT_WASTE_TYPES },
    ecoScore: totalItems * 10 + currentStreak * 50,
  };
}

export function computeBadgesForTotals(
  totalItems: number,
  currentStreak: number,
  prev: string[],
): string[] {
  const next = [...prev];
  if (totalItems >= 1 && !next.includes("first-scan")) next.push("first-scan");
  if (totalItems >= 10 && !next.includes("eco-newbie")) next.push("eco-newbie");
  if (totalItems >= 50 && !next.includes("eco-warrior")) next.push("eco-warrior");
  if (totalItems >= 100 && !next.includes("eco-champion")) next.push("eco-champion");
  if (currentStreak >= 7 && !next.includes("week-streak")) next.push("week-streak");
  if (currentStreak >= 30 && !next.includes("month-streak")) next.push("month-streak");
  return next;
}

/** Sljedeće stanje nakon skena (lokalna simulacija; u app-u koristi se RPC record_user_scan). */
export function computeStatsAfterScan(
  stats: UserStats,
  wasteType?: keyof WasteTypeStats,
): UserStats {
  const next: UserStats = {
    ...stats,
    wasteTypes: { ...stats.wasteTypes },
    badges: [...stats.badges],
  };

  next.totalItems += 1;

  if (wasteType && wasteType in WASTE_TYPE_POINTS) {
    next.wasteTypes[wasteType] += 1;
    next.points += WASTE_TYPE_POINTS[wasteType];
  } else {
    next.points += 10;
  }

  const today = todayIsoLocal();
  const yesterday = yesterdayIsoLocal();

  if (next.lastScanDate !== today) {
    if (next.lastScanDate === yesterday) {
      next.currentStreak += 1;
    } else {
      next.currentStreak = 1;
    }
    next.lastScanDate = today;
  }

  if (next.currentStreak > next.longestStreak) {
    next.longestStreak = next.currentStreak;
  }

  next.ecoScore = next.totalItems * 10 + next.currentStreak * 50;
  next.badges = computeBadgesForTotals(next.totalItems, next.currentStreak, next.badges);

  return next;
}

export const BADGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  "first-scan": {
    name: "Prvi koraci",
    icon: "🌱",
    description: "Završen prvi sken",
  },
  "eco-newbie": {
    name: "Eko početnik",
    icon: "🌿",
    description: "Poredano 10 predmeta",
  },
  "eco-warrior": {
    name: "Eko borac",
    icon: "🌳",
    description: "Poredano 50 predmeta",
  },
  "eco-champion": {
    name: "Eko prvak",
    icon: "🏆",
    description: "Poredano 100 predmeta",
  },
  "week-streak": {
    name: "Tjedni niz",
    icon: "🔥",
    description: "7 dana zaredom",
  },
  "month-streak": {
    name: "Mjesečni niz",
    icon: "⭐",
    description: "30 dana zaredom",
  },
};
>>>>>>> c0f2a7e6ce6a1f06b9eae5770ba53878090313b7
