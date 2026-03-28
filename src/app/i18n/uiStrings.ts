import { useLocale } from "../context/LocaleContext";

export type UIStrings = {
  common: {
    loading: string;
    close: string;
  };
  scan: {
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
    statRewards: string;
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
    newReward: string;
    rewardKeepGoing: string;
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
    achievementsTitle: string;
    rewardsTitle: string;
    rewardsSubtitle: string;
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
    zoneLabel: string;
    /** `{n}` = 1–4 */
    zoneOption: string;
    listTitle: string;
    listWeekEmpty: string;
    useMyLocation: string;
    locating: string;
    locationNoBrowser: string;
    locationErrDenied: string;
    locationErrPosition: string;
    locationErrTimeout: string;
    locationErrNetwork: string;
    locationErrGeocode: string;
    locationErrNotZagreb: string;
    yourAddress: string;
    zoneEstimateLine: string;
    zoneUncertainHint: string;
    scheduleByAddressTitle: string;
    scheduleByAddressSubtitle: string;
    addressSearchLabel: string;
    addressSearchPlaceholder: string;
    addressSearchLoading: string;
    addressHitsEmpty: string;
    addressFetchError: string;
    clearOfficialAddress: string;
    officialScheduleLoading: string;
    zoneIgnoredWhenOfficial: string;
  };
  map: {
    title: string;
    mapHintWithLocation: string;
    mapHintNoLocation: string;
    osmSuffix: string;
    googleMapsSuffix: string;
    loadErrorTitle: string;
    loadErrorGeneric: string;
    binAccessTitle: string;
    binAccessBody: string;
    nearestTitle: string;
    nearMe: string;
    loadingLocations: string;
    noLocations: string;
    openMaps: string;
    legendTitle: string;
    legendGreenIsland: string;
    legendRecyclingYard: string;
    legendUnderground: string;
    legendSemiUnderground: string;
    legendYou: string;
    toastNearMeOk: string;
    toastNearMeFail: string;
    mapLoading: string;
    mapYou: string;
    mapYourLocation: string;
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
    titlePrefix: string;
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
    /** {model} = e.g. gemini-2.5-flash */
    poweredByGemini: string;
    poweredByLocal: string;
  };
  rewards: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
  badges: Record<string, { name: string; description: string }>;
};

const REWARD_KEYS = [
  "coffee-gradska",
  "compost-home",
  "bio-workshop",
  "plastic-partner",
  "battery-bonus",
  "streak-partner",
] as const;

function rewardsHr(): UIStrings["rewards"] {
  const map: Record<(typeof REWARD_KEYS)[number], { name: string; description: string }> = {
    "coffee-gradska": {
      name: "5% popusta na kavu u Gradskoj kavani",
      description: "Napravi najmanje 5 uspješnih skenova otpada kategorije bio.",
    },
    "compost-home": {
      name: "Besplatna isporuka komposta na adresu",
      description: "Napravi najmanje 20 uspješnih skenova otpada kategorije bio.",
    },
    "bio-workshop": {
      name: "Radionica kompostiranja kod kuće",
      description: "Napravi najmanje 40 uspješnih skenova otpada kategorije bio.",
    },
    "plastic-partner": {
      name: "Bon kod partnera za ambalažu",
      description: "Napravi najmanje 12 uspješnih skenova otpada kategorije plastika.",
    },
    "battery-bonus": {
      name: "Bon za predaju EE otpada",
      description: "Napravi najmanje 3 uspješna skena otpada kategorije baterije.",
    },
    "streak-partner": {
      name: "Poklon paket od partnera",
      description: "Recikliraj u aplikaciji barem jedan predmet 7 kalendarskih dana zaredom (niz dana).",
    },
  };
  const o: UIStrings["rewards"] = {};
  for (const id of REWARD_KEYS) o[id] = map[id];
  return o;
}

