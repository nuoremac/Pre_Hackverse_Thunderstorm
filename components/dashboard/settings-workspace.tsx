"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, RefreshCw, Settings2, User, Workflow, Languages } from "lucide-react";
import type { PlanningPreferences } from "@/types/planning";
import type { UserProfile } from "@/types/profile";
import { useI18n } from "@/components/i18n/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import { defaultPreferences } from "@/features/constraints/defaults";
import { getWeekdayOptions, minutesToTimeInput, timeInputToMinutes } from "@/lib/planning-ui";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

type PreferencesFormState = {
  workdayStart: string;
  workdayEnd: string;
  maxWorkMinutesPerDay: string;
  focusBlockMinutes: string;
  breakMinutes: string;
  bufferMinutesBetweenSessions: string;
  allowedWeekdays: number[];
};

type SettingsWorkspaceProps = {
  initialData?: {
    profile: UserProfile;
    preferences: PlanningPreferences;
  };
};

function preferencesToForm(preferences: PlanningPreferences): PreferencesFormState {
  return {
    workdayStart: minutesToTimeInput(preferences.workdayStartMinutes),
    workdayEnd: minutesToTimeInput(preferences.workdayEndMinutes),
    maxWorkMinutesPerDay: String(preferences.maxWorkMinutesPerDay),
    focusBlockMinutes: String(preferences.focusBlockMinutes),
    breakMinutes: String(preferences.breakMinutes),
    bufferMinutesBetweenSessions: String(preferences.bufferMinutesBetweenSessions),
    allowedWeekdays: [...preferences.allowedWeekdays]
  };
}

function formToPreferences(form: PreferencesFormState, current: PlanningPreferences): PlanningPreferences {
  return {
    ...current,
    workdayStartMinutes: timeInputToMinutes(form.workdayStart),
    workdayEndMinutes: timeInputToMinutes(form.workdayEnd),
    maxWorkMinutesPerDay: Number(form.maxWorkMinutesPerDay),
    focusBlockMinutes: Number(form.focusBlockMinutes),
    breakMinutes: Number(form.breakMinutes),
    bufferMinutesBetweenSessions: Number(form.bufferMinutesBetweenSessions),
    allowedWeekdays: [...form.allowedWeekdays].sort((a, b) => a - b)
  };
}

