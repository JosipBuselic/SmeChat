import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Zap,
  Award,
  TrendingUp,
  Trophy,
  Gift,
  Share2,
  LogOut,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { BottomNavigation } from "../components/BottomNavigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { useLocale } from "../context/LocaleContext";
import { formatStr, useUIStrings } from "../i18n/uiStrings";
import { getUserStats, WASTE_TYPE_POINTS, REWARD_INFO, PROFILE_REWARD_IDS } from "../utils/storage";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../context/AuthContext";
import { cn } from "../components/ui/utils";
import { getWasteCategory } from "../utils/wasteData";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { locale, setLocale } = useLocale();
  const ui = useUIStrings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const stats = getUserStats();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    ui.profile.defaultName;

  const currentLevel = Math.floor(stats.points / 100);
  const pointsToNextLevel = 100 - (stats.points % 100);
  const progressPercent = ((stats.points % 100) / 100) * 100;

  const wasteTypeData = [
    { type: "batteries" as const, color: "from-red-500 to-red-600" },
    { type: "plastic" as const, color: "from-yellow-400 to-yellow-500" },
    { type: "paper" as const, color: "from-blue-400 to-blue-500" },
    { type: "glass" as const, color: "from-green-400 to-green-500" },
    { type: "textile" as const, color: "from-pink-400 to-pink-500" },
    { type: "bio" as const, color: "from-amber-600 to-amber-700" },
  ];

  function handleSignOut() {
    void signOut()
      .then(() => {
        toast.success(ui.profile.signedOutToast);
        setSettingsOpen(false);
        navigate("/login", { replace: true });
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : ui.profile.signOutError);
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle>{ui.profile.settingsTitle}</SheetTitle>
            <SheetDescription>{ui.profile.settingsSubtitle}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 px-4 pb-4 pt-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900">
                {ui.profile.languageLabel}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLocale("hr")}
                  className={cn(
                    "flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors",
                    locale === "hr"
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {ui.profile.langHr}
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={cn(
                    "flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors",
                    locale === "en"
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {ui.profile.langEn}
                </button>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-gray-100 pt-4 sm:flex-col">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <LogOut className="h-5 w-5" />
              {ui.profile.signOut}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{ui.profile.title}</h1>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg p-2 transition-colors hover:bg-white/20"
              aria-label={ui.profile.settingsTitle}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl shadow-lg">
              🌍
            </div>
            <h2 className="mb-1 text-xl font-bold">{displayName}</h2>
            {user?.email ? (
              <p className="mx-auto mb-1 max-w-[240px] truncate text-sm opacity-80">{user.email}</p>
            ) : null}
            <p className="text-sm opacity-90">{formatStr(ui.profile.level, { n: currentLevel })}</p>
          </div>

          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">{ui.profile.levelProgress}</span>
              <span className="text-sm">
                {formatStr(ui.profile.pointsToNext, { n: pointsToNextLevel })}
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-3 bg-white/30"
              style={
                {
                  "--progress-indicator": "bg-white",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto -mt-6 px-4">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <Zap className="h-5 w-5 text-orange-500" fill="currentColor" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">{ui.profile.streakDays}</div>
            {stats.currentStreak > 0 && (
              <div className="mt-1 text-xs font-semibold text-orange-600">{ui.profile.streakKeep}</div>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">{ui.profile.sorted}</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.points}</div>
            <div className="text-sm text-gray-600">{ui.profile.pointsTotal}</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stats.ecoScore}</div>
            <div className="text-sm text-gray-600">{ui.profile.ecoScore}</div>
          </motion.div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {ui.profile.byTypeTitle}
          </h3>

          <div className="space-y-3">
            {wasteTypeData.map((wasteType) => {
              const count = stats.wasteTypes[wasteType.type];
              const points = count * WASTE_TYPE_POINTS[wasteType.type];
              const cat = getWasteCategory(wasteType.type, locale);

              return (
                <motion.div
                  key={wasteType.type}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center justify-between rounded-xl bg-gradient-to-r p-3 ${wasteType.color} text-white`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{cat?.icon ?? "♻️"}</div>
                    <div>
                      <div className="font-semibold">{cat?.name ?? wasteType.type}</div>
                      <div className="text-xs opacity-90">
                        {formatStr(ui.profile.pointsPerItem, {
                          n: WASTE_TYPE_POINTS[wasteType.type],
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs opacity-90">
                      {points} {ui.profile.pts}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-1 flex items-center gap-2 font-bold text-gray-900">
            <Gift className="h-5 w-5 text-amber-600" />
            {ui.profile.rewardsTitle}
          </h3>
          <p className="mb-4 text-sm text-gray-600">{ui.profile.rewardsSubtitle}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROFILE_REWARD_IDS.map((rewardId) => {
              const reward = ui.rewards[rewardId];
              const meta = REWARD_INFO[rewardId];
              const isUnlocked = stats.rewards.includes(rewardId);
              if (!reward || !meta) return null;

              return (
                <motion.div
                  key={rewardId}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-xl p-4 text-left ${
                    isUnlocked ? "bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200/60" : "bg-gray-50"
                  }`}
                >
                  <div className="mb-2 flex items-start gap-2">
                    <span className={`text-2xl leading-none ${!isUnlocked ? "opacity-40 grayscale" : ""}`}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">{reward.name}</div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">{reward.description}</p>
                      {isUnlocked && (
                        <div className="mt-2 text-xs font-semibold text-green-700">{ui.profile.unlocked}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Share2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-bold">{ui.profile.shareTitle}</h3>
              <p className="text-sm opacity-90">{ui.profile.shareSubtitle}</p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-opacity-90"
            >
              {ui.profile.shareBtn}
            </button>
          </div>
        </motion.div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 font-bold text-gray-900">{ui.profile.impactTitle}</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">💧</div>
                <div>
                  <div className="font-semibold text-gray-900">{ui.profile.water}</div>
                  <div className="text-sm text-gray-600">~{stats.totalItems * 50}L</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">🌳</div>
                <div>
                  <div className="font-semibold text-gray-900">{ui.profile.trees}</div>
                  <div className="text-sm text-gray-600">~{Math.floor(stats.totalItems / 10)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">⚡</div>
                <div>
                  <div className="font-semibold text-gray-900">{ui.profile.energy}</div>
                  <div className="text-sm text-gray-600">~{stats.totalItems * 2}kWh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
