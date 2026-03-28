// LocalStorage utilities for user data and gamification

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

// Point values for different waste types
export const WASTE_TYPE_POINTS: Record<keyof WasteTypeStats, number> = {
  batteries: 50,
  plastic: 20,
  paper: 15,
  glass: 15,
  textile: 10,
  bio: 10,
};

const DEFAULT_STATS: UserStats = {
  totalItems: 0,
  currentStreak: 0,
  longestStreak: 0,
  ecoScore: 0,
  points: 0,
  lastScanDate: "",
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
}

export function saveUserStats(stats: UserStats): void {
  localStorage.setItem("snap-sort-stats", JSON.stringify(stats));
}

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
