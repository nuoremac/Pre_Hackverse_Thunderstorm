"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSiteUrl } from "@/lib/site-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteUrl()}/auth/confirm?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("Check your email for the password reset link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex text-[var(--ink)]">
      <div className="w-full flex flex-col justify-center px-8 sm:px-16 xl:px-24">
        <Link href="/login" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors absolute top-8 left-8">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="max-w-md w-full mx-auto">
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
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight">Forgot password?</h1>
            <p className="text-[var(--muted)] text-lg">Enter your email and we'll send you a recovery link.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="email">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm font-medium pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            {message && (
              <div className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 rounded-xl text-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send recovery link"}
            </button>
          </form>

          <p className="mt-8 text-center text-[var(--muted)] text-sm">
            Remembered your password? <Link href="/login" className="text-[var(--ink)] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
