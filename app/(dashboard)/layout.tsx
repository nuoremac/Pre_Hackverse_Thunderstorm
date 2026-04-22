"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, ListTodo, BarChart2, Settings, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/planner", icon: CalendarDays, label: "Planner" },
  { href: "/tasks", icon: ListTodo, label: "Backlog Tasks" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[var(--canvas-deep)] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[var(--line)] flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo Handle */}
          <Link href="/" className="flex items-center gap-3 px-6 py-6 border-b border-[var(--line)] group">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(21,184,106,0.12)] text-[var(--accent-dark)] transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
            </span>
            <p className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">OptiTime</p>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-3 py-6">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-[rgba(21,184,106,0.1)] text-[var(--accent-dark)] shadow-sm" 
                      : "text-[var(--muted)] hover:bg-gray-100 hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[var(--accent-dark)]" : "text-gray-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--line)]">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:bg-gray-100 hover:text-[var(--ink)] transition-colors">
            <Settings className="w-5 h-5 text-gray-400" /> Settings
          </Link>
          <button
            type="button"
            onClick={async () => {
              try {
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
              } finally {
                router.push("/login");
                router.refresh();
              }
            }}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5 text-red-500" /> Sign Out
          </button>

          <div className="mt-4 flex items-center gap-3 px-3 py-2 bg-[var(--canvas-deep)] rounded-xl border border-[var(--line)]">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 shadow-inner border border-white"></div>
             <div>
               <p className="text-xs font-bold text-[var(--ink)]">Thunderstorm User</p>
               <p className="text-[10px] text-[var(--muted)]">Pro Plan</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Payload */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Background Gradients spanning the whole dashboard backend */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_14%_0%,_rgba(21,184,106,0.06),_transparent_32%),radial-gradient(circle_at_84%_4%,_rgba(72,124,255,0.06),_transparent_30%)]" />
        {children}
      </main>
      
    </div>
  );
}
