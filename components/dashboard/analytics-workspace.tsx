"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Download,
  Loader2,
  Sparkles,
  TrendingUp,
  TriangleAlert
} from "lucide-react";
import type { ScheduleBlock, Task } from "@/types/planning";
import type { DashboardStats } from "@/features/analytics/summary";
import { useI18n } from "@/components/i18n/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import { formatDateShort, formatMinutesShort } from "@/lib/planning-ui";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type ScheduleResponse = {
  generatedAt: string;
  blocks: ScheduleBlock[];
};

type AnalyticsWorkspaceProps = {
  initialData?: {
    tasks: Task[];
    stats: DashboardStats;
    schedule: ScheduleResponse | null;
  };
};

function enumerateDays(rangeDays: number, locale: string) {
  const days: Array<{ key: string; label: string; date: Date }> = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let index = 0; index < rangeDays; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { weekday: "short" }).format(date),
      date
    });
  }

  return days;
}

function computeDailySeries(blocks: ScheduleBlock[], rangeDays: number, locale: string) {
  const days = enumerateDays(rangeDays, locale);
  const daily = new Map(days.map((day) => [day.key, { ...day, focus: 0, support: 0, total: 0 }]));

  for (const block of blocks) {
    const key = new Date(block.startAt).toISOString().slice(0, 10);
    const bucket = daily.get(key);
    if (!bucket) continue;

    const minutes = Math.max(0, (Date.parse(block.endAt) - Date.parse(block.startAt)) / 60000);
    if (block.type === "task") bucket.focus += minutes;
    else bucket.support += minutes;
    bucket.total += minutes;
  }

  return [...daily.values()];
}

