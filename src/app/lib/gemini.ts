import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

/** Exposing the key in the client is fine for prototypes; use a server proxy in production. */
const EKO_SYSTEM_INSTRUCTION = `Ti si EKO asistent u mobilnoj web aplikaciji Snap&Sort za recikliranje u Hrvatskoj.
Odgovaraj na hrvatskom, kratko i razgovorno (1–3 odlomka kada treba detalja).
Teme: vrste otpada i boje kontejnera (plastika i metal-žuta, papir-plava, staklo-zelena, bio-smeđa), baterije i e-otpad (nikad u kućni otpad – sabirna mjesta/trgovine), tekstil (posebni kontejneri).
Za točne datume odvoza i lokalne rasporede nemoj izmišljati – uputi korisnika da otvori Kalendar u aplikaciji.
Budi pozitivan i praktičan. Emoji koristi u mjeri.`;

/** gemini-2.0-flash often hits free-tier limit:0 when retired or unavailable; try newer Flash first. */
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
] as const;

export type EcoChatTurn = { sender: "user" | "bot"; text: string };

export function isGeminiConfigured(): boolean {
  return Boolean(
    typeof import.meta.env.VITE_GEMINI_API_KEY === "string" &&
      import.meta.env.VITE_GEMINI_API_KEY.length > 0,
  );
}

function toGeminiHistory(prefix: EcoChatTurn[]): Content[] {
  const trimmed = [...prefix];
  while (trimmed.length > 0 && trimmed[0].sender === "bot") {
    trimmed.shift();
  }

  const history: Content[] = [];
  let i = 0;
  while (i < trimmed.length) {
    if (trimmed[i].sender !== "user") {
      i++;
      continue;
    }
    const userText = trimmed[i].text;
    i++;
    if (i < trimmed.length && trimmed[i].sender === "bot") {
      history.push({ role: "user", parts: [{ text: userText }] });
      history.push({ role: "model", parts: [{ text: trimmed[i].text }] });
      i++;
    }
  }
  return history;
}

function isRetryableModelError(message: string): boolean {
  return (
    /\b429\b/.test(message) ||
    /\b404\b/.test(message) ||
    /quota/i.test(message) ||
    /rate limit/i.test(message) ||
    /not found/i.test(message) ||
    /limit:\s*0/i.test(message) ||
    /is not (?:found|supported)/i.test(message)
  );
}

async function sendEcoMessage(
  apiKey: string,
  modelName: string,
  history: Content[],
  lastUserText: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: EKO_SYSTEM_INSTRUCTION,
  });
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastUserText);
  const text = result.response.text();
  if (!text?.trim()) {
    throw new Error("Prazan odgovor od modela");
  }
  return text.trim();
}

function buildModelCandidates(): string[] {
  const pinned = import.meta.env.VITE_GEMINI_MODEL?.trim();
  if (pinned) {
    const rest = MODEL_FALLBACK_CHAIN.filter((m) => m !== pinned);
    return [pinned, ...rest];
  }
  return [...MODEL_FALLBACK_CHAIN];
}

export async function getGeminiEcoReply(messages: EcoChatTurn[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey?.length) {
    throw new Error("VITE_GEMINI_API_KEY is not set");
  }

  if (messages.length === 0) {
    throw new Error("No messages");
  }

  const last = messages[messages.length - 1];
  if (last.sender !== "user") {
    throw new Error("Last message must be from user");
  }

  const prefix = messages.slice(0, -1);
  const history = toGeminiHistory(prefix);
  const candidates = buildModelCandidates();

  let lastError: unknown;
  for (let i = 0; i < candidates.length; i++) {
    const modelName = candidates[i];
    try {
      return await sendEcoMessage(apiKey, modelName, history, last.text);
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const isLast = i === candidates.length - 1;
      if (!isRetryableModelError(msg) || isLast) {
        throw e;
      }
    }
  }
  throw lastError;
}
