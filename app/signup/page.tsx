"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        startTransition(() => {
          router.push("/dashboard");
          router.refresh();
        });
        return;
      }

      setMessage("Account created. Please check your email to confirm the signup.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex text-[var(--ink)]">
      
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12">
        <Link href="/" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors absolute top-8 left-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        
        <div className="max-w-md w-full mx-auto mt-16 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight">Create an account</h1>
            <p className="text-[var(--muted)] text-lg">Start depending on OptiTime today.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="name">Full name</label>
              <input 
                type="text" 
                id="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="email">Email address</label>
              <input 
                type="email" 
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full !py-4 rounded-xl text-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating..." : "Sign Up Free"}
            </button>
            <p className="text-xs text-[var(--muted)] text-center mt-4">
              By signing up, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/policy" className="underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-8 text-center text-[var(--muted)] text-sm">
            Already have an account? <Link href="/login" className="text-[var(--ink)] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right side: Reassurances / Social Proof */}
      <div className="hidden lg:flex w-1/2 bg-[var(--ink)] flex-col items-center justify-center relative overflow-hidden text-white px-12">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[var(--accent)] rounded-full blur-[150px] opacity-20"></div>
            <div className="absolute inset-0 grid-overlay opacity-30 mix-blend-overlay"></div>
         </div>

         {/* Content */}
         <div className="relative z-10 max-w-lg w-full">
            <h2 className="text-4xl font-display font-medium tracking-tight mb-8">
              Join thousands who have already taken back their time.
            </h2>

            <div className="space-y-6">
              {[
                "Advanced AI automatically assigns tasks based on constraints.",
                "Instantly balances workloads across multiple calendars.",
                "Live priority queues that respond immediately to changes."
              ].map((feat, i) => (
                <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/10 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <p className="text-lg text-gray-300 mt-1 leading-snug">{feat}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
               <p className="italic text-gray-300 mb-4">"OptiTime completely changed how our team approaches deep work. It’s like having an executive assistant that mathematically organizes your day."</p>
               <div className="font-semibold">— Thunderstorm Team</div>
            </div>
         </div>
      </div>
    </div>
  );
}
