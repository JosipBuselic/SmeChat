import { useLocale } from "../context/LocaleContext";

export type UIStrings = {
  common: {
    loading: string;
    close: string;
  };
  scan: {
    appTitle: string;
    readyTitle: string;
    readySubtitle: string;
    analyzing: string;
    tapScan: string;
    quickTipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    statSorted: string;
    statStreak: string;
    statBadges: string;
  };
  result: {
    back: string;
    detectedLabel: string;
    detectedHint: string;
    greatJob: string;
    pointsEarned: string;
    useBin: string;
    binForType: string;
    examples: string;
    newBadge: string;
    badgeKeepGoing: string;
    scanAnother: string;
    nearestBins: string;
    exceptionConfirm: string;
  };
  profile: {
    title: string;
    defaultName: string;
    level: string;
    levelProgress: string;
    pointsToNext: string;
    streakDays: string;
    streakKeep: string;
    sorted: string;
    pointsTotal: string;
    ecoScore: string;
    byTypeTitle: string;
    pointsPerItem: string;
    pts: string;
    achievements: string;
    unlocked: string;
    shareTitle: string;
    shareSubtitle: string;
    shareBtn: string;
    impactTitle: string;
    water: string;
    trees: string;
    energy: string;
    settingsTitle: string;
    settingsSubtitle: string;
    languageLabel: string;
    langHr: string;
    langEn: string;
    signOut: string;
    signedOutToast: string;
    signOutError: string;
  };
  nav: {
    scan: string;
    map: string;
    calendar: string;
    profile: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    weekdays: string[];
    today: string;
    tomorrow: string;
    todayBadge: string;
    remindersTitle: string;
    remindersText: string;
    remindersBtn: string;
    legendTitle: string;
  };
  map: {
    title: string;
    subtitle: string;
    mapCity: string;
    mapSoon: string;
    allLocations: string;
    nearMe: string;
    legendTitle: string;
    legendCenter: string;
    legendBins: string;
  };
  login: {
    supabaseTitle: string;
    supabaseBody: string;
    loading: string;
    tagline: string;
    google: string;
    googleRedirect: string;
    orEmail: string;
    tabSignIn: string;
    tabSignUp: string;
    email: string;
    password: string;
    signIn: string;
    signInBusy: string;
    signUp: string;
    signUpBusy: string;
    minChars: string;
    footerHint: string;
    toastEmailPwd: string;
    toastPwdLen: string;
    toastConfirmEmail: string;
    toastSignInFail: string;
    toastSignUpFail: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    f1Title: string;
    f1Text: string;
    f2Title: string;
    f2Text: string;
    f3Title: string;
    f3Text: string;
    f4Title: string;
    f4Text: string;
    cta: string;
    footer: string;
  };
  chat: {
    welcomeGemini: string;
    welcomeLocal: string;
    typing: string;
    placeholder: string;
    headerTitle: string;
    headerSub: string;
    quickReplies: string[];
    errorReply: string;
  };
  badges: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
};

const BADGE_KEYS = [
  "first-scan",
  "eco-newbie",
  "eco-warrior",
  "eco-champion",
  "week-streak",
  "month-streak",
] as const;

function badgesHr(): UIStrings["badges"] {
  const o: UIStrings["badges"] = {};
  for (const id of BADGE_KEYS) {
    const map: Record<(typeof BADGE_KEYS)[number], { name: string; description: string }> = {
      "first-scan": { name: "Prvi koraci", description: "Završen prvi sken" },
      "eco-newbie": { name: "Eko početnik", description: "Poredano 10 predmeta" },
      "eco-warrior": { name: "Eko borac", description: "Poredano 50 predmeta" },
      "eco-champion": { name: "Eko prvak", description: "Poredano 100 predmeta" },
      "week-streak": { name: "Tjedni niz", description: "7 dana zaredom" },
      "month-streak": { name: "Mjesečni niz", description: "30 dana zaredom" },
    };
    o[id] = map[id];
  }
  return o;
}