export function SettingsWorkspace({ initialData }: SettingsWorkspaceProps) {
  const { locale } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(initialData?.profile ?? null);
  const [fullName, setFullName] = useState(initialData?.profile.fullName ?? "");
  const [preferences, setPreferences] = useState<PlanningPreferences>(initialData?.preferences ?? defaultPreferences());
  const [preferencesForm, setPreferencesForm] = useState<PreferencesFormState>(
    preferencesToForm(initialData?.preferences ?? defaultPreferences())
  );
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const weekdayOptions = getWeekdayOptions(locale);
  const copy =
    locale === "fr"
      ? {
          loadError: "Impossible de charger les paramètres.",
          saveNotice: "Paramètres enregistrés.",
          saveError: "Impossible d'enregistrer les paramètres.",
          resetNotice: "Les modifications non enregistrées ont été annulées.",
          loading: "Chargement des paramètres...",
          profile: "Profil",
          fullName: "Nom complet",
          emailAddress: "Adresse email",
          mode: "Mode",
          supabase: "Supabase",
          localDemo: "Démo locale",
          refreshSession: "Actualiser les données de session",
          schedulingPreferences: "Préférences de planification",
          workdayStart: "Début de journée",
          workdayEnd: "Fin de journée",
          maxWorkPerDay: "Minutes max de travail / jour",
          focusBlockMinutes: "Minutes de concentration",
          breakMinutes: "Minutes de pause",
          bufferBetweenSessions: "Tampon entre sessions",
          allowedWeekdays: "Jours autorisés",
          workflowShortcuts: "Raccourcis de workflow",
          openPlanner: "Ouvrir le planning",
          openPlannerDescription: "Ajustez les contraintes, ajoutez des événements fixes et regénérez la semaine.",
          reviewBacklog: "Voir le backlog",
          reviewBacklogDescription: "Ajoutez du travail, changez les priorités et marquez l'avancement.",
          emailSettings: "Paramètres email",
          emailSettingsDescription: "Consultez les pages liées à l’authentification et aux emails.",
          reset: "Réinitialiser",
          saveChanges: "Enregistrer les modifications",
          interface: "Interface",
          language: "Langue de l'application",
          languageDescription: "Choisissez la langue de l'interface utilisateur. Ce changement s'appliquera immédiatement."
        }
      : {
          loadError: "Could not load settings.",
          saveNotice: "Settings saved.",
          saveError: "Could not save settings.",
          resetNotice: "Unsaved changes cleared.",
          loading: "Loading settings...",
          profile: "Profile",
          fullName: "Full name",
          emailAddress: "Email address",
          mode: "Mode",
          supabase: "Supabase",
          localDemo: "Local demo",
          refreshSession: "Refresh session data",
          schedulingPreferences: "Scheduling Preferences",
          workdayStart: "Workday start",
          workdayEnd: "Workday end",
          maxWorkPerDay: "Max work minutes / day",
          focusBlockMinutes: "Focus block minutes",
          breakMinutes: "Break minutes",
          bufferBetweenSessions: "Buffer between sessions",
          allowedWeekdays: "Allowed weekdays",
          workflowShortcuts: "Workflow Shortcuts",
          openPlanner: "Open planner",
          openPlannerDescription: "Adjust constraints, add hard events, and regenerate the week.",
          reviewBacklog: "Review backlog",
          reviewBacklogDescription: "Capture work, change priorities, and mark progress.",
          emailSettings: "Email settings",
          emailSettingsDescription: "Review auth and email-related configuration pages.",
          reset: "Reset",
          saveChanges: "Save changes",
          interface: "Interface",
          language: "Application language",
          languageDescription: "Choose your preferred language for the user interface. Changes take effect immediately."
        };

  async function loadSettings() {
    setLoading(true);
    setError(null);

    try {
      const [profileData, preferencesData] = await Promise.all([
        apiRequest<{ profile: UserProfile }>("/api/profile"),
        apiRequest<{ preferences: PlanningPreferences }>("/api/constraints")
      ]);

      setProfile(profileData.profile);
      setFullName(profileData.profile.fullName);
      setPreferences(preferencesData.preferences);
      setPreferencesForm(preferencesToForm(preferencesData.preferences));
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialData) {
      loadSettings();
    }
  }, []);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const nextPreferences = formToPreferences(preferencesForm, preferences);

      const [profileResponse, preferencesResponse] = await Promise.all([
        apiRequest<{ profile: UserProfile }>("/api/profile", {
          method: "PUT",
          body: JSON.stringify({ fullName })
        }),
        apiRequest<{ preferences: PlanningPreferences }>("/api/constraints", {
          method: "PUT",
          body: JSON.stringify(nextPreferences)
        })
      ]);

      setProfile(profileResponse.profile);
      setFullName(profileResponse.profile.fullName);
      setPreferences(preferencesResponse.preferences);
      setPreferencesForm(preferencesToForm(preferencesResponse.preferences));
      setNotice(copy.saveNotice);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    if (!profile) return;
    setFullName(profile.fullName);
    setPreferencesForm(preferencesToForm(preferences));
    setNotice(copy.resetNotice);
    setError(null);
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-8 px-6 py-8 md:px-10">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-[var(--line)] bg-white px-6 py-20 text-sm text-[var(--muted)] shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          {copy.loading}
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-6 py-4">
              <User className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)]">{copy.profile}</h2>
            </div>
            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                {copy.fullName}
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                {copy.emailAddress}
                <input
                  value={profile?.email ?? ""}
                  readOnly
                  className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-[var(--muted)]"
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-lg border border-[var(--line)] px-3 py-2">
                  {copy.mode}: <span className="font-semibold text-[var(--ink)]">{profile?.mode === "supabase" ? copy.supabase : copy.localDemo}</span>
                </span>
                <button
                  type="button"
                  onClick={loadSettings}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--canvas-deep)]"
                >
                  <RefreshCw className="h-4 w-4" />
                  {copy.refreshSession}
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-6 py-4">
              <Languages className="h-4 w-4 text-purple-500" />
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)]">{copy.interface}</h2>
            </div>
            <div className="px-6 py-6 border-b border-[var(--line)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{copy.language}</p>
                  <p className="text-xs text-[var(--muted)]">{copy.languageDescription}</p>
                </div>
                <div className="w-fit">
                   <LanguageSwitcher />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-6 py-4">
              <Settings2 className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)]">{copy.schedulingPreferences}</h2>
            </div>
            <div className="grid gap-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {copy.workdayStart}
                  <input
                    type="time"
                    value={preferencesForm.workdayStart}
                    onChange={(event) => setPreferencesForm((current) => ({ ...current, workdayStart: event.target.value }))}
                    className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {copy.workdayEnd}
                  <input
                    type="time"
                    value={preferencesForm.workdayEnd}
                    onChange={(event) => setPreferencesForm((current) => ({ ...current, workdayEnd: event.target.value }))}
                    className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {copy.maxWorkPerDay}
                  <input
                    type="number"
                    min="60"
                    step="15"
                    value={preferencesForm.maxWorkMinutesPerDay}
                    onChange={(event) =>
                      setPreferencesForm((current) => ({ ...current, maxWorkMinutesPerDay: event.target.value }))
                    }
                    className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {copy.focusBlockMinutes}
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={preferencesForm.focusBlockMinutes}
                    onChange={(event) =>
                      setPreferencesForm((current) => ({ ...current, focusBlockMinutes: event.target.value }))
                    }
                    className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {copy.breakMinutes}
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={preferencesForm.breakMinutes}
                    onChange={(event) => setPreferencesForm((current) => ({ ...current, breakMinutes: event.target.value }))}
                    className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {copy.bufferBetweenSessions}
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={preferencesForm.bufferMinutesBetweenSessions}
                    onChange={(event) =>
                      setPreferencesForm((current) => ({ ...current, bufferMinutesBetweenSessions: event.target.value }))
                    }
                    className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2"
                  />
                </label>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">{copy.allowedWeekdays}</p>
                <div className="flex flex-wrap gap-2">
                  {weekdayOptions.map((weekday) => {
                    const active = preferencesForm.allowedWeekdays.includes(weekday.value);
                    return (
                      <button
                        key={weekday.value}
                        type="button"
                        onClick={() =>
                          setPreferencesForm((current) => ({
                            ...current,
                            allowedWeekdays: active
                              ? current.allowedWeekdays.filter((value) => value !== weekday.value)
                              : [...current.allowedWeekdays, weekday.value]
                          }))
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                          active ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] text-[var(--muted)]"
                        }`}
                      >
                        {weekday.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-6 py-4">
              <Workflow className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)]">{copy.workflowShortcuts}</h2>
            </div>
            <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
              <Link href="/planner" className="rounded-xl border border-[var(--line)] px-4 py-4 transition-colors hover:bg-[var(--canvas-deep)]">
                <p className="text-sm font-semibold">{copy.openPlanner}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{copy.openPlannerDescription}</p>
              </Link>
              <Link href="/tasks" className="rounded-xl border border-[var(--line)] px-4 py-4 transition-colors hover:bg-[var(--canvas-deep)]">
                <p className="text-sm font-semibold">{copy.reviewBacklog}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{copy.reviewBacklogDescription}</p>
              </Link>
              <Link href="/settings/emails" className="rounded-xl border border-[var(--line)] px-4 py-4 transition-colors hover:bg-[var(--canvas-deep)]">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4" />
                  {copy.emailSettings}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">{copy.emailSettingsDescription}</p>
              </Link>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetSettings} className="btn-secondary !px-6 !py-2.5 !text-sm rounded-xl">
              {copy.reset}
            </button>
            <button type="button" onClick={saveSettings} disabled={saving} className="btn-primary !px-6 !py-2.5 !text-sm rounded-xl disabled:opacity-60">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {copy.saveChanges}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
