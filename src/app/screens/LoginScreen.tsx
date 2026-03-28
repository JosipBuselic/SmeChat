import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useLocation, type Location } from "react-router";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatStr, useUIStrings } from "../i18n/uiStrings";
import type { Provider } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

function redirectPath(from: Location | undefined): string {
  const path = from?.pathname;
  if (path && path !== "/login") return path + (from?.search ?? "");
  return "/";
}

const MIN_PASSWORD_LEN = 6;

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const ui = useUIStrings();
  const {
    session,
    loading,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
    configured,
  } = useAuth();
  const [signingIn, setSigningIn] = useState<Provider | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      const message = e instanceof Error ? e.message : ui.login.toastSignInFail;
      toast.error(message);
    } finally {
      setSigningIn(null);
    }
  }

  function validateEmailForm(): boolean {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      toast.error(ui.login.toastEmailPwd);
      return false;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      toast.error(formatStr(ui.login.toastPwdLen, { n: MIN_PASSWORD_LEN }));
      return false;
    }
    return true;
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!configured || !validateEmailForm()) return;
    setEmailBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      const message = err instanceof Error ? err.message : ui.login.toastSignInFail;
      toast.error(message);
    } finally {
      setEmailBusy(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    if (!configured || !validateEmailForm()) return;
    setEmailBusy(true);
    try {
      const { needsEmailConfirmation } = await signUpWithEmail(email.trim(), password);
      if (needsEmailConfirmation) {
        toast.success(ui.login.toastConfirmEmail);
        setPassword("");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : ui.login.toastSignUpFail;
      toast.error(message);
    } finally {
      setEmailBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 px-6">
        <Leaf className="w-14 h-14 text-green-600 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          {ui.login.supabaseTitle}
        </h1>
        <p className="text-gray-600 text-center text-sm max-w-sm">{ui.login.supabaseBody}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <p className="text-gray-600">{ui.common.loading}</p>
      </div>
    );
  }

  if (session) {
    return null;
  }

  const oauthDisabled = signingIn !== null || emailBusy;

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
        <p className="text-gray-600 text-center text-sm mb-6">
          {ui.login.tagline}
        </p>

        <button
          type="button"
          disabled={oauthDisabled}
          onClick={() => void handleOAuth("google")}
          className="w-full py-3.5 px-4 rounded-xl bg-white border border-gray-200 shadow-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 transition-colors mb-6"
        >
          {signingIn === "google" ? ui.login.googleRedirect : ui.login.google}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-gradient-to-b from-green-50 to-blue-50 px-2 text-gray-500">
              {ui.login.orEmail}
            </span>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 h-auto p-1">
            <TabsTrigger value="signin" className="rounded-lg py-2">
              {ui.login.tabSignIn}
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg py-2">
              {ui.login.tabSignUp}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-0">
            <form onSubmit={(e) => void handleSignIn(e)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-gray-700">
                  {ui.login.email}
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl bg-white border-gray-200 h-11"
                  disabled={emailBusy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-gray-700">
                  {ui.login.password}
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-white border-gray-200 h-11"
                  disabled={emailBusy}
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-11 font-semibold"
                disabled={emailBusy || signingIn !== null}
              >
                {emailBusy ? ui.login.signInBusy : ui.login.signIn}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form onSubmit={(e) => void handleSignUp(e)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-700">
                  {ui.login.email}
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl bg-white border-gray-200 h-11"
                  disabled={emailBusy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-700">
                  {ui.login.password}
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-white border-gray-200 h-11"
                  disabled={emailBusy}
                />
                <p className="text-xs text-gray-500">
                  {formatStr(ui.login.minChars, { n: MIN_PASSWORD_LEN })}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-11 font-semibold"
                disabled={emailBusy || signingIn !== null}
              >
                {emailBusy ? ui.login.signUpBusy : ui.login.signUp}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-gray-500 text-center mt-6">{ui.login.footerHint}</p>
      </motion.div>
    </div>
  );
}
