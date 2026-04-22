"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Settings,
  X
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type DashboardShellProps = {
  children: ReactNode;
  user: {
    fullName: string;
    email: string;
    mode: "supabase" | "dev";
  };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const copy =
    locale === "fr"
      ? {
          workspace: "Espace authentifié",
          demoMode: "Mode démo local",
          menu: "Menu principal",
          signOut: "Se déconnecter",
          signingOut: "Déconnexion...",
          toggleNavigation: "Afficher ou masquer la navigation",
          closeNavigation: "Fermer la navigation",
          navItems: [
            { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
            { href: "/planner", label: "Planning", icon: CalendarDays },
            { href: "/tasks", label: "Tâches", icon: ListTodo },
            { href: "/analytics", label: "Analytique", icon: BarChart3 },
            { href: "/settings", label: "Paramètres", icon: Settings }
          ]
        }
      : {
          workspace: "Authenticated workspace",
          demoMode: "Local demo mode",
          menu: "Main Menu",
          signOut: "Sign out",
          signingOut: "Signing out...",
          toggleNavigation: "Toggle navigation",
          closeNavigation: "Close navigation",
          navItems: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/planner", label: "Planner", icon: CalendarDays },
            { href: "/tasks", label: "Tasks", icon: ListTodo },
            { href: "/analytics", label: "Analytics", icon: BarChart3 },
            { href: "/settings", label: "Settings", icon: Settings }
          ]
        };

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Local mode or missing env: fall through to navigation.
    } finally {
      router.push(user.mode === "supabase" ? "/login" : "/");
      router.refresh();
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--canvas-deep)] text-[var(--ink)]">
      <div className="pointer-events-none fixed right-5 top-5 z-40 hidden md:block">
      </div>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-white/90 px-5 py-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[rgba(21,184,106,0.12)]">
            <Image
              src="/optiTimeLogo.jpeg"
              alt="OptiTime Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">OptiTime</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNavOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white shadow-sm"
            aria-label={copy.toggleNavigation}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--line)] bg-white shadow-xl transition-transform md:translate-x-0 ${
            navOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-[var(--line)] px-6 py-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[rgba(21,184,106,0.12)] transition-transform group-hover:scale-105">
                  <Image
                    src="/optiTimeLogo.jpeg"
                    alt="OptiTime Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-display text-lg font-bold tracking-tight">OptiTime</p>
                  <p className="text-xs text-[var(--muted)]">
                    {user.mode === "supabase" ? copy.workspace : copy.demoMode}
                  </p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6">
              <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                {copy.menu}
              </div>
              <div className="space-y-1">
                {copy.navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[rgba(21,184,106,0.1)] text-[var(--accent-dark)] shadow-sm"
                          : "text-[var(--muted)] hover:bg-gray-100 hover:text-[var(--ink)]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-[var(--accent-dark)]" : "text-gray-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-[var(--line)] px-4 py-4">
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--canvas-deep)] px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 shadow-inner border border-white" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.fullName}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? copy.signingOut : copy.signOut}
              </button>
            </div>
          </div>
        </aside>

        {navOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setNavOpen(false)}
            aria-label={copy.closeNavigation}
          />
        ) : null}

        <main className="min-h-screen flex-1 md:ml-64">
          <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_14%_0%,_rgba(21,184,106,0.06),_transparent_32%),radial-gradient(circle_at_84%_4%,_rgba(72,124,255,0.06),_transparent_30%)]" />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
