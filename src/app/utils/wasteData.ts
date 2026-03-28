// Waste classification data for Zagreb

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

export function getWasteException(categoryId: string): WasteExceptionInfo {
  const fallback: WasteExceptionInfo = {
    title: "Brzi savjet",
    message:
      "Nisi siguran/na? Provjeri lokalna pravila — krivo sortiranje kvare cijelu skupinu.",
  };
  return WASTE_EXCEPTIONS[categoryId] ?? fallback;
}

export const WASTE_CATEGORIES: Record<string, WasteCategory> = {
  batteries: {
    id: "batteries",
    name: "Batteries",
    binColor: "Special Collection",
    binColorHex: "#DC2626",
    icon: "🔋",
    explanation: "Batteries must be disposed of at special collection points. Never throw them in regular bins as they contain hazardous materials.",
    examples: ["AA batteries", "AAA batteries", "Phone batteries", "Rechargeable batteries"],
  },
  plastic: {
    id: "plastic",
    name: "Plastic & Metal",
    binColor: "Yellow Bin",
    binColorHex: "#FCD34D",
    icon: "♻️",
    explanation: "Plastic bottles, containers, metal cans, and packaging. Rinse before disposal.",
    examples: ["Plastic bottles", "Food containers", "Metal cans", "Plastic packaging"],
  },
  paper: {
    id: "paper",
    name: "Paper & Cardboard",
    binColor: "Blue Bin",
    binColorHex: "#60A5FA",
    icon: "📄",
    explanation: "Clean paper, newspapers, magazines, and cardboard boxes. Keep it dry!",
    examples: ["Newspapers", "Magazines", "Cardboard boxes", "Office paper"],
  },
  glass: {
    id: "glass",
    name: "Glass",
    binColor: "Green Bin",
    binColorHex: "#4ADE80",
    icon: "🍾",
    explanation: "Glass bottles and jars. Remove caps and lids before disposal.",
    examples: ["Glass bottles", "Glass jars", "Wine bottles"],
  },
  textile: {
    id: "textile",
    name: "Textile",
    binColor: "Textile Container",
    binColorHex: "#EC4899",
    icon: "👕",
    explanation: "Old clothes, shoes, and fabrics. Donate or place in textile collection containers.",
    examples: ["Old clothes", "Shoes", "Bed linens", "Towels"],
  },
  bio: {
    id: "bio",
    name: "Bio Waste",
    binColor: "Brown Bin",
    binColorHex: "#A16207",
    icon: "🍂",
    explanation: "Organic waste like food scraps, fruit peels, and garden waste.",
    examples: ["Food scraps", "Fruit peels", "Coffee grounds", "Garden waste"],
  },
  mixed: {
    id: "mixed",
    name: "Mixed Waste",
    binColor: "Black Bin",
    binColorHex: "#374151",
    icon: "🗑️",
    explanation: "Non-recyclable waste. Use this bin only when item can't be recycled.",
    examples: ["Dirty packaging", "Used tissues", "Broken ceramics"],
  },
};

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
    name: "Recycling Center Jakuševec",
    type: "center",
    address: "Jakuševac 2, Zagreb",
    lat: 45.7794,
    lng: 15.9997,
    accepts: ["plastic", "paper", "glass", "bio", "mixed"],
  },
  {
    id: "2",
    name: "Recycling Center Resnik",
    type: "center",
    address: "Resnik bb, Zagreb",
    lat: 45.7456,
    lng: 15.8793,
    accepts: ["plastic", "paper", "glass", "bio", "mixed"],
  },
  {
    id: "3",
    name: "Bin Station - Trg Bana Jelačića",
    type: "bin",
    address: "Trg bana Jelačića, Zagreb",
    lat: 45.8131,
    lng: 15.9778,
    accepts: ["plastic", "paper", "glass"],
  },
  {
    id: "4",
    name: "Bin Station - Maksimir Park",
    type: "bin",
    address: "Maksimirski perivoj, Zagreb",
    lat: 45.8294,
    lng: 16.0161,
    accepts: ["plastic", "paper", "glass", "bio"],
  },
  {
    id: "5",
    name: "Bin Station - Cvjetni Trg",
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