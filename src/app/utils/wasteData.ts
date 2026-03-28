// Waste classification data for Zagreb

import type { AppLocale } from "../context/LocaleContext";

export interface WasteCategory {
  id: string;
  name: string;
  binColor: string;
  binColorHex: string;
  icon: string;
  explanation: string;
  examples: string[];
}

/** Kratki savjet nakon klasifikacije — hrvatski, jednostavan tekst. */
export interface WasteExceptionInfo {
  title: string;
  /** Jedan kratki odlomak: iznimka ili podsjetnik. */
  message: string;
}

export const WASTE_EXCEPTIONS: Record<string, WasteExceptionInfo> = {
  batteries: {
    title: "Važno",
    message:
      "Baterije i e-otpad ne smiju u kućni otpad. Odnesi ih u trgovinu ili na sabirno mjesto.",
  },
  plastic: {
    title: "Brzi savjet",
    message:
      "Jako prljav ili masan ambalažni otpad ne recikliraj — operi ga ili baci u miješani otpad.",
  },
  paper: {
    title: "Brzi savjet",
    message:
      "Mokar ili masan papir (npr. pizza kutija) ne ide među čisti papir — u miješani otpad.",
  },
  glass: {
    title: "Brzi savjet",
    message:
      "Ogledala, prozorsko staklo i keramika nisu ambalažno staklo — u miješani otpad, ne u zeleni.",
  },
  bio: {
    title: "Brzi savjet",
    message:
      "Skini plastične naljepnice i sve što nije organsko. One idu u miješani otpad.",
  },
  textile: {
    title: "Brzi savjet",
    message:
      "Mokro, pljesnivo ili jako zaprljano tekstilno često ne ide u kontejner — provjeri pravila ili miješani otpad.",
  },
  mixed: {
    title: "Brzi savjet",
    message:
      "Prije bacanja u crni spremnik provjeri može li se još što odvojeno (plastika, papir, staklo).",
  },
};

const WASTE_EXCEPTIONS_EN: Record<string, WasteExceptionInfo> = {
  batteries: {
    title: "Important",
    message:
      "Batteries and e-waste don’t go in household bins. Take them to a shop or drop-off point.",
  },
  plastic: {
    title: "Quick tip",
    message:
      "Very dirty or greasy packaging isn’t for recycling — rinse it or use residual waste.",
  },
  paper: {
    title: "Quick tip",
    message:
      "Wet or greasy paper (e.g. pizza boxes) doesn’t go with clean paper — use residual waste.",
  },
  glass: {
    title: "Quick tip",
    message:
      "Mirrors, window glass and ceramics aren’t packaging glass — residual waste, not the green bin.",
  },
  bio: {
    title: "Quick tip",
    message:
      "Remove plastic stickers and anything non-organic. Those go in residual waste.",
  },
  textile: {
    title: "Quick tip",
    message:
      "Wet, mouldy or very soiled textiles often don’t go in textile bins — check rules or use residual waste.",
  },
  mixed: {
    title: "Quick tip",
    message:
      "Before the black bin, check if anything can still be sorted (plastic, paper, glass).",
  },
};

export function getWasteException(categoryId: string, locale: AppLocale = "hr"): WasteExceptionInfo {
  const table = locale === "en" ? WASTE_EXCEPTIONS_EN : WASTE_EXCEPTIONS;
  const fallback: WasteExceptionInfo =
    locale === "en"
      ? {
          title: "Quick tip",
          message:
            "Not sure? Check local rules — wrong sorting can spoil a whole batch.",
        }
      : {
          title: "Brzi savjet",
          message:
            "Nisi siguran/na? Provjeri lokalna pravila — krivo sortiranje kvare cijelu skupinu.",
        };
  return table[categoryId] ?? fallback;
}

