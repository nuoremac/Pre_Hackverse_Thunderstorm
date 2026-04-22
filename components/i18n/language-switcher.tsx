"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
  compact?: boolean;
};

export function LanguageSwitcher({ variant = "light", compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();
  const label = locale === "fr" ? "Langue" : "Lang";

  const baseTone =
    variant === "dark"
      ? "border-white/20 bg-white/12 text-white shadow-lg shadow-black/10"
      : "border-gray-300 bg-white text-[var(--ink)] shadow-sm";

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold backdrop-blur ${baseTone}`}
    >
      <Languages className="h-4 w-4 shrink-0" />
      {!compact ? <span className={variant === "dark" ? "text-gray-200" : "text-[var(--muted)]"}>{label}</span> : null}
      <select
        aria-label="Language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as "en" | "fr")}
        className={`cursor-pointer bg-transparent text-sm font-semibold outline-none ${variant === "dark" ? "text-white" : "text-[var(--ink)]"}`}
      >
        <option value="en" className="text-[var(--ink)]">
          EN
        </option>
        <option value="fr" className="text-[var(--ink)]">
          FR
        </option>
      </select>
    </label>
  );
}
