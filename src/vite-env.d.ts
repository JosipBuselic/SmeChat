/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Optional: Google AI key for EKO Asistent (Gemini). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** Optional override; default first try is gemini-2.5-flash (then flash-lite, 1.5-flash). */
  readonly VITE_GEMINI_MODEL?: string;
  /** Optional: Maps JavaScript API key for Leaflet basemap (Google). Without it, the map uses OpenStreetMap. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
<<<<<<< Updated upstream
  /** Optional: Google Cloud Vision API Key for classifying waste from images */
  readonly VITE_GOOGLE_VISION_API_KEY?: string;
=======
<<<<<<< HEAD
  /** Optional: Groq API key for vision-based waste scan. */
  readonly VITE_GROQ_API_KEY?: string;
  /** Optional override for Groq vision model id. */
  readonly VITE_GROQ_VISION_MODEL?: string;
=======
  /** Optional: Google Cloud Vision API Key for classifying waste from images */
  readonly VITE_GOOGLE_VISION_API_KEY?: string;
>>>>>>> 5f02eadf4169b200e23e955d242a155b40fb3ca9
>>>>>>> Stashed changes
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
