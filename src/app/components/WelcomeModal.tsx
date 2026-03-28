import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Award, TrendingUp, Zap } from "lucide-react";
import { useUIStrings } from "../i18n/uiStrings";
import { SmeChatWordmark } from "./SmeChatWordmark";

export function WelcomeModal() {
  const ui = useUIStrings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("snap-sort-welcome");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("snap-sort-welcome", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-8 text-white text-center relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto mb-4 flex w-full max-w-sm flex-col items-center gap-3">
                <p className="text-center text-base font-semibold text-white drop-shadow-sm">
                  {ui.welcome.titlePrefix}
                </p>
                <div className="rounded-2xl bg-white/90 px-6 py-5 shadow-md backdrop-blur-sm w-full max-w-[280px]">
                  <SmeChatWordmark
                    as="div"
                    size="lg"
                    showLogo
                    layout="stacked"
                    className="justify-center"
                  />
                </div>
              </div>
              <p className="text-sm text-white opacity-90">{ui.welcome.subtitle}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{ui.welcome.f1Title}</h3>
                  <p className="text-sm text-gray-600">{ui.welcome.f1Text}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{ui.welcome.f2Title}</h3>
                  <p className="text-sm text-gray-600">{ui.welcome.f2Text}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{ui.welcome.f3Title}</h3>
                  <p className="text-sm text-gray-600">{ui.welcome.f3Text}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{ui.welcome.f4Title}</h3>
                  <p className="text-sm text-gray-600">{ui.welcome.f4Text}</p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                {ui.welcome.cta}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">{ui.welcome.footer}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
