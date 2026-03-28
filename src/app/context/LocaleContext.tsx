import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppLocale = "hr" | "en";

const STORAGE_KEY = "snap-sort-locale";

function readStoredLocale(): AppLocale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "hr") return v;
  } catch {
    /* ignore */
  }
  return "hr";
}

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  dateLocale: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() =>
    typeof window !== "undefined" ? readStoredLocale() : "hr",
  );

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "hr";
  }, [locale]);

  const dateLocale = locale === "en" ? "en-US" : "hr-HR";

  const value = useMemo(
    () => ({ locale, setLocale, dateLocale }),
    [locale, setLocale, dateLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
