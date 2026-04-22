"use client";

import Link from "next/link";
import { FlippingCalendar } from "@/components/anim/flipping-calendar";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex text-[var(--ink)]">
      
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24">
        <Link href="/" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors absolute top-8 left-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        
        <div className="max-w-md w-full mx-auto mt-16 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight">Welcome back</h1>
            <p className="text-[var(--muted)] text-lg">Sign in to your OptiTime account.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="email">Email address</label>
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
                <label className="block text-sm font-semibold" htmlFor="password">Password</label>
                <Link href="#" className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)]">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm font-medium"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full !py-4 rounded-xl text-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-[var(--muted)] text-sm">
            Don't have an account? <Link href="/signup" className="text-[var(--ink)] font-semibold hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>

      {/* Right side: Dynamic Visual */}
      <div className="hidden lg:flex w-1/2 bg-[var(--canvas-deep)] flex-col items-center justify-center relative overflow-hidden border-l border-[var(--line)]">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-[var(--accent)] rounded-full blur-[120px] opacity-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-[var(--secondary)] rounded-full blur-[100px] opacity-10"></div>
            
            {/* Grid */}
            <div className="absolute inset-0 grid-overlay opacity-50"></div>
         </div>

         {/* Visual Content */}
         <div className="relative z-10 flex flex-col items-center">
            <FlippingCalendar />
            <h2 className="mt-16 text-3xl font-display font-medium text-[var(--ink)] tracking-tight text-center max-w-sm">
              Keep time moving <br/>
              in your favor.
            </h2>
         </div>
      </div>
    </div>
  );
}