export function AnalyticsWorkspace({ initialData }: AnalyticsWorkspaceProps) {
  const { locale } = useI18n();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialData?.tasks ?? []);
  const [stats, setStats] = useState<DashboardStats | null>(initialData?.stats ?? null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(initialData?.schedule ?? null);
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  const [loading, setLoading] = useState(!initialData);
  const [runningPlan, setRunningPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const copy =
    locale === "fr"
      ? {
          loadError: "Impossible de charger l’analytique.",
          exportSuccess: "Rapport analytique exporté.",
          exportError: "Impossible d’exporter l’analytique.",
          actionPlanError: "Impossible de générer le plan d’action.",
          title: "Analytique",
          subtitle: "Cette vue lit votre backlog réel et le planning généré. Utilisez-la pour mesurer la qualité de charge avant de vous engager sur la semaine.",
          exportReport: "Exporter le rapport",
          loading: "Chargement de l’analytique...",
          focusTimeScheduled: "Temps de concentration planifié",
          plannerFeasibility: "Faisabilité du planificateur à",
          completionRate: "Taux d’achèvement",
          completedOf: "terminées sur",
          totalTasks: "tâches totales.",
          burnoutRisk: "Risque de surcharge",
          high: "Élevé",
          medium: "Moyen",
          low: "Faible",
          overloadDaysDetected: "jour(s) dépassent votre limite quotidienne.",
          noOverloadDays: "Aucune journée en surcharge détectée dans le planning actuel.",
          workloadHorizon: "Horizon de charge planifiée",
          workloadSubtitle: "Minutes de tâche contre temps de support sur les {days} prochains jours.",
          latestPlan: "Dernier plan :",
          noGeneratedPlan: "Aucun plan généré",
          noScheduledData: "Aucune donnée planifiée pour le moment.",
          noScheduledDataDescription: "Générez d’abord un plan, puis revenez ici pour le graphique de charge.",
          insights: "Insights",
          peakWorkloadDay: "Jour de charge maximale",
          peakWorkloadText: "porte",
          ofFocusedWork: "de travail concentré.",
          noFocusedDay: "Aucune journée de concentration planifiée pour le moment.",
          backlogPressure: "Pression du backlog",
          tasksStillOpen: "tâche(s) restent ouvertes. Réduisez le périmètre ouvert avant d’ajouter d’autres engagements.",
          overloadSignal: "Signal de surcharge",
          limitsHolding: "Les limites actuelles tiennent.",
          rebalanceWeek: "Rééquilibrez la semaine avant de commencer l’exécution.",
          generateWeeklyActionPlan: "Générer le plan d’action hebdomadaire",
          riskReview: "Revue des risques",
          noOverloadRisk: "Aucune journée en surcharge trouvée dans le plan actuel.",
          exceedsCap: "dépasse la limite de",
          nextActions: "Prochaines actions",
          openPlanner: "Ouvrir le planning",
          refineTasks: "Affiner les tâches",
          tuneConstraints: "Ajuster les contraintes"
        }
      : {
          loadError: "Could not load analytics.",
          exportSuccess: "Analytics report exported.",
          exportError: "Could not export analytics.",
          actionPlanError: "Could not generate the action plan.",
          title: "Analytics",
          subtitle: "This view now reads your live backlog and generated schedule. Use it to measure workload quality before you commit to the week.",
          exportReport: "Export report",
          loading: "Loading analytics...",
          focusTimeScheduled: "Focus time scheduled",
          plannerFeasibility: "Planner feasibility at",
          completionRate: "Completion rate",
          completedOf: "completed of",
          totalTasks: "total tasks.",
          burnoutRisk: "Burnout risk",
          high: "High",
          medium: "Medium",
          low: "Low",
          overloadDaysDetected: "day(s) exceed your daily limit.",
          noOverloadDays: "No overload days detected in the current schedule.",
          workloadHorizon: "Scheduled workload horizon",
          workloadSubtitle: "Task minutes versus support time across the next {days} days.",
          latestPlan: "Latest plan:",
          noGeneratedPlan: "No generated plan",
          noScheduledData: "No scheduled data yet.",
          noScheduledDataDescription: "Generate a plan first, then return here for the workload chart.",
          insights: "Insights",
          peakWorkloadDay: "Peak workload day",
          peakWorkloadText: "carries",
          ofFocusedWork: "of focused work.",
          noFocusedDay: "No scheduled focus day yet.",
          backlogPressure: "Backlog pressure",
          tasksStillOpen: "task(s) are still open. Reduce open scope before adding more commitments.",
          overloadSignal: "Overload signal",
          limitsHolding: "Current limits are holding.",
          rebalanceWeek: "Rebalance the week before execution starts.",
          generateWeeklyActionPlan: "Generate weekly action plan",
          riskReview: "Risk review",
          noOverloadRisk: "No overload days found in the current plan.",
          exceedsCap: "exceeds the cap by",
          nextActions: "Next actions",
          openPlanner: "Open planner",
          refineTasks: "Refine tasks",
          tuneConstraints: "Tune constraints"
        };

  async function loadAnalytics() {
    setLoading(true);
    setError(null);

    try {
      const [tasksData, statsData, scheduleData] = await Promise.all([
        apiRequest<{ tasks: Task[] }>("/api/tasks"),
        apiRequest<{ stats: DashboardStats }>("/api/dashboard/stats"),
        apiRequest<{ schedule: ScheduleResponse | null }>("/api/schedule")
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
      loadAnalytics();
    }
  }, []);

  async function exportReport() {
    try {
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = now.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US");
      
      // Filename as requested: "rapport optitime [date].pdf"
      const fileName = `rapport optitime ${dateStr.replace(/\//g, "-")}.pdf`;

      // Header / Branding
      doc.setFontSize(22);
      doc.setTextColor(21, 184, 106); // OptiTime signature green
      doc.text("OptiTime", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(copy.subtitle.split('.')[0] + '.', 14, 28);
      doc.text(`${dateStr}`, 196, 20, { align: "right" });

      // Performance Summary Section
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(locale === "fr" ? "Résumé de la Performance" : "Performance Summary", 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [[locale === "fr" ? "Indicateur" : "Metric", locale === "fr" ? "Valeur" : "Value"]],
        body: [
          [copy.focusTimeScheduled, formatMinutesShort(stats?.scheduledWorkMinutes ?? 0)],
          [copy.completionRate, `${completionPct}%`],
          [copy.burnoutRisk, overloadRisk],
          [locale === "fr" ? "Tâches en attente" : "Pending Tasks", (stats?.tasksOpen ?? 0).toString()]
        ],
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [21, 184, 106], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 252, 248] }
      });

      // Tasks Detail Section
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(locale === "fr" ? "Détail du Backlog" : "Backlog Details", 14, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        head: [[
          locale === "fr" ? "Tâche" : "Task",
          locale === "fr" ? "Durée" : "Duration",
          locale === "fr" ? "Échéance" : "Deadline",
          locale === "fr" ? "Priorité" : "Priority",
          locale === "fr" ? "Statut" : "Status"
        ]],
        body: tasks.map(task => [
          task.title,
          formatMinutesShort(task.duration),
          task.deadline ? new Date(task.deadline).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US") : "-",
          task.priority.toString(),
          task.status === "done" ? (locale === "fr" ? "Terminé" : "Fait") : (locale === "fr" ? "À faire" : "To do")
        ]),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 250] }
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `OptiTime - Planning Intelligent | Page ${i} / ${pageCount}`,
          105,
          285,
          { align: "center" }
        );
      }

      doc.save(fileName);
      setNotice(copy.exportSuccess);
    } catch (err) {
      console.error("PDF Export Error:", err);
      setError(err instanceof Error ? err.message : copy.exportError);
    }
  }

  async function generateActionPlan() {
    setRunningPlan(true);
    setError(null);
    setNotice(null);

    try {
      await apiRequest("/api/schedule/reschedule", {
        method: "POST",
        body: JSON.stringify({})
      });
      router.push("/planner");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.actionPlanError);
    } finally {
      setRunningPlan(false);
    }
  }

  const series = computeDailySeries(schedule?.blocks ?? [], rangeDays, locale);
  const maxMinutes = Math.max(1, ...series.map((day) => day.total));
  const completionPct =
    tasks.length === 0 ? 100 : Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100);
  const overloadRisk =
    (stats?.overloadDays.length ?? 0) >= 2 ? copy.high : (stats?.overloadDays.length ?? 0) === 1 ? copy.medium : copy.low;
  const bestDay = [...series].sort((a, b) => b.focus - a.focus)[0] ?? null;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
            {[7, 14, 30].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRangeDays(value as 7 | 14 | 30)}
                className={`px-4 py-2 text-sm font-semibold ${
                  rangeDays === value ? "bg-[var(--ink)] text-white" : "text-[var(--muted)]"
                }`}
              >
                {value}d
              </button>
            ))}
          </div>
          <button type="button" onClick={exportReport} className="btn-secondary !px-4 !py-2.5 !text-sm rounded-xl shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            {copy.exportReport}
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.focusTimeScheduled}</p>
              <p className="mt-2 font-display text-3xl font-bold">{formatMinutesShort(stats?.scheduledWorkMinutes ?? 0)}</p>
              <p className="mt-2 flex items-center gap-1 text-sm text-emerald-700">
                <ArrowUpRight className="h-4 w-4" />
                {copy.plannerFeasibility} {stats?.feasibilityPct ?? 0}%
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.completionRate}</p>
              <p className="mt-2 font-display text-3xl font-bold">{completionPct}%</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {tasks.filter((task) => task.status === "done").length} {copy.completedOf} {tasks.length} {copy.totalTasks}
              </p>
            </div>
            <div className={`relative overflow-hidden rounded-2xl px-5 py-5 shadow-sm ${overloadRisk === copy.low ? "border border-[var(--line)] bg-white" : "border border-red-200 bg-red-50"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.burnoutRisk}</p>
              <p className="mt-2 font-display text-3xl font-bold">{overloadRisk}</p>
              <p className={`mt-2 text-sm ${overloadRisk === copy.low ? "text-[var(--muted)]" : "text-red-700"}`}>
                {stats?.overloadDays.length
                  ? `${stats.overloadDays.length} ${copy.overloadDaysDetected}`
                  : copy.noOverloadDays}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-3xl border border-[var(--line)] bg-white px-6 py-6 shadow-sm">
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">{copy.workloadHorizon}</p>
                  <p className="text-sm text-[var(--muted)]">{copy.workloadSubtitle.replace("{days}", String(rangeDays))}</p>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {schedule?.generatedAt ? `${copy.latestPlan} ${formatDateShort(schedule.generatedAt, locale)}` : copy.noGeneratedPlan}
                </div>
              </div>

              {series.every((day) => day.total === 0) ? (
                <div className="px-4 py-16 text-center">
                  <p className="text-lg font-semibold">{copy.noScheduledData}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{copy.noScheduledDataDescription}</p>
                </div>
              ) : (
                <div
                  className="grid min-h-[320px] items-end gap-3 overflow-x-auto"
                  style={{ gridTemplateColumns: `repeat(${series.length}, minmax(56px, 1fr))` }}
                >
                  {series.map((day) => (
                    <div key={day.key} className="flex h-full flex-col justify-end">
                      <div className="relative flex min-h-[220px] items-end justify-center">
                        <div className="flex w-full max-w-[68px] flex-col justify-end border border-[var(--line)] bg-blue-100" style={{ height: `${(day.total / maxMinutes) * 100}%` }}>
                          <div className="w-full bg-[var(--ink)]" style={{ height: `${day.total === 0 ? 0 : (day.focus / day.total) * 100}%` }} />
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold">{day.label}</p>
                        <p className="text-xs text-[var(--muted)]">{formatMinutesShort(Math.round(day.focus))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[var(--ink)] px-5 py-5 text-white shadow-xl">
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--accent)] blur-[80px] opacity-20" />
                <p className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  {copy.insights}
                </p>
                <div className="mt-4 space-y-4 text-sm text-gray-300">
                  <div>
                    <p className="font-semibold text-white">{copy.peakWorkloadDay}</p>
                    <p className="mt-1">
                      {bestDay ? `${formatDateShort(bestDay.date.toISOString(), locale)} ${copy.peakWorkloadText} ${formatMinutesShort(Math.round(bestDay.focus))} ${copy.ofFocusedWork}` : copy.noFocusedDay}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{copy.backlogPressure}</p>
                    <p className="mt-1">
                      {stats?.tasksOpen ?? 0} {copy.tasksStillOpen}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{copy.overloadSignal}</p>
                    <p className="mt-1">
                      {overloadRisk === copy.low ? copy.limitsHolding : copy.rebalanceWeek}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={generateActionPlan}
                  disabled={runningPlan}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
                >
                  {runningPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {copy.generateWeeklyActionPlan}
                </button>
              </div>

              <div className="rounded-3xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
                <p className="text-lg font-semibold">{copy.riskReview}</p>
                <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                  {(stats?.overloadDays.length ?? 0) === 0 ? (
                    <p>{copy.noOverloadRisk}</p>
                  ) : (
                    stats?.overloadDays.map((day) => (
                      <div key={day.day} className="flex gap-2 border border-red-200 bg-red-50 px-3 py-3 text-red-700">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {day.day} {copy.exceedsCap} {formatMinutesShort(day.scheduledMinutes - day.maxMinutes)}.
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--line)] bg-white px-5 py-5 shadow-sm">
                <p className="text-lg font-semibold">{copy.nextActions}</p>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <Link href="/planner" className="rounded-xl border border-[var(--line)] px-4 py-3 font-semibold hover:bg-[var(--canvas-deep)]">
                    {copy.openPlanner}
                  </Link>
                  <Link href="/tasks" className="rounded-xl border border-[var(--line)] px-4 py-3 font-semibold hover:bg-[var(--canvas-deep)]">
                    {copy.refineTasks}
                  </Link>
                  <Link href="/settings" className="rounded-xl border border-[var(--line)] px-4 py-3 font-semibold hover:bg-[var(--canvas-deep)]">
                    {copy.tuneConstraints}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
