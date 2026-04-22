"use client";

import { useState, useEffect } from "react";
import { MockPlanner } from "@/components/calendar/mock-planner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Zap, ShieldCheck, RefreshCw, BarChart2, CalendarDays } from "lucide-react";

const focusWords = ["Deep Work.", "Team Syncs.", "Assignments.", "Life Habits."];

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[var(--accent-dark)]" />,
    title: "Defend Your Time",
    description: "Hard constraints ensure your classes, meetings, and habits are never paved over."
  },
  {
    icon: <BrainCircuitIcon />,
    title: "Smart Priorities",
    description: "An algorithmic engine scores urgency so you always know what to tackle first."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-[var(--accent-dark)]" />,
    title: "Auto Rescheduling",
    description: "Missed a session? The engine dynamically rebuilds your week to prevent logjams."
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-[var(--accent-dark)]" />,
    title: "Prevent Overload",
    description: "Feasibility checks warn you when tasks exceed your available free hours."
  }
];

function BrainCircuitIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent-dark)]"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/><path d="M16 8V5a2 2 0 0 1 2-2"/><circle cx="16" cy="13" r=".5"/><circle cx="18" cy="3" r=".5"/><circle cx="20" cy="21" r=".5"/><circle cx="20" cy="8" r=".5"/></svg>
  );
}

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % focusWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main id="top" className="relative overflow-hidden bg-[#FAFBFA]">
      <SiteHeader />

      {/* Hero Section */}
      <section className="section-shell pb-16 pt-8 md:pt-12">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="reveal-up z-10">
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-[var(--ink)] md:text-7xl">
              Automate your schedule for <br />
              <span className="text-[var(--accent-dark)] transition-all duration-300">
                 {focusWords[wordIndex]}
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              OptiTime isn't a to-do list. It automatically slots tasks into your calendar, scores their priority, and dynamically rebalances your week—all so you get your focus time back.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a className="btn-primary flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(21,184,106,0.3)] hover:shadow-[0_15px_40px_rgba(21,184,106,0.4)] transition-all hover:-translate-y-1 py-4 px-8 text-lg rounded-xl" href="/planner">
                <CalendarDays className="w-5 h-5" /> Start completely free
              </a>
            </div>
            
            <p className="mt-5 text-sm text-[var(--muted)] font-medium">Join busy students and teams protecting their time.</p>
          </div>

          <div className="reveal-up delay-1 perspective-1000">
            <div className="transform md:-rotate-y-6 md:rotate-x-6 hover:rotate-y-0 transition-transform duration-700 hover:scale-[1.02] shadow-[0_30px_80px_rgba(0,0,0,0.12)] rounded-[2rem] overflow-hidden border border-white/40">
              <MockPlanner />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section id="platform" className="section-shell pt-16 md:pt-24 border-t border-[rgba(21,184,106,0.1)] bg-white">
        <div className="mx-auto max-w-7xl text-center reveal-up">
           <h2 className="font-display text-4xl font-bold tracking-tight text-[var(--ink)] md:text-5xl mb-6">
             Built to balance workloads in real-time.
           </h2>
           <p className="mx-auto max-w-2xl text-lg text-[var(--muted)] mb-16">
             Say goodbye to manually shuffling calendar blocks. Our algorithm identifies your free time, respects your hard limits, and schedules the exact right task for the exact right moment.
           </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4 reveal-up delay-2">
          {features.map((feature) => (
            <div key={feature.title} className="bg-[#fafbfa] p-8 rounded-3xl border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow hover:bg-white hover:border-[rgba(21,184,106,0.2)]">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--ink)] mb-3">{feature.title}</h3>
              <p className="text-[var(--muted)] leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Simplified CTA Section */}
      <section className="section-shell pt-24 pb-20">
         <div className="mx-auto max-w-4xl text-center reveal-up bg-[var(--ink)] text-white p-12 md:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-[var(--accent)] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl mb-6 relative z-10">
              Your schedule should work for you.
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto relative z-10">
              Instantly structure your week mathematically without losing control of your habits.
            </p>
            <a className="btn-primary bg-white text-[var(--ink)] hover:bg-[var(--accent)] hover:text-white border-2 border-white transition-all text-lg px-8 py-4 px-10 relative z-10 inline-flex items-center gap-2" href="/planner">
              Launch OptiTime
            </a>
         </div>
      </section>

      <SiteFooter />
    </main>
  );
}
