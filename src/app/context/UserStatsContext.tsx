import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { getSupabase } from "../lib/supabase";
import { upsertPublicUserIdentity } from "../lib/userProfile";
import {
  WASTE_TYPE_POINTS,
  computeBadgesForTotals,
  DEFAULT_STATS,
  nextRowAfterScanFromDb,
  userStatsFromDbRow,
  type UserStats,
  type WasteTypeStats,
} from "../utils/storage";
import { useAuth } from "./AuthContext";

type RecordScanRpcRow = {
  ok?: boolean;
  error?: string;
  streak?: number;
  points?: number;
  sorted_items_count?: number;
};

type UserStatsContextValue = {
  stats: UserStats;
  loading: boolean;
  recordScan: (wasteType: keyof WasteTypeStats) => Promise<UserStats | null>;
  refresh: () => Promise<void>;
};

const UserStatsContext = createContext<UserStatsContextValue | null>(null);

const USER_STATS_SELECT = "streak, points, sorted_items_count, updated_at";

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = getSupabase();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const refresh = useCallback(async () => {
    if (!user || !supabase) {
      setStats(DEFAULT_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);

    const first = await supabase
      .from("users")
      .select(USER_STATS_SELECT)
      .eq("id", user.id)
      .maybeSingle();

    if (first.error) {
      console.error("users stats load:", first.error.message);
      setLoading(false);
      return;
    }

    let row = first.data;
    if (!row) {
      await upsertPublicUserIdentity(supabase, user);
      const second = await supabase
        .from("users")
        .select(USER_STATS_SELECT)
        .eq("id", user.id)
        .maybeSingle();
      if (second.error || !second.data) {
        setLoading(false);
        return;
      }
      row = second.data;
    }

    setStats(userStatsFromDbRow(row));
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordScan = useCallback(
    async (wasteType: keyof WasteTypeStats): Promise<UserStats | null> => {
      if (!user || !supabase) return null;

      const prev = statsRef.current;
      const delta = WASTE_TYPE_POINTS[wasteType] ?? 10;

      let patch: { streak: number; points: number; sorted_items_count: number } | null = null;

      const { data, error } = await supabase.rpc("record_user_scan", {
        p_points_add: delta,
      });

      if (!error && data) {
        const d = data as RecordScanRpcRow;
        if (d.ok) {
          patch = {
            streak: d.streak ?? 0,
            points: d.points ?? 0,
            sorted_items_count: d.sorted_items_count ?? 0,
          };
        }
      }

      if (!patch) {
        if (error) {
          console.warn("record_user_scan RPC failed, trying direct update:", error.message);
        }
        await upsertPublicUserIdentity(supabase, user);
        const sel = await supabase
          .from("users")
          .select(USER_STATS_SELECT)
          .eq("id", user.id)
          .maybeSingle();

        if (sel.error || !sel.data) {
          toast.error(sel.error?.message ?? "Profil nije učitan. Provjeri tablicu users i RLS.");
          return null;
        }

        patch = nextRowAfterScanFromDb(
          {
            streak: sel.data.streak ?? 0,
            points: sel.data.points ?? 0,
            sorted_items_count: sel.data.sorted_items_count ?? 0,
            updated_at: sel.data.updated_at as string,
          },
          delta,
        );

        const up = await supabase.from("users").update(patch).eq("id", user.id);
        if (up.error) {
          console.error("users update:", up.error.message);
          toast.error(up.error.message);
          return null;
        }
      }

      const base = userStatsFromDbRow({
        ...patch,
        updated_at: new Date().toISOString(),
      });

      const wasteTypes = {
        ...prev.wasteTypes,
        [wasteType]: prev.wasteTypes[wasteType] + 1,
      };
      const longestStreak = Math.max(prev.longestStreak, base.currentStreak);
      const badges = computeBadgesForTotals(
        base.totalItems,
        base.currentStreak,
        prev.badges,
      );

      const next: UserStats = {
        ...base,
        longestStreak,
        wasteTypes,
        badges,
        ecoScore: base.totalItems * 10 + base.currentStreak * 50,
      };

      flushSync(() => {
        setStats(next);
      });

      return next;
    },
    [user, supabase],
  );

  const value = useMemo<UserStatsContextValue>(
    () => ({
      stats,
      loading,
      recordScan,
      refresh,
    }),
    [stats, loading, recordScan, refresh],
  );

  return <UserStatsContext.Provider value={value}>{children}</UserStatsContext.Provider>;
}

export function useUserStats(): UserStatsContextValue {
  const ctx = useContext(UserStatsContext);
  if (!ctx) {
    throw new Error("useUserStats must be used within UserStatsProvider");
  }
  return ctx;
}
