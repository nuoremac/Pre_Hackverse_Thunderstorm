"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);

  // Check if session exists (user should be signed in via recovery link)
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired reset link. Please request a new one.");
        setIsUpdating(false);
      } else {
        setIsUpdating(false);
      }
    };
    checkSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Password updated successfully. Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
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
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight">Set new password</h1>
            <p className="text-[var(--muted)] text-lg">Choose a strong password to protect your account.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="password">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm font-medium pl-12 pr-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[var(--ink)] transition-colors"
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

            {message && (
              <div className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isUpdating || !!error && !message}
              className="btn-primary w-full !py-4 rounded-xl text-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
