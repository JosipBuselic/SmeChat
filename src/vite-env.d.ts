/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional: Google AI key for EKO Asistent (Gemini). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** Optional override, e.g. gemini-2.0-flash */
  readonly VITE_GEMINI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
