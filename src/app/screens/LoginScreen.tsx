import { useEffect, useState } from "react";
import { useNavigate, useLocation, type Location } from "react-router";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import type { Provider } from "@supabase/supabase-js";

const OAUTH_PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
];

function redirectPath(from: Location | undefined): string {
  const path = from?.pathname;
  if (path && path !== "/login") return path + (from?.search ?? "");
  return "/";
}

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, signInWithOAuth, configured } = useAuth();
  const [signingIn, setSigningIn] = useState<Provider | null>(null);

  const from = location.state?.from as Location | undefined;

  useEffect(() => {
    if (loading || !configured) return;
    if (session) {
      navigate(redirectPath(from), { replace: true });
    }
  }, [session, loading, configured, navigate, from]);

  async function handleOAuth(provider: Provider) {
    if (!configured) return;
    setSigningIn(provider);
    try {
      await signInWithOAuth(provider);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign-in failed";
      toast.error(message);
    } finally {
      setSigningIn(null);
    }
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 px-6">
        <Leaf className="w-14 h-14 text-green-600 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          Supabase not configured
        </h1>
        <p className="text-gray-600 text-center text-sm max-w-sm">
          Add{" "}
          <code className="text-xs bg-white/80 px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
          <code className="text-xs bg-white/80 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>{" "}
          to your <code className="text-xs bg-white/80 px-1 rounded">.env</code> file, then
          restart the dev server.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 px-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <Leaf className="w-9 h-9 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Snap&Sort</h1>
        <p className="text-gray-600 text-center text-sm mb-8">
          Sign in to scan waste, view your map, and track progress.
        </p>

        <div className="space-y-3">
          {OAUTH_PROVIDERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              disabled={signingIn !== null}
              onClick={() => void handleOAuth(id)}
              className="w-full py-3.5 px-4 rounded-xl bg-white border border-gray-200 shadow-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {signingIn === id ? "Redirecting…" : label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Enable each provider under Authentication → Providers in your Supabase project.
        </p>
      </motion.div>
    </div>
  );
}
