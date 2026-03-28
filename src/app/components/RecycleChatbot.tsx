import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../context/LocaleContext";
import { formatStr, useUIStrings } from "../i18n/uiStrings";
import { getGeminiEcoReply, getGeminiPrimaryModelId, isGeminiConfigured } from "../lib/gemini";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const BOT_RESPONSES: Record<string, string> = {
  "kako reciklirati plastiku": "Plastiku bacite u žutu kantu! 💛 Prije bacanja isperite bocu ili spremnik. Plastika se može reciklirati i postati novi proizvod!",
  "gdje baciti baterije": "Baterije nikada ne bacajte u obične kante! 🔋 Odnesite ih na posebna sabirna mjesta ili u trgovine elektronike. Baterije donose najviše bodova - 50 bodova!",
  "kada se prazne kontejneri": "Prazni se svaki dan! 📅 Pogledajte kalendar u aplikaciji za točan raspored odvoza po vrstama otpada.",
  "što je bio otpad": "Bio otpad je organski otpad poput kožica od voća, ostataka hrane i vrtnog otpada. 🍂 Ide u smeđu kantu!",
  "default": "Hvala na pitanju! 🌍 Molim vas budite specifičniji ili odaberite jedno od brzih pitanja. Ovdje sam da vam pomognem s recikliranjem!",
};

function getBotResponse(userMessage: string): string {
  const normalized = userMessage.toLowerCase().trim();
  
  // Check for keyword matches
  if (normalized.includes("plastik")) {
    return BOT_RESPONSES["kako reciklirati plastiku"];
  }
  if (normalized.includes("bateri")) {
    return BOT_RESPONSES["gdje baciti baterije"];
  }
  if (normalized.includes("kada") || normalized.includes("raspored") || normalized.includes("praznj")) {
    return BOT_RESPONSES["kada se prazne kontejneri"];
  }
  if (normalized.includes("bio") || normalized.includes("organski")) {
    return BOT_RESPONSES["što je bio otpad"];
  }
  if (normalized.includes("papir")) {
    return "Papir i karton bacite u plavu kantu! 📘 Pazite da papir bude čist i suh. Bodovi: 15!";
  }
  if (normalized.includes("staklo")) {
    return "Staklo ide u zelenu kantu! 💚 Skinite poklopce prije bacanja. Bodovi: 15!";
  }
  if (normalized.includes("tekstil") || normalized.includes("odjeća") || normalized.includes("odjec")) {
    return "Staru odjeću i tekstil odnesite u posebne kontejnere za tekstil! 👕 Bodovi: 10!";
  }
  if (normalized.includes("bodov") || normalized.includes("poen")) {
    return "Najviše bodova donose baterije (50), zatim plastika (20), papir i staklo (15), te tekstil i bio otpad (10). Skupljajte bodove i otključavajte značke! 🏆";
  }
  
  return BOT_RESPONSES["default"];
}

export function RecycleChatbot() {
  const { locale } = useLocale();
  const ui = useUIStrings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [awaitingReply, setAwaitingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const text = isGeminiConfigured() ? ui.chat.welcomeGemini : ui.chat.welcomeLocal;
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ id: "welcome", text, sender: "bot", timestamp: new Date() }];
      }
      const [first, ...rest] = prev;
      if (first?.id === "welcome") {
        return [{ ...first, text }, ...rest];
      }
      return prev;
    });
  }, [locale, ui.chat.welcomeGemini, ui.chat.welcomeLocal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, awaitingReply]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || awaitingReply) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    const withUser: Message[] = [...messages, userMessage];
    setMessages(withUser);
    setInputValue("");
    setAwaitingReply(true);

    const transcript = withUser.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    void (async () => {
      let replyText: string;
      try {
        if (isGeminiConfigured()) {
          replyText = await getGeminiEcoReply(transcript);
        } else {
          await new Promise((r) => setTimeout(r, 500));
          replyText = getBotResponse(messageText);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : ui.chat.errorReply;
        toast.error(msg);
        replyText = getBotResponse(messageText);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setAwaitingReply(false);
    })();
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50"
          >
            <MessageCircle className="w-7 h-7" />
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-[90vw] max-w-sm h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  🌍
                </div>
                <div>
                  <h3 className="font-bold">{ui.chat.headerTitle}</h3>
                  <p className="text-xs opacity-90">{ui.chat.headerSub}</p>
                  {isGeminiConfigured() ? (
                    <p className="text-[10px] opacity-75 mt-0.5 tracking-wide">{ui.chat.poweredByGeminiShort}</p>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-green-50/30 to-blue-50/30">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-green-500 to-blue-500 text-white"
                        : "bg-white shadow-md text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </motion.div>
              ))}
              {awaitingReply ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white shadow-md text-gray-500 text-sm">
                    {ui.chat.typing}
                  </div>
                </motion.div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {ui.chat.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={awaitingReply}
                    onClick={() => handleQuickReply(reply)}
                    className="flex-shrink-0 bg-white text-gray-700 text-xs px-3 py-2 rounded-full border border-gray-300 hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={ui.chat.placeholder}
                  disabled={awaitingReply}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || awaitingReply}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] leading-tight text-gray-400">
                {isGeminiConfigured()
                  ? formatStr(ui.chat.poweredByGemini, { model: getGeminiPrimaryModelId() })
                  : ui.chat.poweredByLocal}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
