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
  badges: string[];
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
  badges: [],
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
    const parsed = JSON.parse(stored);
    // Ensure wasteTypes exists for backward compatibility
    if (!parsed.wasteTypes) {
      parsed.wasteTypes = {
        batteries: 0,
        plastic: 0,
        paper: 0,
        glass: 0,
        textile: 0,
        bio: 0,
      };
    }
    return parsed;
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  localStorage.setItem("snap-sort-stats", JSON.stringify(stats));
}

export function updateStatsAfterScan(wasteType?: keyof WasteTypeStats): UserStats {
  const stats = getUserStats();
  const today = new Date().toDateString();
  
  // Update total items
  stats.totalItems += 1;
  
  // Update waste type count and add corresponding points
  if (wasteType && wasteType in WASTE_TYPE_POINTS) {
    stats.wasteTypes[wasteType] += 1;
    stats.points += WASTE_TYPE_POINTS[wasteType];
  } else {
    // Default to 10 points if no specific type
    stats.points += 10;
  }
  
  // Update streak
  if (stats.lastScanDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (stats.lastScanDate === yesterday.toDateString()) {
      // Continue streak
      stats.currentStreak += 1;
    } else {
      // Streak broken, start new
      stats.currentStreak = 1;
    }
    
    stats.lastScanDate = today;
  }
  
  // Update longest streak
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  
  // Calculate eco score (based on items and streak)
  stats.ecoScore = stats.totalItems * 10 + stats.currentStreak * 50;
  
  // Award badges
  const newBadges: string[] = [...stats.badges];
  
  if (stats.totalItems >= 1 && !newBadges.includes("first-scan")) {
    newBadges.push("first-scan");
  }
  if (stats.totalItems >= 10 && !newBadges.includes("eco-newbie")) {
    newBadges.push("eco-newbie");
  }
  if (stats.totalItems >= 50 && !newBadges.includes("eco-warrior")) {
    newBadges.push("eco-warrior");
  }
  if (stats.totalItems >= 100 && !newBadges.includes("eco-champion")) {
    newBadges.push("eco-champion");
  }
  if (stats.currentStreak >= 7 && !newBadges.includes("week-streak")) {
    newBadges.push("week-streak");
  }
  if (stats.currentStreak >= 30 && !newBadges.includes("month-streak")) {
    newBadges.push("month-streak");
  }
  
  stats.badges = newBadges;
  
  saveUserStats(stats);
  return stats;
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