export const WASTE_CATEGORIES: Record<string, WasteCategory> = {
  batteries: {
    id: "batteries",
    name: "Baterije",
    binColor: "Posebno sabirno mjesto",
    binColorHex: "#DC2626",
    icon: "🔋",
    explanation:
      "Baterije i akumulatori idu na sabirna mjesta ili u trgovine — nikad u obične kante za smeće.",
    examples: ["AA baterije", "AAA baterije", "Baterija mobitela", "Punjive baterije"],
  },
  plastic: {
    id: "plastic",
    name: "Plastika i metal",
    binColor: "Žuta kanta",
    binColorHex: "#FCD34D",
    icon: "♻️",
    explanation: "Plastične boce, spremnici, limenke i ambalaža. Prije odlaganja isperi.",
    examples: ["Plastične boce", "Ambalaža za hranu", "Limenke", "Plastična ambalaža"],
  },
  paper: {
    id: "paper",
    name: "Papir i karton",
    binColor: "Plava kanta",
    binColorHex: "#60A5FA",
    icon: "📄",
    explanation: "Čist papir, novine, časopisi i kartonske kutije. Drži suhim!",
    examples: ["Novine", "Časopisi", "Kartonske kutije", "Uredski papir"],
  },
  glass: {
    id: "glass",
    name: "Staklo",
    binColor: "Zelena kanta",
    binColorHex: "#4ADE80",
    icon: "🍾",
    explanation: "Staklene boce i tegle. Poklopce odvoji prije odlaganja.",
    examples: ["Staklene boce", "Staklene tegle", "Boce od vina"],
  },
  textile: {
    id: "textile",
    name: "Tekstil",
    binColor: "Kontejner za tekstil",
    binColorHex: "#EC4899",
    icon: "👕",
    explanation: "Stara odjeća, obuća i tkanine. Doniraj ili u posebne kontejnere za tekstil.",
    examples: ["Odjeća", "Obuća", "Posteljina", "Ručnici"],
  },
  bio: {
    id: "bio",
    name: "Bio otpad",
    binColor: "Smeđa kanta",
    binColorHex: "#A16207",
    icon: "🍂",
    explanation: "Organski otpad: ostaci hrane, ljuske voća, vrtni otpad.",
    examples: ["Ostaci hrane", "Ljuske voća", "Kava", "Vrtni otpad"],
  },
  mixed: {
    id: "mixed",
    name: "Miješani otpad",
    binColor: "Crna kanta",
    binColorHex: "#374151",
    icon: "🗑️",
    explanation: "Otpad koji se ne može reciklirati. Koristi samo kad nema druge opcije.",
    examples: ["Prljava ambalaža", "Korišteni papirnati rubci", "Polomljena keramika"],
  },
};

export const WASTE_CATEGORIES_EN: Record<string, WasteCategory> = {
  batteries: {
    id: "batteries",
    name: "Batteries",
    binColor: "Special drop-off",
    binColorHex: "#DC2626",
    icon: "🔋",
    explanation:
      "Batteries go to drop-off points or shops — never in regular household bins.",
    examples: ["AA batteries", "AAA batteries", "Phone batteries", "Rechargeable batteries"],
  },
  plastic: {
    id: "plastic",
    name: "Plastic & metal",
    binColor: "Yellow bin",
    binColorHex: "#FCD34D",
    icon: "♻️",
    explanation: "Plastic bottles, containers, cans and packaging. Rinse before disposal.",
    examples: ["Plastic bottles", "Food packaging", "Cans", "Plastic packaging"],
  },
  paper: {
    id: "paper",
    name: "Paper & cardboard",
    binColor: "Blue bin",
    binColorHex: "#60A5FA",
    icon: "📄",
    explanation: "Clean paper, newspapers, magazines and cardboard. Keep it dry.",
    examples: ["Newspapers", "Magazines", "Cardboard boxes", "Office paper"],
  },
  glass: {
    id: "glass",
    name: "Glass",
    binColor: "Green bin",
    binColorHex: "#4ADE80",
    icon: "🍾",
    explanation: "Glass bottles and jars. Remove caps before disposal.",
    examples: ["Glass bottles", "Jars", "Wine bottles"],
  },
  textile: {
    id: "textile",
    name: "Textiles",
    binColor: "Textile container",
    binColorHex: "#EC4899",
    icon: "👕",
    explanation: "Old clothes, shoes and fabrics. Donate or use textile containers.",
    examples: ["Clothes", "Shoes", "Bedding", "Towels"],
  },
  bio: {
    id: "bio",
    name: "Organic waste",
    binColor: "Brown bin",
    binColorHex: "#A16207",
    icon: "🍂",
    explanation: "Organic waste: food scraps, fruit peels, garden waste.",
    examples: ["Food scraps", "Peels", "Coffee grounds", "Garden waste"],
  },
  mixed: {
    id: "mixed",
    name: "Residual waste",
    binColor: "Black bin",
    binColorHex: "#374151",
    icon: "🗑️",
    explanation: "Non-recyclable waste. Use only when there’s no better option.",
    examples: ["Soiled packaging", "Tissues", "Broken ceramics"],
  },
};

