"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Sparkles,
  TimerReset
} from "lucide-react";
import type { ScheduleBlock, Task } from "@/types/planning";
import type { DashboardStats } from "@/features/analytics/summary";
import { useI18n } from "@/components/i18n/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import { formatDateShort, formatMinutesShort, formatTimeOnly, priorityLabel, priorityTone } from "@/lib/planning-ui";

type DashboardScheduleResponse = {
  generatedAt: string;
  blocks: ScheduleBlock[];
};

type DashboardOverviewProps = {
  initialData?: {
    tasks: Task[];
    stats: DashboardStats;
    schedule: DashboardScheduleResponse | null;
  };
};

function sortOpenTasks(tasks: Task[]) {
  return [...tasks]
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.deadline && b.deadline) return Date.parse(a.deadline) - Date.parse(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

function blockTypeLabel(type: ScheduleBlock["type"], locale: string) {
  if (locale === "fr") {
    if (type === "fixed_event") return "événement fixe";
    if (type === "break") return "pause";
    return "tâche";
  }

  if (type === "fixed_event") return "fixed event";
  if (type === "break") return "break";
  return "task";
}

export function DashboardOverview({ initialData }: DashboardOverviewProps) {
  const { locale } = useI18n();
  const [tasks, setTasks] = useState<Task[]>(initialData?.tasks ?? []);
  const [stats, setStats] = useState<DashboardStats | null>(initialData?.stats ?? null);
  const [schedule, setSchedule] = useState<DashboardScheduleResponse | null>(initialData?.schedule ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [runningPlanner, setRunningPlanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const copy =
    locale === "fr"
      ? {
          loadError: "Impossible de charger le tableau de bord.",
          planningGenerated: "Le planning a été généré à partir de vos dernières tâches et contraintes.",
          planningError: "Impossible de générer le planning.",
          title: "Tableau de bord",
          subtitle:
            "Votre centre de commande en direct : état du backlog, horizon du planning actuel et prochaines actions pour garder la semaine sous contrôle.",
          reviewBacklog: "Voir le backlog",
          refreshPlanning: "Actualiser le planning",
          generatePlanning: "Générer le planning",
          loading: "Chargement du tableau de bord...",
          scheduledWork: "Travail planifié",
          scheduledWorkDescription: "Temps total de tâches actuellement placé dans le planning.",
          tasksCompleted: "Tâches terminées",
          tasksCompletedDescription: "Progression de réalisation sur le backlog actuel.",
          feasibility: "Faisabilité",
          feasibilityDescription: "Capacité libre disponible par rapport à la charge restante.",
          overloadWarning: "Alerte surcharge",
          yes: "Oui",
          no: "Non",
          overloadNone: "Aucune journée ne dépasse actuellement la limite de travail configurée.",
          upcomingTimeline: "Chronologie à venir",
          upcomingSubtitle: "Les prochains blocs planifiés dans l'ordre chronologique.",
          openPlanner: "Ouvrir le planning",
          noBlocks: "Aucun bloc planifié pour le moment.",
          noBlocksDescription: "Générez un planning pour remplir cette chronologie.",
          hardConstraint: "Contrainte forte.",
          scheduledByPlanner: "Planifié par le moteur.",
          urgentBacklog: "Backlog urgent",
          urgentSubtitle: "Travail prioritaire encore ouvert.",
          seeAll: "Voir tout",
          noOpenTasks: "Aucune tâche ouverte. Le backlog est vide.",
          noDeadline: "Aucune échéance",
          due: "Échéance",
          left: "restant",
          recommendedMove: "Action recommandée",
          emptyBacklogMove: "Votre backlog est vide. Consultez l’analytique ou ajoutez du travail.",
          withPlanMove: "Consultez le planning, vérifiez les alertes de surcharge, puis lancez le premier bloc de travail profond.",
          withoutPlanMove: "Générez le planning maintenant pour transformer le backlog en créneaux concrets.",
          viewAnalytics: "Voir l’analytique",
          capacitySnapshot: "Aperçu de capacité",
          openTasks: "Tâches ouvertes",
          upcomingBlocks: "Blocs à venir",
          status: "Statut",
          needsAttention: "Attention requise",
          withinLimits: "Dans les limites",
          regenerateHint: "Régénérez après avoir ajusté les paramètres ou déplacé des tâches moins prioritaires."
        }
      : {
          loadError: "Could not load the dashboard.",
          planningGenerated: "Planning generated from your latest tasks and constraints.",
          planningError: "Could not generate the schedule.",
          title: "Dashboard",
          subtitle:
            "This is now your live command center: backlog status, current schedule horizon, and the next actions that keep the week under control.",
          reviewBacklog: "Review backlog",
          refreshPlanning: "Refresh planning",
          generatePlanning: "Generate planning",
          loading: "Loading dashboard...",
          scheduledWork: "Scheduled work",
          scheduledWorkDescription: "Total task time currently placed on the schedule.",
          tasksCompleted: "Tasks completed",
          tasksCompletedDescription: "Completion progress across the current backlog.",
          feasibility: "Feasibility",
          feasibilityDescription: "How much free capacity exists versus remaining demand.",
          overloadWarning: "Overload warning",
          yes: "Yes",
          no: "No",
          overloadNone: "No day is currently over the configured work limit.",
          upcomingTimeline: "Upcoming timeline",
          upcomingSubtitle: "The next scheduled blocks in chronological order.",
          openPlanner: "Open planner",
          noBlocks: "No schedule blocks yet.",
          noBlocksDescription: "Generate planning to populate this timeline.",
          hardConstraint: "Hard constraint.",
          scheduledByPlanner: "Scheduled by the planner.",
          urgentBacklog: "Urgent backlog",
          urgentSubtitle: "Highest-priority work still open.",
          seeAll: "See all",
          noOpenTasks: "No open tasks. The backlog is clear.",
          noDeadline: "No deadline",
          due: "Due",
          left: "left",
          recommendedMove: "Recommended next move",
          emptyBacklogMove: "Your backlog is empty. Review analytics or add new work.",
          withPlanMove: "Review the planner, check overload warnings, then start the first deep-work block.",
          withoutPlanMove: "Generate planning now so the backlog becomes concrete time blocks.",
          viewAnalytics: "View analytics",
          capacitySnapshot: "Capacity snapshot",
          openTasks: "Open tasks",
          upcomingBlocks: "Upcoming blocks",
          status: "Status",
          needsAttention: "Needs attention",
          withinLimits: "Within limits",
          regenerateHint: "Regenerate after adjusting parameters or moving low-priority tasks."
        };

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [tasksData, statsData, scheduleData] = await Promise.all([
        apiRequest<{ tasks: Task[] }>("/api/tasks"),
        apiRequest<{ stats: DashboardStats }>("/api/dashboard/stats"),
        apiRequest<{ schedule: DashboardScheduleResponse | null }>("/api/schedule")
      ]);

      setTasks(tasksData.tasks ?? []);
      setStats(statsData.stats ?? null);
      setSchedule(scheduleData.schedule ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialData) {
      loadDashboard();
    }
  }, []);

  async function generatePlanning() {
    setRunningPlanner(true);
    setError(null);
    setNotice(null);

    try {
      await apiRequest("/api/schedule/generate", {
        method: "POST",
        body: JSON.stringify({})
      });

      setNotice(copy.planningGenerated);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.planningError);
    } finally {
      setRunningPlanner(false);
    }
  }

  const openTasks = sortOpenTasks(tasks);
  const upcomingBlocks = [...(schedule?.blocks ?? [])]
    .filter((block) => Date.parse(block.endAt) >= Date.now())
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
    .slice(0, 6);
  const overloadDay = stats?.overloadDays?.[0] ?? null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 pb-24 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tasks" className="btn-secondary !px-5 !py-2.5 !text-sm rounded-xl shadow-sm">
            {copy.reviewBacklog}
          </Link>
          <button
            type="button"
            onClick={generatePlanning}
            disabled={runningPlanner}
            className="btn-primary !px-5 !py-2.5 !text-sm rounded-xl shadow-md hover:-translate-y-1 disabled:opacity-60"
          >
            {runningPlanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {schedule?.blocks?.length ? copy.refreshPlanning : copy.generatePlanning}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-[var(--line)] bg-white px-6 py-20 text-sm text-[var(--muted)] shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          {copy.loading}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                <Clock3 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.scheduledWork}</p>
              <p className="mt-2 font-display text-3xl font-bold">{formatMinutesShort(stats?.scheduledWorkMinutes ?? 0)}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{copy.scheduledWorkDescription}</p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-green-100 bg-green-50">
                <CalendarCheck className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.tasksCompleted}</p>
              <p className="mt-2 font-display text-3xl font-bold">
                {stats?.tasksDone ?? 0} / {stats?.tasksTotal ?? 0}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">{copy.tasksCompletedDescription}</p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.feasibility}</p>
              <p className="mt-2 font-display text-3xl font-bold">{stats?.feasibilityPct ?? 0}%</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{copy.feasibilityDescription}</p>
            </div>

            <div className={`relative overflow-hidden rounded-2xl px-5 py-5 shadow-sm ${overloadDay ? "border border-red-200 bg-red-50/60" : "border border-[var(--line)] bg-white"}`}>
              {overloadDay ? (
                <div className="pointer-events-none absolute -right-4 -top-4 opacity-10">
                  <AlertTriangle className="h-28 w-28 text-red-500" />
                </div>
              ) : null}
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${overloadDay ? "border-red-200 bg-red-100" : "border-gray-200 bg-gray-50"}`}>
                <AlertTriangle className={`h-5 w-5 ${overloadDay ? "text-red-600" : "text-gray-500"}`} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.overloadWarning}</p>
              <p className="mt-2 font-display text-3xl font-bold">{overloadDay ? copy.yes : copy.no}</p>
              <p className={`mt-2 text-sm ${overloadDay ? "text-red-700" : "text-[var(--muted)]"}`}>
                {overloadDay
                  ? `${overloadDay.day} ${locale === "fr" ? "dépasse la limite quotidienne de" : "exceeds the daily limit by"} ${formatMinutesShort(
                      overloadDay.scheduledMinutes - overloadDay.maxMinutes
                    )}.`
                  : copy.overloadNone}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-3xl border border-[var(--line)] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <div>
                  <p className="font-display text-xl font-bold text-[var(--ink)]">{copy.upcomingTimeline}</p>
                  <p className="text-sm text-[var(--muted)]">{copy.upcomingSubtitle}</p>
                </div>
                <Link href="/planner" className="text-sm font-semibold text-[var(--ink)] underline">
                  {copy.openPlanner}
                </Link>
              </div>

              {upcomingBlocks.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <p className="text-lg font-semibold">{copy.noBlocks}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{copy.noBlocksDescription}</p>
                </div>
              ) : (
                <div className="space-y-4 px-5 py-5">
                  {upcomingBlocks.map((block) => (
                    <div key={block.id} className="grid gap-4 rounded-2xl border border-[var(--line)] bg-gray-50/70 px-5 py-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                      <div className="text-sm font-semibold text-[var(--muted)]">
                        <div>{formatDateShort(block.startAt, locale)}</div>
                        <div className="mt-1">
                          {formatTimeOnly(block.startAt, locale)} - {formatTimeOnly(block.endAt, locale)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{block.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {block.reason || (block.type === "fixed_event" ? copy.hardConstraint : copy.scheduledByPlanner)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                        block.type === "fixed_event"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : block.type === "break"
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-green-200 bg-green-50 text-green-700"
                      }`}>
                        <CalendarClock className="h-4 w-4" />
                        {blockTypeLabel(block.type, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-6">
              <div className="rounded-3xl border border-[var(--line)] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                  <div>
                    <p className="font-display text-lg font-bold text-[var(--ink)]">{copy.urgentBacklog}</p>
                    <p className="text-sm text-[var(--muted)]">{copy.urgentSubtitle}</p>
                  </div>
                  <Link href="/tasks" className="text-sm font-semibold text-[var(--ink)] underline">
                    {copy.seeAll}
                  </Link>
                </div>
                <div className="space-y-3 px-5 py-4">
                  {openTasks.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">{copy.noOpenTasks}</p>
                  ) : (
                    openTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="rounded-xl border border-[var(--line)] px-4 py-3 transition-colors hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{task.title}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {task.deadline ? `${copy.due} ${formatDateShort(task.deadline, locale)}` : copy.noDeadline} · {formatMinutesShort(task.remainingMinutes)} {copy.left}
                            </p>
                          </div>
                          <span className={`border px-2 py-1 text-[11px] font-bold ${priorityTone(task.priority)}`}>
                            {priorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[var(--ink)] px-5 py-5 text-white shadow-xl">
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--accent)] blur-[80px] opacity-20" />
                <p className="flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  {copy.recommendedMove}
                </p>
                <p className="mt-3 text-sm text-gray-300">
                  {openTasks.length === 0
                    ? copy.emptyBacklogMove
                    : schedule?.blocks?.length
                      ? copy.withPlanMove
                      : copy.withoutPlanMove}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/planner" className="border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                    {copy.openPlanner}
                  </Link>
                  <Link href="/analytics" className="border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                    {copy.viewAnalytics}
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
                <p className="flex items-center gap-2 text-lg font-semibold">
                  <TimerReset className="h-5 w-5" />
                  {copy.capacitySnapshot}
                </p>
                <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                  <p>{copy.openTasks}: <span className="font-semibold text-[var(--ink)]">{stats?.tasksOpen ?? 0}</span></p>
                  <p>{copy.upcomingBlocks}: <span className="font-semibold text-[var(--ink)]">{upcomingBlocks.length}</span></p>
                  <p>
                    {copy.status}:{" "}
                    <span className={`font-semibold ${overloadDay ? "text-red-700" : "text-emerald-700"}`}>
                      {overloadDay ? copy.needsAttention : copy.withinLimits}
                    </span>
                  </p>
                  {overloadDay ? (
                    <p className="flex gap-2 text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {copy.regenerateHint}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