function rewardsEn(): UIStrings["rewards"] {
  const map: Record<(typeof REWARD_KEYS)[number], { name: string; description: string }> = {
    "coffee-gradska": {
      name: "5% off coffee at Gradska kavana",
      description: "Complete at least 5 successful scans classified as organic (bio) waste.",
    },
    "compost-home": {
      name: "Free compost delivery to your address",
      description: "Complete at least 20 successful scans classified as organic (bio) waste.",
    },
    "bio-workshop": {
      name: "Home composting workshop",
      description: "Complete at least 40 successful scans classified as organic (bio) waste.",
    },
    "plastic-partner": {
      name: "Partner voucher for packaging / recycling",
      description: "Complete at least 12 successful scans classified as plastic waste.",
    },
    "battery-bonus": {
      name: "Voucher for e-waste drop-off",
      description: "Complete at least 3 successful scans classified as batteries.",
    },
    "streak-partner": {
      name: "Partner gift pack",
      description: "Recycle in the app at least one item on 7 consecutive calendar days (keep your day streak).",
    },
  };
  const o: UIStrings["rewards"] = {};
  for (const id of REWARD_KEYS) o[id] = map[id];
  return o;
}

export const UI_STRINGS: Record<"hr" | "en", UIStrings> = {
  hr: {
    common: {
      loading: "Učitavanje…",
      close: "Zatvori",
    },
    scan: {
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
      statRewards: "Nagrade",
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
      newReward: "Nova nagrada!",
      rewardKeepGoing: "Pogledaj profil za detalje iskorištenja kod partnera.",
      newBadge: "Novo postignuće!",
      badgeKeepGoing: "Nastavi skenirati da otključaš još.",
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
      achievementsTitle: "Postignuća",
      rewardsTitle: "Nagrade partnera",
      rewardsSubtitle: "Za otključavanje moraš ispuniti uvjet uz nagradu.",
      unlocked: "✓ Ostvareno",
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
      subtitle: "Lokacija ili zona — procjena odvoza za Zagreb",
      weekdays: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
      today: "Danas",
      tomorrow: "Sutra",
      todayBadge: "Danas",
      remindersTitle: "Podsjetnici",
      remindersText: "Uključi obavijesti da ne propustiš dan odvoza (uskoro).",
      remindersBtn: "Uključi obavijesti",
      zoneLabel: "Zona (kvart)",
      zoneOption: "Zona {n}",
      listTitle: "Odvoz ovaj tjedan",
      listWeekEmpty: "Ovaj tjedan nema najavljenog odvoza za odabranu zonu ili adresu.",
      useMyLocation: "Koristi moju lokaciju",
      locating: "Učitavanje lokacije i adrese…",
      locationNoBrowser: "Preglednik ne podržava geolokaciju.",
      locationErrDenied: "Lokacija je odbijena. Uključi dozvolu u postavkama preglednika.",
      locationErrPosition: "Lokacija nije dostupna. Pokušaj na otvorenom ili kasnije.",
      locationErrTimeout: "Isteklo je vrijeme za lokaciju. Pokušaj ponovno.",
      locationErrNetwork: "Mrežna greška pri određivanju adrese.",
      locationErrGeocode: "Nije pronađena adresa za ove koordinate.",
      locationErrNotZagreb: "Ova funkcija vrijedi za Zagreb — lokacija je izvan grada.",
      yourAddress: "Tvoja adresa (procjena)",
      zoneEstimateLine: "Zona {n} · {area}",
      zoneUncertainHint:
        "Nismo prepoznali gradsku četvrt u podacima karte — odaberi zonu ručno ispod.",
      scheduleByAddressTitle: "Raspored po adresi",
      scheduleByAddressSubtitle: "Upiši ulicu i kućni broj za raspored vezan uz adresu.",
      addressSearchLabel: "Ulica i kućni broj",
      addressSearchPlaceholder: "npr. Ilica 1 ili Dugi dol 5",
      addressSearchLoading: "Pretražujem adrese…",
      addressHitsEmpty: "Nema pogodaka — probaj drugačije napisati ulicu.",
      addressFetchError: "Nije moguće učitati raspored za ovu adresu.",
      clearOfficialAddress: "Ukloni odabranu adresu",
      officialScheduleLoading: "Učitavam raspored…",
      zoneIgnoredWhenOfficial: "Zona se ne koristi dok je učitana adresa s popisa.",
    },
    map: {
      title: "Lokacije u blizini",
      mapHintWithLocation:
        "Vaša pozicija je na karti; popis je poredan prema udaljenosti od vas.",
      mapHintNoLocation:
        "Lokacija nedostupna — poredano od središta grada. Dodirnite „U blizini“ za ponovni pokušaj.",
      osmSuffix: "· OpenStreetMap",
      googleMapsSuffix: "· Google Maps",
      loadErrorTitle: "Greška podataka",
      loadErrorGeneric: "Učitavanje lokacija nije uspjelo",
      binAccessTitle: "Pristup spremnicima",
      binAccessBody:
        "Podzemni i polupodzemni spremnici mogu biti zaključani ili namijenjeni stanovnicima — provjerite na licu mjesta prije odlaska.",
      nearestTitle: "Najbliža mjesta",
      nearMe: "U blizini",
      loadingLocations: "Učitavanje lokacija…",
      noLocations: "Nema lokacija za prikaz.",
      openMaps: "Karta",
      legendTitle: "Legenda",
      legendGreenIsland: "Zeleni otok — staklo / metal / papir",
      legendRecyclingYard: "Reciklažno dvorište",
      legendUnderground: "Podzemni spremnik",
      legendSemiUnderground: "Polupodzemni spremnik",
      legendYou: "Vi (vaša pozicija kada je lokacija uključena)",
      toastNearMeOk: "Poredano prema vašoj lokaciji",
      toastNearMeFail: "Lokacija nije dostupna. Provjerite dozvole preglednika.",
      mapLoading: "Učitavanje karte…",
      mapYou: "Vi",
      mapYourLocation: "Vaša lokacija",
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
      titlePrefix: "Dobro došli u",
      subtitle: "SmeChat — vaš pomoćnik za recikliranje",
      f1Title: "Brza procjena",
      f1Text: "Snimite otpad i odmah dobijete prijedlog kategorije",
      f2Title: "Nizovi dana",
      f2Text: "Reciklirajte svakodnevno i održavajte niz",
      f3Title: "Nagrade",
      f3Text: "Otključavaj popuste i kompost uz dovoljno točnog odvajanja otpada",
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
      poweredByGemini: "Asistent pokreće Google Gemini ({model}).",
      poweredByLocal: "Lokalni demo odgovori (bez Gemini API ključa).",
    },
    rewards: rewardsHr(),
    badges: {
      "first-scan": { name: "Prvi koraci", description: "Završen prvi sken" },
      "eco-newbie": { name: "Eko početnik", description: "Poredano 10 predmeta" },
      "eco-warrior": { name: "Eko borac", description: "Poredano 50 predmeta" },
      "eco-champion": { name: "Eko prvak", description: "Poredano 100 predmeta" },
      "week-streak": { name: "Tjedni niz", description: "7 dana zaredom" },
      "month-streak": { name: "Mjesečni niz", description: "30 dana zaredom" },
    },
  },
  en: {
    common: {
      loading: "Loading…",
      close: "Close",
    },
    scan: {
      readyTitle: "Ready to recycle?",
      readySubtitle: "Take a photo and see which bin to use.",
      analyzing: "Analyzing…",
      tapScan: "Tap to scan",
      quickTipsTitle: "Quick tips 💡",
      tip1: "Keep the item clearly visible",
      tip2: "Use good lighting",
      tip3: "Rinse packaging when needed before recycling",
      statSorted: "Sorted",
      statStreak: "Day streak",
      statRewards: "Rewards",
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
      newReward: "New reward!",
      rewardKeepGoing: "Check your profile for how to redeem with partners.",
      newBadge: "New achievement!",
      badgeKeepGoing: "Keep scanning to unlock more.",
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
      achievementsTitle: "Achievements",
      rewardsTitle: "Partner rewards",
      rewardsSubtitle: "Unlock each reward by meeting the requirement shown below.",
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
      subtitle: "Location or zone — collection estimate for Zagreb",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      today: "Today",
      tomorrow: "Tomorrow",
      todayBadge: "Today",
      remindersTitle: "Reminders",
      remindersText: "Turn on notifications so you never miss collection day (coming soon).",
      remindersBtn: "Enable notifications",
      zoneLabel: "Zone (area)",
      zoneOption: "Zone {n}",
      listTitle: "Collection this week",
      listWeekEmpty: "No collection scheduled this week for your zone or address.",
      useMyLocation: "Use my location",
      locating: "Getting location and address…",
      locationNoBrowser: "Your browser does not support geolocation.",
      locationErrDenied: "Location was denied. Enable permission in browser settings.",
      locationErrPosition: "Location unavailable. Try outdoors or again later.",
      locationErrTimeout: "Location request timed out. Try again.",
      locationErrNetwork: "Network error while resolving the address.",
      locationErrGeocode: "No address found for these coordinates.",
      locationErrNotZagreb: "This feature is for Zagreb — your location seems outside the city.",
      yourAddress: "Your address (estimate)",
      zoneEstimateLine: "Zone {n} · {area}",
      zoneUncertainHint: "We could not map the area from map data — pick a zone below.",
      scheduleByAddressTitle: "Schedule by address",
      scheduleByAddressSubtitle: "Enter street and house number for address-based collection days.",
      addressSearchLabel: "Street and house number",
      addressSearchPlaceholder: "e.g. Ilica 1 or Dugi dol 5",
      addressSearchLoading: "Searching addresses…",
      addressHitsEmpty: "No matches — try a different spelling.",
      addressFetchError: "Could not load the schedule for this address.",
      clearOfficialAddress: "Clear selected address",
      officialScheduleLoading: "Loading schedule…",
      zoneIgnoredWhenOfficial: "Zone is ignored while an address from search is loaded.",
    },
    map: {
      title: "Nearby locations",
      mapHintWithLocation: "Your position is on the map; the list is sorted by distance from you.",
      mapHintNoLocation:
        "Location unavailable — sorted from the city centre. Tap Near me to try again.",
      osmSuffix: "· OpenStreetMap",
      googleMapsSuffix: "· Google Maps",
      loadErrorTitle: "Data error",
      loadErrorGeneric: "Could not load locations",
      binAccessTitle: "Bin access",
      binAccessBody:
        "Underground and semi-underground bins may be locked or for residents only — check on site before you go.",
      nearestTitle: "Nearest places",
      nearMe: "Near me",
      loadingLocations: "Loading locations…",
      noLocations: "No locations to show.",
      openMaps: "Maps",
      legendTitle: "Legend",
      legendGreenIsland: "Green island — glass / metal / paper",
      legendRecyclingYard: "Recycling yard",
      legendUnderground: "Underground bin",
      legendSemiUnderground: "Semi-underground bin",
      legendYou: "You (your position when location is on)",
      toastNearMeOk: "Sorted by your location",
      toastNearMeFail: "Could not get your location. Check browser permissions.",
      mapLoading: "Loading map…",
      mapYou: "You",
      mapYourLocation: "Your location",
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
      titlePrefix: "Welcome to",
      subtitle: "SmeChat — your recycling assistant",
      f1Title: "Quick sorting",
      f1Text: "Photograph waste and get a suggested category right away",
      f2Title: "Streaks",
      f2Text: "Recycle daily and keep your streak",
      f3Title: "Rewards",
      f3Text: "Unlock discounts and compost when you sort waste accurately enough",
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
      poweredByGemini: "Assistant powered by Google Gemini ({model}).",
      poweredByLocal: "Local demo replies (no Gemini API key).",
    },
    rewards: rewardsEn(),
    badges: {
      "first-scan": { name: "First steps", description: "Completed your first scan" },
      "eco-newbie": { name: "Eco newbie", description: "Sorted 10 items" },
      "eco-warrior": { name: "Eco warrior", description: "Sorted 50 items" },
      "eco-champion": { name: "Eco champion", description: "Sorted 100 items" },
      "week-streak": { name: "Week streak", description: "7 days in a row" },
      "month-streak": { name: "Month streak", description: "30 days in a row" },
    },
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