export function getWasteCategory(id: string, locale: AppLocale = "hr"): WasteCategory | null {
  const table = locale === "en" ? WASTE_CATEGORIES_EN : WASTE_CATEGORIES;
  return table[id] ?? null;
}

// Mock classification function
export function classifyWaste(imageName?: string): WasteCategory {
  // In a real app, this would use ML/AI image recognition
  // For now, we'll return a random category based on the image
  const categories = Object.values(WASTE_CATEGORIES);
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

// Recycling locations in Zagreb
export interface RecyclingLocation {
  id: string;
  name: string;
  type: "bin" | "center";
  address: string;
  lat: number;
  lng: number;
  accepts: string[];
}

export const RECYCLING_LOCATIONS: RecyclingLocation[] = [
  {
    id: "1",
    name: "Reciklažno dvorište Jakuševec",
    type: "center",
    address: "Jakuševac 2, Zagreb",
    lat: 45.7794,
    lng: 15.9997,
    accepts: ["plastic", "paper", "glass", "bio", "mixed"],
  },
  {
    id: "2",
    name: "Reciklažno dvorište Resnik",
    type: "center",
    address: "Resnik bb, Zagreb",
    lat: 45.7456,
    lng: 15.8793,
    accepts: ["plastic", "paper", "glass", "bio", "mixed"],
  },
  {
    id: "3",
    name: "Kontejneri — Trg bana Jelačića",
    type: "bin",
    address: "Trg bana Jelačića, Zagreb",
    lat: 45.8131,
    lng: 15.9778,
    accepts: ["plastic", "paper", "glass"],
  },
  {
    id: "4",
    name: "Kontejneri — Maksimir",
    type: "bin",
    address: "Maksimirski perivoj, Zagreb",
    lat: 45.8294,
    lng: 16.0161,
    accepts: ["plastic", "paper", "glass", "bio"],
  },
  {
    id: "5",
    name: "Kontejneri — Cvjetni trg",
    type: "bin",
    address: "Cvjetni trg, Zagreb",
    lat: 45.8114,
    lng: 15.9739,
    accepts: ["plastic", "paper", "glass"],
  },
];

// Collection schedule data
export interface CollectionDay {
  date: string;
  categories: string[];
}

export function getCollectionSchedule(): CollectionDay[] {
  // Generate schedule for the next 14 days
  const schedule: CollectionDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    
    const categories: string[] = [];
    
    // Monday & Thursday: Plastic & Metal
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      categories.push("plastic");
    }
    
    // Tuesday & Friday: Paper
    if (dayOfWeek === 2 || dayOfWeek === 5) {
      categories.push("paper");
    }
    
    // Wednesday: Glass
    if (dayOfWeek === 3) {
      categories.push("glass");
    }
    
    // Daily: Bio & Mixed
    categories.push("bio", "mixed");
    
    schedule.push({
      date: date.toISOString().split("T")[0],
      categories,
    });
  }
  
  return schedule;
}