/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional: Google AI key for the ECO assistant (Gemini chat). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** Optional override; default first try is gemini-2.5-flash (then flash-lite, 1.5-flash). */
  readonly VITE_GEMINI_MODEL?: string;
  /** Optional: Maps JavaScript API key for Leaflet basemap (Google). Without it, the map uses OpenStreetMap. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  /** Optional: Google Cloud Vision API key for scan (label detection → waste category). */
  readonly VITE_GOOGLE_VISION_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
