/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional: Google AI key for EKO Asistent (Gemini). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** Optional override; default first try is gemini-2.5-flash (then flash-lite, 1.5-flash). */
  readonly VITE_GEMINI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
