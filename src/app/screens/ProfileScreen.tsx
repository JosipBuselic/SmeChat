import React from "react";
import { motion } from "motion/react";
import { Zap, Award, TrendingUp, Trophy, Settings, Share2, Battery, Shirt } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";
import { getUserStats, BADGE_INFO, WASTE_TYPE_POINTS } from "../utils/storage";
import { Progress } from "../components/ui/progress";

export function ProfileScreen() {
  const stats = getUserStats();
  
  // Calculate progress to next level (every 100 points = 1 level)
  const currentLevel = Math.floor(stats.points / 100);
  const pointsToNextLevel = 100 - (stats.points % 100);
  const progressPercent = ((stats.points % 100) / 100) * 100;
  
  // Daily goal progress (3 items per day)
  const dailyGoal = 3;
  const today = new Date().toDateString();
  const itemsSortedToday = stats.lastScanDate === today ? 1 : 0; // Simplified for demo
  const dailyProgress = (itemsSortedToday / dailyGoal) * 100;

  // Waste type stats with metadata
  const wasteTypeData = [
    { 
      type: "batteries" as const, 
      label: "Baterije", 
      icon: "🔋", 
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-100",
      textColor: "text-red-600"
    },
    { 
      type: "plastic" as const, 
      label: "Plastika", 
      icon: "♻️", 
      color: "from-yellow-400 to-yellow-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700"
    },
    { 
      type: "paper" as const, 
      label: "Papir", 
      icon: "📄", 
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    { 
      type: "glass" as const, 
      label: "Staklo", 
      icon: "🍾", 
      color: "from-green-400 to-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    { 
      type: "textile" as const, 
      label: "Tekstil", 
      icon: "👕", 
      color: "from-pink-400 to-pink-500",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600"
    },
    { 
      type: "bio" as const, 
      label: "Bio otpad", 
      icon: "🍂", 
      color: "from-amber-600 to-amber-700",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700"
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          
          {/* Profile Info */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
              🌍
            </div>
            <h2 className="text-xl font-bold mb-1">Eco Warrior</h2>
            <p className="text-sm opacity-90">Level {currentLevel}</p>
          </div>
          
          {/* Level Progress */}
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Level Progress</span>
              <span className="text-sm">{pointsToNextLevel} points to next level</span>
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
      
      {/* Stats Grid */}
      <div className="max-w-md mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-500" fill="currentColor" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
            {stats.currentStreak > 0 && (
              <div className="text-xs text-orange-600 font-semibold mt-1">
                Keep it going! 🔥
              </div>
            )}
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">Items Sorted</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.points}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.ecoScore}</div>
            <div className="text-sm text-gray-600">Eco Score</div>
          </motion.div>
        </div>
        
        {/* Waste Type Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Reciklirano po vrstama
          </h3>
          
          <div className="space-y-3">
            {wasteTypeData.map((wasteType) => {
              const count = stats.wasteTypes[wasteType.type];
              const points = count * WASTE_TYPE_POINTS[wasteType.type];
              
              return (
                <motion.div
                  key={wasteType.type}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${wasteType.color} text-white`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{wasteType.icon}</div>
                    <div>
                      <div className="font-semibold">{wasteType.label}</div>
                      <div className="text-xs opacity-90">
                        {WASTE_TYPE_POINTS[wasteType.type]} bodova po predmetu
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs opacity-90">{points} bod.</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievements
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(BADGE_INFO).map(([badgeId, badge]) => {
              const isUnlocked = stats.badges.includes(badgeId);
              
              return (
                <motion.div
                  key={badgeId}
                  whileHover={{ scale: 1.05 }}
                  className={`text-center p-3 rounded-xl ${
                    isUnlocked ? "bg-gradient-to-br from-yellow-100 to-orange-100" : "bg-gray-100"
                  }`}
                >
                  <div className={`text-3xl mb-1 ${!isUnlocked ? "grayscale opacity-50" : ""}`}>
                    {badge.icon}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">
                    {badge.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {badge.description}
                  </div>
                  {isUnlocked && (
                    <div className="text-xs text-green-600 font-semibold mt-1">
                      ✓ Unlocked
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Share Progress */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Share Your Progress</h3>
              <p className="text-sm opacity-90">Inspire others to recycle!</p>
            </div>
            <button className="bg-white text-green-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">
              Share
            </button>
          </div>
        </motion.div>
        
        {/* Impact Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Your Impact</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  💧
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Water Saved</div>
                  <div className="text-sm text-gray-600">~{stats.totalItems * 50}L</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  🌳
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Trees Saved</div>
                  <div className="text-sm text-gray-600">~{Math.floor(stats.totalItems / 10)}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Energy Saved</div>
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