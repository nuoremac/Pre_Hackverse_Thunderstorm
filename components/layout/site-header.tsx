"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";

export function SiteHeader() {
  const { locale } = useI18n();
  const copy =
    locale === "fr"
      ? {
          pricing: "Tarifs",
          signIn: "Connexion",
          signUp: "Créer un compte"
        }
      : {
          pricing: "Pricing",
          signIn: "Sign In",
          signUp: "Sign Up Free"
        };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(255,255,255,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a className="flex items-center gap-3 group" href="#top">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
            <Image
              src="/optiTimeLogo.jpeg"
              alt="OptiTime Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              OptiTime
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-100 rounded-lg transition-colors"
            href="/pricing"
          >
            {copy.pricing}
          </Link>
          <Link
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-100 rounded-lg transition-colors"
            href="/login"
          >
            {copy.signIn}
          </Link>
          <Link 
            className="btn-primary !px-6 !py-2.5 !text-sm !rounded-full shadow-md shadow-[rgba(21,184,106,0.2)]" 
            href="/signup"
          >
            {copy.signUp}
          </Link>
        </div>
      </div>
    </header>
  );
}