function badgesEn(): UIStrings["badges"] {
  const o: UIStrings["badges"] = {};
  const map: Record<(typeof BADGE_KEYS)[number], { name: string; description: string }> = {
    "first-scan": { name: "First steps", description: "Completed your first scan" },
    "eco-newbie": { name: "Eco newbie", description: "Sorted 10 items" },
    "eco-warrior": { name: "Eco warrior", description: "Sorted 50 items" },
    "eco-champion": { name: "Eco champion", description: "Sorted 100 items" },
    "week-streak": { name: "Week streak", description: "7 days in a row" },
    "month-streak": { name: "Month streak", description: "30 days in a row" },
  };
  for (const id of BADGE_KEYS) o[id] = map[id];
  return o;
}

export const UI_STRINGS: Record<"hr" | "en", UIStrings> = {
  hr: {
    common: {
      loading: "Učitavanje…",
      close: "Zatvori",
    },
    scan: {
      appTitle: "Snap&Sort",
      readyTitle: "Spremni za recikliranje?",
      readySubtitle: "Snimite otpad i saznajte u koji spremnik ide.",
      analyzing: "Analiziram…",
      tapScan: "Dodirni za sken",
      quickTipsTitle: "Brzi savjeti 💡",
      tip1: "Predmet neka bude dobro vidljiv",
      tip2: "Snimaj uz dobru svjetlost",
      tip3: "Prije recikliranja operi ambalažu kad treba",
      statSorted: "Poredano",
      statStreak: "Niz (dani)",
      statBadges: "Značke",
    },
    result: {
      back: "Natrag",
      detectedLabel: "Prepoznata kategorija",
      detectedHint: "Odmah slijedi kratki savjet prije odlaganja.",
      greatJob: "Odlično!",
      pointsEarned: "Osvojili ste +{n} bodova",
      useBin: "Koristi ovaj spremnik:",
      binForType: "Za ovu vrstu otpada",
      examples: "Primjeri:",
      newBadge: "Nova značka!",
      badgeKeepGoing: "Nastavi tako!",
      scanAnother: "Skeniraj još jedan predmet",
      nearestBins: "Najbliži kontejneri",
      exceptionConfirm: "Razumijem",
    },
    profile: {
      title: "Moj profil",
      defaultName: "Eko korisnik",
      level: "Razina {n}",
      levelProgress: "Napredak razine",
      pointsToNext: "{n} bod. do sljedeće razine",
      streakDays: "Niz (dani)",
      streakKeep: "Samo tako dalje! 🔥",
      sorted: "Poredano",
      pointsTotal: "Bodovi ukupno",
      ecoScore: "Eko rezultat",
      byTypeTitle: "Reciklirano po vrstama",
      pointsPerItem: "{n} bodova po predmetu",
      pts: "bod.",
      achievements: "Postignuća",
      unlocked: "✓ Otključano",
      shareTitle: "Podijeli napredak",
      shareSubtitle: "Potakni druge na recikliranje!",
      shareBtn: "Podijeli",
      impactTitle: "Vaš utjecaj (procjena)",
      water: "Ušteda vode",
      trees: "Ušteda drveća",
      energy: "Ušteda energije",
      settingsTitle: "Postavke",
      settingsSubtitle: "Jezik i odjava",
      languageLabel: "Jezik aplikacije",
      langHr: "Hrvatski",
      langEn: "English",
      signOut: "Odjava",
      signedOutToast: "Odjavljeni ste",
      signOutError: "Odjava nije uspjela",
    },
    nav: {
      scan: "Sken",
      map: "Karta",
      calendar: "Kalendar",
      profile: "Profil",
    },
    calendar: {
      title: "Raspored odvoza",
      subtitle: "Pregled po danima (demo, Zagreb)",
      weekdays: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
      today: "Danas",
      tomorrow: "Sutra",
      todayBadge: "Danas",
      remindersTitle: "Podsjetnici",
      remindersText: "Uključi obavijesti da ne propustiš dan odvoza (uskoro).",
      remindersBtn: "Uključi obavijesti",
      legendTitle: "Vrste u kalendaru",
    },
    map: {
      title: "Lokacije u blizini",
      subtitle: "Kontejneri i reciklažna dvorišta",
      mapCity: "Zagreb, Hrvatska",
      mapSoon: "Interaktivna karta (uskoro)",
      allLocations: "Sve lokacije",
      nearMe: "U blizini",
      legendTitle: "Legenda",
      legendCenter: "Reciklažno dvorište",
      legendBins: "Stanica s kontejnerima",
    },
    login: {
      supabaseTitle: "Supabase nije podešen",
      supabaseBody:
        "Dodaj VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY u .env, zatim ponovno pokreni razvojni poslužitelj.",
      loading: "Učitavanje…",
      tagline: "Prijavi se za skeniranje otpada, kartu i praćenje napretka.",
      google: "Nastavi s Googleom",
      googleRedirect: "Preusmjeravanje…",
      orEmail: "ili e-poštom",
      tabSignIn: "Prijava",
      tabSignUp: "Registracija",
      email: "E-mail",
      password: "Lozinka",
      signIn: "Prijavi se",
      signInBusy: "Prijava…",
      signUp: "Otvori račun",
      signUpBusy: "Stvaranje računa…",
      minChars: "Najmanje {n} znakova.",
      footerHint:
        "U Supabaseu: Authentication → Providers — uključi Google i e-poštu (postavi Site URL i redirect URL-ove).",
      toastEmailPwd: "Unesi e-mail i lozinku.",
      toastPwdLen: "Lozinka mora imati najmanje {n} znakova.",
      toastConfirmEmail: "Potvrdi račun putem e-pošte, zatim se prijavi.",
      toastSignInFail: "Prijava nije uspjela",
      toastSignUpFail: "Registracija nije uspjela",
    },
    welcome: {
      title: "Dobro došli u Snap&Sort!",
      subtitle: "Vaš pomoćnik za recikliranje",
      f1Title: "Brza procjena",
      f1Text: "Snimite otpad i odmah dobijete prijedlog kategorije",
      f2Title: "Nizovi dana",
      f2Text: "Reciklirajte svakodnevno i održavajte niz",
      f3Title: "Značke",
      f3Text: "Otključavajte postignuća kako reciklirate više",
      f4Title: "Utjecaj",
      f4Text: "Pratite bodove i osobni doprinos",
      cta: "Započni",
      footer: "Učinimo Zagreb zelenijim! 🌍",
    },
    chat: {
      welcomeGemini:
        "Bok! 👋 Ja sam EKO asistent (Gemini). Pitaj me o recikliranju ili odaberi brzo pitanje.",
      welcomeLocal:
        "Bok! 👋 Ja sam tvoj EKO asistent. Pošalji pitanje o recikliranju ili odaberi brzi odgovor ispod.",
      typing: "Pišem…",
      placeholder: "Pošalji poruku…",
      headerTitle: "EKO asistent",
      headerSub: "Uvijek dostupan",
      quickReplies: [
        "Kako reciklirati plastiku?",
        "Gdje baciti baterije?",
        "Kada se prazne kontejneri?",
        "Što je bio otpad?",
      ],
      errorReply: "Greška pri odgovoru",
    },
    badges: badgesHr(),
  },
  en: {
    common: {
      loading: "Loading…",
      close: "Close",
    },
    scan: {
      appTitle: "Snap&Sort",
      readyTitle: "Ready to recycle?",
      readySubtitle: "Snap a photo and see which bin to use.",
      analyzing: "Analyzing…",
      tapScan: "Tap to scan",
      quickTipsTitle: "Quick tips 💡",
      tip1: "Keep the item clearly visible",
      tip2: "Use good lighting",
      tip3: "Rinse packaging when needed before recycling",
      statSorted: "Sorted",
      statStreak: "Day streak",
      statBadges: "Badges",
    },
    result: {
      back: "Back",
      detectedLabel: "Detected category",
      detectedHint: "A short tip follows before you dispose of it.",
      greatJob: "Great job!",
      pointsEarned: "You earned +{n} points",
      useBin: "Use this bin:",
      binForType: "For this waste type",
      examples: "Examples:",
      newBadge: "New badge!",
      badgeKeepGoing: "Keep it up!",
      scanAnother: "Scan another item",
      nearestBins: "Nearest bins",
      exceptionConfirm: "I understand",
    },
    profile: {
      title: "My profile",
      defaultName: "Eco user",
      level: "Level {n}",
      levelProgress: "Level progress",
      pointsToNext: "{n} pts to next level",
      streakDays: "Day streak",
      streakKeep: "Keep it going! 🔥",
      sorted: "Items sorted",
      pointsTotal: "Total points",
      ecoScore: "Eco score",
      byTypeTitle: "Recycled by type",
      pointsPerItem: "{n} points per item",
      pts: "pts",
      achievements: "Achievements",
      unlocked: "✓ Unlocked",
      shareTitle: "Share your progress",
      shareSubtitle: "Inspire others to recycle!",
      shareBtn: "Share",
      impactTitle: "Your impact (estimate)",
      water: "Water saved",
      trees: "Trees saved",
      energy: "Energy saved",
      settingsTitle: "Settings",
      settingsSubtitle: "Language and sign out",
      languageLabel: "App language",
      langHr: "Hrvatski",
      langEn: "English",
      signOut: "Sign out",
      signedOutToast: "Signed out",
      signOutError: "Sign out failed",
    },
    nav: {
      scan: "Scan",
      map: "Map",
      calendar: "Calendar",
      profile: "Profile",
    },
    calendar: {
      title: "Collection schedule",
      subtitle: "Day-by-day overview (demo, Zagreb)",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      today: "Today",
      tomorrow: "Tomorrow",
      todayBadge: "Today",
      remindersTitle: "Reminders",
      remindersText: "Turn on notifications so you never miss collection day (coming soon).",
      remindersBtn: "Enable notifications",
      legendTitle: "Types in calendar",
    },
    map: {
      title: "Nearby locations",
      subtitle: "Bins and recycling centres",
      mapCity: "Zagreb, Croatia",
      mapSoon: "Interactive map (coming soon)",
      allLocations: "All locations",
      nearMe: "Near me",
      legendTitle: "Legend",
      legendCenter: "Recycling centre",
      legendBins: "Bin station",
    },
    login: {
      supabaseTitle: "Supabase not configured",
      supabaseBody:
        "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.",
      loading: "Loading…",
      tagline: "Sign in to scan waste, use the map, and track progress.",
      google: "Continue with Google",
      googleRedirect: "Redirecting…",
      orEmail: "or with email",
      tabSignIn: "Sign in",
      tabSignUp: "Create account",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signInBusy: "Signing in…",
      signUp: "Create account",
      signUpBusy: "Creating account…",
      minChars: "At least {n} characters.",
      footerHint:
        "In Supabase: Authentication → Providers — enable Google and Email (set Site URL and redirect URLs).",
      toastEmailPwd: "Enter email and password.",
      toastPwdLen: "Password must be at least {n} characters.",
      toastConfirmEmail: "Check your email to confirm your account, then sign in.",
      toastSignInFail: "Sign-in failed",
      toastSignUpFail: "Sign-up failed",
    },
    welcome: {
      title: "Welcome to Snap&Sort!",
      subtitle: "Your recycling assistant",
      f1Title: "Quick sorting",
      f1Text: "Snap waste and get a suggested category right away",
      f2Title: "Streaks",
      f2Text: "Recycle daily and keep your streak",
      f3Title: "Badges",
      f3Text: "Unlock achievements as you recycle more",
      f4Title: "Impact",
      f4Text: "Track points and your personal contribution",
      cta: "Get started",
      footer: "Let’s make Zagreb greener! 🌍",
    },
    chat: {
      welcomeGemini:
        "Hi! 👋 I’m the ECO assistant (Gemini). Ask about recycling or pick a quick question.",
      welcomeLocal:
        "Hi! 👋 I’m your ECO assistant. Send a question or choose a quick reply below.",
      typing: "Typing…",
      placeholder: "Send a message…",
      headerTitle: "ECO assistant",
      headerSub: "Always here",
      quickReplies: [
        "How do I recycle plastic?",
        "Where do batteries go?",
        "When are bins emptied?",
        "What counts as organic waste?",
      ],
      errorReply: "Could not get a reply",
    },
    badges: badgesEn(),
  },
};

export function useUIStrings(): UIStrings {
  const { locale } = useLocale();
  return UI_STRINGS[locale];
}

export function formatStr(template: string, vars: Record<string, string | number>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}
