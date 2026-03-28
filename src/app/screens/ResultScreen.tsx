import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { CheckCircle, ArrowLeft, Sparkles, Tag } from "lucide-react";
import confetti from "canvas-confetti";
import { BottomNavigation } from "../components/BottomNavigation";
import { WasteExceptionModal } from "../components/WasteExceptionModal";
import { useLocale } from "../context/LocaleContext";
import { formatStr, useUIStrings } from "../i18n/uiStrings";
import { getWasteCategory, WASTE_CATEGORIES } from "../utils/wasteData";
<<<<<<< HEAD
import {
  updateStatsAfterScan,
  getUserStats,
  WASTE_TYPE_POINTS,
  REWARD_INFO,
  type WasteTypeStats,
} from "../utils/storage";
=======
import { WASTE_TYPE_POINTS, type WasteTypeStats } from "../utils/storage";
import { useUserStats } from "../context/UserStatsContext";

/** Avoid double-counting when React re-runs effects or revisits the same navigation key. */
const appliedResultScans = new Set<string>();
>>>>>>> c0f2a7e6ce6a1f06b9eae5770ba53878090313b7

export function ResultScreen() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, recordScan, loading: statsLoading } = useUserStats();
  const { locale } = useLocale();
  const ui = useUIStrings();
  const [exceptionAcknowledged, setExceptionAcknowledged] = useState(false);
  const [newRewardId, setNewRewardId] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(10);

  const categoryValid = Boolean(category && category in WASTE_CATEGORIES);
  const wasteInfo = categoryValid && category ? getWasteCategory(category, locale) : null;

  useEffect(() => {
    if (!categoryValid || !category) {
      navigate("/");
      return;
    }
    if (statsLoading) return;

    const dedupeKey = `${location.key}:${category}`;
    if (appliedResultScans.has(dedupeKey)) return;
    appliedResultScans.add(dedupeKey);

    const wasteType = category as keyof WasteTypeStats;
    const earnedPoints = WASTE_TYPE_POINTS[wasteType] || 10;
    setPointsEarned(earnedPoints);

<<<<<<< HEAD
    const earned = newStats.rewards.find((r) => !oldStats.rewards.includes(r));
    if (earned) setNewRewardId(earned);
  }, [categoryValid, category, navigate]);
=======
    let cancelled = false;
    const badgesBefore = [...stats.badges];

    void recordScan(wasteType).then((next) => {
      if (cancelled || !next) return;
      const earnedNewBadge = next.badges.find((badge) => !badgesBefore.includes(badge));
      if (earnedNewBadge) setNewBadge(earnedNewBadge);
    });

    return () => {
      cancelled = true;
    };
  }, [categoryValid, category, navigate, location.key, recordScan, statsLoading, stats.badges]);
>>>>>>> c0f2a7e6ce6a1f06b9eae5770ba53878090313b7

  useEffect(() => {
    setExceptionAcknowledged(false);
  }, [category]);

  useEffect(() => {
    if (!wasteInfo || !exceptionAcknowledged) return;
    const t = window.setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#4ADE80", "#60A5FA", "#FCD34D"],
      });
    }, 200);
    return () => window.clearTimeout(t);
  }, [wasteInfo, exceptionAcknowledged]);

  if (!wasteInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
      <WasteExceptionModal
        category={wasteInfo}
        open={!exceptionAcknowledged}
        onAcknowledge={() => setExceptionAcknowledged(true)}
      />
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{ui.result.back}</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-md ring-1 ring-emerald-100/80"
        >
          <div className="flex items-center gap-2 text-emerald-800">
            <Tag className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              {ui.result.detectedLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden>
              {wasteInfo.icon}
            </span>
            <div>
              <p className="text-xl font-bold text-gray-900">{wasteInfo.name}</p>
              <p className="text-sm text-gray-600">{ui.result.detectedHint}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-green-500" fill="currentColor" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{ui.result.greatJob}</h2>
          <p className="text-gray-600">
            {formatStr(ui.result.pointsEarned, { n: pointsEarned })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6"
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{wasteInfo.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{wasteInfo.name}</h3>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">{ui.result.useBin}</p>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl shadow-md"
                style={{ backgroundColor: wasteInfo.binColorHex }}
              />
              <div>
                <p className="font-bold text-lg text-gray-900">{wasteInfo.binColor}</p>
                <p className="text-sm text-gray-600">{ui.result.binForType}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{wasteInfo.explanation}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">{ui.result.examples}</p>
            <div className="flex flex-wrap gap-2">
              {wasteInfo.examples.map((example, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {newRewardId && ui.rewards[newRewardId] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white shadow-lg"
          >
            <div className="text-center">
              <div className="mb-2 text-4xl">{REWARD_INFO[newRewardId]?.icon ?? "🎁"}</div>
              <p className="text-lg font-bold">{ui.result.newReward}</p>
              <p className="mt-1 text-base font-semibold opacity-95">{ui.rewards[newRewardId].name}</p>
              <p className="mt-2 text-sm opacity-90">{ui.result.rewardKeepGoing}</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            {ui.result.scanAnother}
          </button>
          <button
            onClick={() => navigate("/map")}
            className="w-full bg-white text-gray-700 font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
          >
            {ui.result.nearestBins}
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
