"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Mail } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const copy =
    locale === "fr"
      ? {
          title: "Paramètres",
          subtitle: "Gérez votre compte, vos préférences de planification et vos intégrations.",
          navItems: [
            { label: "Général", href: "/settings", icon: Settings },
            { label: "Emails", href: "/settings/emails", icon: Mail }
          ]
        }
      : {
          title: "Settings",
          subtitle: "Manage your account, scheduling preferences, and integrations.",
          navItems: [
            { label: "General", href: "/settings", icon: Settings },
            { label: "Emails", href: "/settings/emails", icon: Mail }
          ]
        };

  return (
    <div className="min-h-full flex flex-col font-sans">
      {/* Settings Navigation Header */}
      <div className="sticky top-0 z-20 bg-[var(--canvas-deep)]/80 backdrop-blur-md border-b border-[var(--line)] px-8 md:px-10 py-6">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--ink)] tracking-tight">{copy.title}</h1>
            <p className="text-sm text-[var(--muted)] mt-1">{copy.subtitle}</p>
          </div>
          
          <nav className="flex gap-1 p-1 bg-white/50 border border-[var(--line)] rounded-xl">
            {copy.navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-md shadow-[rgba(21,184,106,0.2)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white transition-colors"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
