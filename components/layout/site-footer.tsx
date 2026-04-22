"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/i18n-provider";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: FacebookIcon
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: InstagramIcon
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: YouTubeIcon
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com",
    icon: TikTokIcon
  }
];

export function SiteFooter() {
  const { locale } = useI18n();
  const copy =
    locale === "fr"
      ? {
          ctaTitle: "Arrêtez de vous battre contre votre calendrier.",
          ctaTitle2: "Laissez OptiTime s'en charger.",
          ctaDescription:
            "Découvrez une couche de planification qui équilibre votre concentration, vos réunions et vos habitudes personnelles de façon intuitive.",
          ctaButton: "Découvrir la planification intelligente",
          brandDescription:
            "Un moteur de planification dynamique pour les étudiants et les équipes qui doivent organiser leur temps autour de vraies contraintes, pas d'agendas idéalisés. Protégez automatiquement votre temps de concentration.",
          featuresLabel: "Fonctionnalités",
          connectLabel: "Réseaux",
          copyright: "© 2026 OptiTime Inc. Défend les emplois du temps partout.",
          privacy: "Politique de confidentialité",
          terms: "Conditions d'utilisation",
          pageLinks: [
            { label: "Planning", href: "/planner" },
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Tâches", href: "/tasks" },
            { label: "Analytique", href: "/analytics" }
          ]
        }
      : {
          ctaTitle: "Stop fighting your calendar.",
          ctaTitle2: "Let OptiTime handle it.",
          ctaDescription:
            "Experience the scheduling layer that works exactly the way you need it to, balancing focus time, meetings, and personal habits intuitively.",
          ctaButton: "Discover Smart Scheduling",
          brandDescription:
            "A dynamic scheduling engine for students and teams who need to plan around real constraints, not idealized calendars. Protect your focus time automatically.",
          featuresLabel: "Platform Features",
          connectLabel: "Connect",
          copyright: "© 2026 OptiTime Inc. Defending schedules everywhere.",
          privacy: "Privacy Policy",
          terms: "Terms of Service",
          pageLinks: [
            { label: "Planner", href: "/planner" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Tasks", href: "/tasks" },
            { label: "Analytics", href: "/analytics" }
          ]
        };

  return (
    <footer className="section-shell !pt-0 mt-12 bg-white relative">
      <div className="mx-auto max-w-7xl pt-16 pb-12">
        
        {/* Dynamic call to action with AI image */}
        <div className="bg-gradient-to-r from-[rgba(21,184,106,0.05)] to-transparent rounded-3xl p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-10 border border-[rgba(21,184,106,0.15)] shadow-sm">
          <div className="max-w-xl">
            <h3 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)] mb-4 leading-tight">
              {copy.ctaTitle} <br/>
              {copy.ctaTitle2}
            </h3>
            <p className="text-lg text-[var(--muted)] mb-8">
              {copy.ctaDescription}
            </p>
            <a href="/planner" className="btn-primary shadow-xl shadow-[rgba(21,184,106,0.2)] hover:shadow-none hover:scale-[0.98] transition-all">
              {copy.ctaButton}
            </a>
          </div>
          <div className="relative w-full md:w-1/2 flex justify-center">
            <div className="relative w-[340px] h-[340px] overflow-hidden rounded-[2rem] shadow-2xl transform rotate-y-[-5deg] rotate-x-[5deg] scale-100 transition-transform hover:scale-105 duration-500 border border-[rgba(255,255,255,0.6)]">
               <Image 
                 src="/footer-calendar-girl.png" 
                 alt="African girl dynamically planning her weekly calendar" 
                 fill
                 className="object-cover"
               />
            </div>
            {/* Absolute floating shapes for a modern SaaS feel */}
            <div className="absolute -z-10 top-[-30px] right-[0px] w-32 h-32 bg-[var(--accent)] rounded-full blur-[64px] opacity-30 animate-pulse"></div>
            <div className="absolute -z-10 bottom-[-30px] left-[0px] w-40 h-40 bg-blue-500 rounded-full blur-[64px] opacity-20"></div>
          </div>
        </div>

        <div className="grid gap-10 border-t border-[var(--line)] pt-16 md:grid-cols-[1.15fr_0.8fr_1fr]">
          <div className="max-w-md">
            <div className="font-display text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)] flex items-center gap-2">
              <div className="relative w-6 h-6 overflow-hidden rounded-[4px]">
                <Image
                  src="/optiTimeLogo.jpeg"
                  alt="OptiTime Logo"
                  fill
                  className="object-cover"
                />
              </div>
              OptiTime
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              {copy.brandDescription}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {copy.featuresLabel}
            </p>
            <div className="mt-5 flex flex-col gap-4 text-sm text-[var(--ink)]">
              {copy.pageLinks.map((link) => (
                <Link
                  key={link.label}
                  className="transition-colors hover:text-[var(--accent)] w-max font-medium"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {copy.connectLabel}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    aria-label={social.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.88)] text-[var(--ink)] transition-all hover:border-[rgba(21,184,106,0.4)] hover:bg-[rgba(21,184,106,0.05)] hover:-translate-y-1 hover:text-[var(--accent-dark)] shadow-sm"
                    href={social.href}
                    rel="noreferrer"
                    target="_blank"
                    title={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--line)] pt-8 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>{copy.copyright}</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/policy" className="hover:text-[var(--ink)] transition-colors">{copy.privacy}</Link>
            <Link href="/terms" className="hover:text-[var(--ink)] transition-colors">{copy.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V9c0-.9.3-1.5 1.6-1.5H17V4.7c-.3 0-.9-.1-2-.1-2.8 0-4.5 1.7-4.5 4.8v1.5H7.8V14h2.7v8h3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.6 7.7a2.9 2.9 0 0 0-2-2C17.8 5.2 12 5.2 12 5.2s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2C2 9.5 2 12 2 12s0 2.5.4 4.3a2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2c.4-1.8.4-4.3.4-4.3s0-2.5-.4-4.3ZM10 15.3V8.7L15.5 12 10 15.3Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.7 3h2.5c.2 1 .8 1.9 1.6 2.6.9.7 1.9 1.1 3 1.2v2.6c-1.3 0-2.5-.3-3.6-.9l-.9-.5v7.1c0 1.5-.5 2.8-1.6 3.8a5.5 5.5 0 0 1-3.9 1.5c-1.5 0-2.8-.5-3.9-1.5a5.2 5.2 0 0 1-1.6-3.8c0-1.5.5-2.8 1.6-3.8a5.5 5.5 0 0 1 3.9-1.5c.3 0 .6 0 .9.1v2.7a3.2 3.2 0 0 0-.9-.1c-.7 0-1.3.2-1.8.7-.5.4-.7 1-.7 1.8 0 .7.2 1.3.7 1.8.5.4 1.1.7 1.8.7s1.3-.2 1.8-.7c.5-.5.7-1.1.7-1.8V3Z" />
    </svg>
  );
}
