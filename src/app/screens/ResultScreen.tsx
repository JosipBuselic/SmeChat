import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle, ArrowLeft, Sparkles, Tag } from "lucide-react";
import confetti from "canvas-confetti";
import { BottomNavigation } from "../components/BottomNavigation";
import { WasteExceptionModal } from "../components/WasteExceptionModal";
import { WASTE_CATEGORIES } from "../utils/wasteData";
import { updateStatsAfterScan, getUserStats, WASTE_TYPE_POINTS, type WasteTypeStats } from "../utils/storage";

export function ResultScreen() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [exceptionAcknowledged, setExceptionAcknowledged] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(10);
  
  const wasteInfo = category ? WASTE_CATEGORIES[category] : null;
  
  useEffect(() => {
    if (!wasteInfo) {
      navigate("/");
      return;
    }
    
    // Update stats with waste type
    const oldStats = getUserStats();
    const wasteType = category as keyof WasteTypeStats;
    const newStats = updateStatsAfterScan(wasteType);
    
    // Get points earned for this type
    const earnedPoints = WASTE_TYPE_POINTS[wasteType] || 10;
    setPointsEarned(earnedPoints);
    
    // Check for new badges
    const earnedNewBadge = newStats.badges.find(badge => !oldStats.badges.includes(badge));
    if (earnedNewBadge) {
      setNewBadge(earnedNewBadge);
    }
  }, [wasteInfo, navigate, category]);
  
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
      {wasteInfo && (
        <WasteExceptionModal
          category={wasteInfo}
          open={!exceptionAcknowledged}
          onAcknowledge={() => setExceptionAcknowledged(true)}
        />
      )}
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Detected category — visible behind modal; repeated in modal for context */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-md ring-1 ring-emerald-100/80"
        >
          <div className="flex items-center gap-2 text-emerald-800">
            <Tag className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">Prepoznata kategorija</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden>
              {wasteInfo.icon}
            </span>
            <div>
              <p className="text-xl font-bold text-gray-900">{wasteInfo.name}</p>
              <p className="text-sm text-gray-600">Odmah slijedi kratki savjet prije odlaganja.</p>
            </div>
          </div>
        </motion.div>
        {/* Success Animation */}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Great Job!</h2>
          <p className="text-gray-600">You earned +{pointsEarned} points</p>
        </motion.div>
        
        {/* Waste Category Card */}
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
          
          {/* Bin Color */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Use this bin:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl shadow-md"
                style={{ backgroundColor: wasteInfo.binColorHex }}
              />
              <div>
                <p className="font-bold text-lg text-gray-900">{wasteInfo.binColor}</p>
                <p className="text-sm text-gray-600">For {wasteInfo.name}</p>
              </div>
            </div>
          </div>
          
          {/* Explanation */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{wasteInfo.explanation}</p>
          </div>
          
          {/* Examples */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
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
        
        {/* New Badge Notification */}
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl shadow-lg p-6 mb-6 text-white"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-bold text-lg">New Badge Unlocked!</p>
              <p className="text-sm opacity-90 mt-1">Keep up the great work!</p>
            </div>
          </motion.div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            Scan Another Item
          </button>
          <button
            onClick={() => navigate("/map")}
            className="w-full bg-white text-gray-700 font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
          >
            Find Nearest Bin
          </button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}