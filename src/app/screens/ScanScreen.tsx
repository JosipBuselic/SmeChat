import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Camera, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { BottomNavigation } from "../components/BottomNavigation";
import { SmeChatWordmark } from "../components/SmeChatWordmark";
import { WelcomeModal } from "../components/WelcomeModal";
import { RecycleChatbot } from "../components/RecycleChatbot";
import { useUIStrings } from "../i18n/uiStrings";
import { useUserStats } from "../context/UserStatsContext";
import { computePartnerRewardsUnlocked } from "../utils/storage";

export function ScanScreen() {
  const navigate = useNavigate();
  const ui = useUIStrings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { stats, loading: statsLoading } = useUserStats();
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Navigate to result with a random category
      const categories = ["batteries", "plastic", "paper", "glass", "textile", "bio"];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      navigate(`/result/${randomCategory}`);
      setIsProcessing(false);
    }, 1500);
  };
  
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
      <WelcomeModal />
      <RecycleChatbot />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <SmeChatWordmark as="h1" size="md" showLogo className="min-w-0" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-orange-500" fill="currentColor" />
                <span className="text-sm font-bold text-orange-600">
                  {statsLoading ? "—" : stats.currentStreak}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  {statsLoading ? "—" : stats.points}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {ui.scan.readyTitle}
          </h2>
          <p className="text-gray-600">
            {ui.scan.readySubtitle}
          </p>
        </motion.div>
        
        {/* Camera Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <button
            onClick={handleCameraClick}
            disabled={isProcessing}
            className="relative w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-blue-500 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-20 h-20 text-white" />
              </motion.div>
            ) : (
              <Camera className="w-20 h-20 text-white" />
            )}
            
            {/* Pulse animation ring */}
            {!isProcessing && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-lg font-semibold text-gray-700">
            {isProcessing ? ui.scan.analyzing : ui.scan.tapScan}
          </p>
        </motion.div>
        
        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-2xl shadow-md p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4">{ui.scan.quickTipsTitle}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{ui.scan.tip1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{ui.scan.tip2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{ui.scan.tip3}</span>
            </li>
          </ul>
        </motion.div>
        
        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "—" : stats.totalItems}
            </div>
            <div className="text-xs text-gray-500 mt-1">{ui.scan.statSorted}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? "—" : stats.currentStreak}
            </div>
            <div className="text-xs text-gray-500 mt-1">{ui.scan.statStreak}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {statsLoading ? "—" : computePartnerRewardsUnlocked(stats).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">{ui.scan.statRewards}</div>
          </div>
        </motion.div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}