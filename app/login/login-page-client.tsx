"use client";

import Link from "next/link";
import Image from "next/image";
import { FlippingCalendar } from "@/components/anim/flipping-calendar";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";

type LoginPageClientProps = {
  authMessage: string | null;
};

export function LoginPageClient({ authMessage }: LoginPageClientProps) {
  const { locale } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy =
    locale === "fr"
      ? {
          back: "Retour à l'accueil",
          title: "Bon retour",
          subtitle: "Connectez-vous à votre compte OptiTime.",
          email: "Adresse email",
          password: "Mot de passe",
          forgot: "Mot de passe oublié ?",
          submit: "Connexion",
          submitting: "Connexion...",
          noAccount: "Vous n'avez pas de compte ?",
          signUp: "Créer un compte",
          loginFailed: "Connexion impossible.",
          hidePassword: "Masquer le mot de passe",
          showPassword: "Afficher le mot de passe",
          panel: "Gardez le temps de votre côté."
        }
      : {
          back: "Back to home",
          title: "Welcome back",
          subtitle: "Sign in to your OptiTime account.",
          email: "Email address",
          password: "Password",
          forgot: "Forgot password?",
          submit: "Sign In",
          submitting: "Signing In...",
          noAccount: "Don't have an account?",
          signUp: "Sign up for free",
          loginFailed: "Login failed.",
          hidePassword: "Hide password",
          showPassword: "Show password",
          panel: "Keep time moving in your favor."
        };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loginFailed);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex text-[var(--ink)]">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24">
        <div className="absolute top-8 right-8">
          <LanguageSwitcher />
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors absolute top-8 left-8">
          <ArrowLeft className="w-4 h-4" /> {copy.back}
        </Link>

        <div className="max-w-md w-full mx-auto mt-16 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-[var(--line)] shadow-sm">
                <Image
                  src="/optiTimeLogo.jpeg"
                  alt="OptiTime Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight">{copy.title}</h1>
            <p className="text-[var(--muted)] text-lg">{copy.subtitle}</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="email">{copy.email}</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold" htmlFor="password">{copy.password}</label>
                <Link href="/forgot-password" title="Recover your password" className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors">{copy.forgot}</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[var(--ink)] transition-colors"
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            {authMessage && !error && (
              <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
                {authMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full !py-4 rounded-xl text-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? copy.submitting : copy.submit}
            </button>
          </form>

          <p className="mt-8 text-center text-[var(--muted)] text-sm">
            {copy.noAccount} <Link href="/signup" className="text-[var(--ink)] font-semibold hover:underline">{copy.signUp}</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-[var(--canvas-deep)] flex-col items-center justify-center relative overflow-hidden border-l border-[var(--line)]">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-[var(--accent)] rounded-full blur-[120px] opacity-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-[var(--secondary)] rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute inset-0 grid-overlay opacity-50"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <FlippingCalendar />
          <h2 className="mt-16 text-3xl font-display font-medium text-[var(--ink)] tracking-tight text-center max-w-sm">
            {copy.panel}
          </h2>
        </div>
      </div>
    </div>
  );
}
