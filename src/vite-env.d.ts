/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional: Google AI key for EKO Asistent (Gemini). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** Optional override, e.g. gemini-2.0-flash */
  readonly VITE_GEMINI_MODEL?: string;
  /** Optional: Maps JavaScript API key for Leaflet basemap (Google). Without it, the map uses OpenStreetMap. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
