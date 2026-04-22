"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  CalendarPlus2,
  CalendarSync,
  Loader2,
  Settings2,
  Sparkles,
  Trash2,
  TriangleAlert
} from "lucide-react";
import type {
  FixedEvent,
  GenerateScheduleOutput,
  PlanningPreferences,
  ScheduleBlock,
  Task,
  UnscheduledTask
} from "@/types/planning";
import { useI18n } from "@/components/i18n/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import {
  formatDateShort,
  formatMinutesShort,
  formatTimeOnly,
  fromDatetimeLocalInput,
  getWeekdayOptions,
  groupBlocksByDay,
  minutesToTimeInput,
  priorityLabel,
  priorityTone,
  timeInputToMinutes
} from "@/lib/planning-ui";
import { defaultPreferences } from "@/features/constraints/defaults";

type ScheduleSnapshot = {
  generatedAt: string;
  blocks: ScheduleBlock[];
  unscheduled?: UnscheduledTask[];
  warnings?: string[];
  stats?: GenerateScheduleOutput["stats"];
};

type PreferencesFormState = {
  workdayStart: string;
  workdayEnd: string;
  maxWorkMinutesPerDay: string;
  focusBlockMinutes: string;
  breakMinutes: string;
  bufferMinutesBetweenSessions: string;
  allowedWeekdays: number[];
};

type FixedEventFormState = {
  title: string;
  startAt: string;
  endAt: string;
  location: string;
};

type PlannerWorkspaceProps = {
  initialData?: {
    tasks: Task[];
    fixedEvents: FixedEvent[];
    preferences: PlanningPreferences;
    schedule: ScheduleSnapshot | null;
    feasibility: {
      feasibilityPct: number;
      demandMinutes: number;
      freeMinutes: number;
      warnings: string[];
    } | null;
  };
};

const EMPTY_EVENT_FORM: FixedEventFormState = {
  title: "",
  startAt: "",
  endAt: "",
  location: ""
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

function sumScheduledMinutes(blocks: ScheduleBlock[]): number {
  return blocks.reduce((total, block) => {
    if (block.type !== "task") return total;
    return total + Math.max(0, (Date.parse(block.endAt) - Date.parse(block.startAt)) / 60000);
  }, 0);
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === "done") return 1;
      if (b.status === "done") return -1;
    }

    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.deadline && b.deadline) return Date.parse(a.deadline) - Date.parse(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function sortFixedEvents(events: FixedEvent[]) {
  return [...events].sort((a, b) => a.startAt.localeCompare(b.startAt));
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

function initialSelectedBlockId(schedule: ScheduleSnapshot | null | undefined): string | null {
  return schedule?.blocks.find((block) => block.type === "task")?.id ?? schedule?.blocks[0]?.id ?? null;
}

export function PlannerWorkspace({ initialData }: PlannerWorkspaceProps) {
  const { locale } = useI18n();
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialData?.tasks ?? []));
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>(sortFixedEvents(initialData?.fixedEvents ?? []));
  const [preferences, setPreferences] = useState<PlanningPreferences>(initialData?.preferences ?? defaultPreferences());
  const [preferencesForm, setPreferencesForm] = useState<PreferencesFormState>(
    preferencesToForm(initialData?.preferences ?? defaultPreferences())
  );
  const [eventForm, setEventForm] = useState<FixedEventFormState>(EMPTY_EVENT_FORM);
  const [schedule, setSchedule] = useState<ScheduleSnapshot | null>(initialData?.schedule ?? null);
  const [feasibility, setFeasibility] = useState<{ feasibilityPct: number; demandMinutes: number; freeMinutes: number; warnings: string[] } | null>(
    initialData?.feasibility ?? null
  );
  const [loading, setLoading] = useState(!initialData);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [runningPlanner, setRunningPlanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(initialSelectedBlockId(initialData?.schedule));
  const [showParameters, setShowParameters] = useState(true);
  const [planNeedsRefresh, setPlanNeedsRefresh] = useState(false);
  const weekdayOptions = getWeekdayOptions(locale);
  const copy =
    locale === "fr"
      ? {
          loadError: "Impossible de charger l’espace planning.",
          plannerSaved: "Les paramètres du planificateur ont été enregistrés. Régénérez le planning pour appliquer les nouvelles contraintes.",
          plannerSaveError: "Impossible d’enregistrer les paramètres du planificateur.",
          eventRequired: "Le titre, l’heure de début et l’heure de fin sont obligatoires.",
          eventAdded: "Contrainte fixe ajoutée. Régénérez le planning pour l’intégrer.",
          eventAddError: "Impossible de créer l’événement fixe.",
          eventRemoved: "Événement fixe supprimé. Régénérez le planning si vous souhaitez récupérer ce temps.",
          eventRemoveError: "Impossible de supprimer l’événement fixe.",
          planningGenerated: "Planning généré.",
          planningRegenerated: "Planning régénéré à partir des dernières données.",
          plannerRunError: "Impossible d’exécuter le planificateur.",
          title: "Espace planning",
          subtitle: "Cette page utilise maintenant votre vrai backlog, vos vrais événements fixes et le moteur de planification derrière l’API.",
          hideParameters: "Masquer les paramètres",
          showParameters: "Afficher les paramètres",
          regeneratePlanning: "Régénérer le planning",
          refreshPlanning: "Actualiser le planning",
          generatePlanning: "Générer le planning",
          openBacklog: "Backlog ouvert",
          scheduledWork: "Travail planifié",
          feasibility: "Faisabilité",
          hardConstraints: "Contraintes fortes",
          loading: "Chargement de l’espace planning...",
          taskBacklog: "Backlog des tâches",
          taskBacklogSubtitle: "Éléments vivants du backlog en attente de planification.",
          noOpenTasks: "Aucune tâche ouverte. Ajoutez du travail dans",
          tasksLink: "Tâches",
          left: "restant",
          due: "échéance",
          constraintsTitle: "Contraintes fortes",
          constraintsSubtitle: "Cours, réunions et engagements non déplaçables.",
          noFixedEvents: "Aucun événement fixe pour le moment. Ajoutez votre premier cours ou réunion ci-dessous.",
          remove: "Supprimer",
          addFixedEvent: "Ajouter un événement fixe",
          fixedEventPlaceholder: "Cours de systèmes distribués",
          optionalLocation: "Lieu optionnel",
          addHardConstraint: "Ajouter la contrainte",
          plannerParameters: "Paramètres du planificateur",
          plannerParametersSubtitle: "Heures de travail, blocs de concentration, pauses et jours actifs.",
          start: "Début",
          end: "Fin",
          maxWorkPerDay: "Minutes max de travail / jour",
          focus: "Concentration",
          break: "Pause",
          buffer: "Tampon",
          activeDays: "Jours actifs",
          savePlannerParameters: "Enregistrer les paramètres",
          optimizedSchedule: "Planning optimisé",
          generated: "Généré le",
          noGeneratedSchedule: "Aucun planning généré pour le moment",
          inputsChanged: "Les entrées ont changé. Régénérez pour mettre à jour ce tableau.",
          currentSync: "Le planning actuel est synchronisé avec la dernière exécution.",
          noSchedule: "Aucun planning pour le moment.",
          noScheduleDescription: "Générez le planning pour transformer votre backlog en blocs de temps.",
          scheduledBlocks: "bloc(s) planifié(s)",
          scheduledTaskBlock: "Bloc de tâche planifié.",
          recoveryBlock: "Bloc de contrainte ou de récupération.",
          decisionExplanation: "Explication de décision",
          decisionSubtitle: "Pourquoi le bloc sélectionné existe et ce que le moteur a optimisé.",
          selectedBlock: "Bloc sélectionné",
          reason: "Raison",
          noDetailedReason: "Ce bloc a été enregistré sans explication détaillée.",
          meta: "Métadonnées",
          noMetadata: "Aucune métadonnée supplémentaire sur ce bloc.",
          inspectHint: "Générez un planning et cliquez sur un bloc pour inspecter le raisonnement.",
          engineActivity: "Activité du moteur",
          engineSubtitle: "Avertissements, notes de faisabilité et travail non planifié.",
          noWarnings: "Aucun avertissement pour le moment.",
          unscheduled: "non planifié",
          nextSteps: "Que faire ensuite",
          nextStep1: "Capturez toutes les tâches ouvertes dans le backlog.",
          nextStep2: "Bloquez les cours et réunions comme événements fixes.",
          nextStep3: "Définissez des limites de journée réalistes, puis régénérez.",
          refineBacklog: "Affiner le backlog"
        }
      : {
          loadError: "Could not load the planner workspace.",
          plannerSaved: "Planner parameters saved. Regenerate the schedule to apply the new constraints.",
          plannerSaveError: "Could not save the planner parameters.",
          eventRequired: "Title, start time, and end time are required.",
          eventAdded: "Hard constraint added. Regenerate the schedule to fit around it.",
          eventAddError: "Could not create the fixed event.",
          eventRemoved: "Fixed event removed. Regenerate the schedule if you want to reclaim that time.",
          eventRemoveError: "Could not remove the fixed event.",
          planningGenerated: "Planning generated.",
          planningRegenerated: "Planning regenerated from the latest inputs.",
          plannerRunError: "Could not run the planner.",
          title: "Planning Workspace",
          subtitle: "This page now runs against your real task backlog, your real fixed events, and the scheduling engine behind the API.",
          hideParameters: "Hide parameters",
          showParameters: "Show parameters",
          regeneratePlanning: "Regenerate planning",
          refreshPlanning: "Refresh planning",
          generatePlanning: "Generate planning",
          openBacklog: "Open backlog",
          scheduledWork: "Scheduled work",
          feasibility: "Feasibility",
          hardConstraints: "Hard constraints",
          loading: "Loading planner workspace...",
          taskBacklog: "Task backlog",
          taskBacklogSubtitle: "Live backlog items waiting to be scheduled.",
          noOpenTasks: "No open tasks. Add work in",
          tasksLink: "Tasks",
          left: "left",
          due: "due",
          constraintsTitle: "Hard constraints",
          constraintsSubtitle: "Classes, meetings, and immovable commitments.",
          noFixedEvents: "No fixed events yet. Add your first class or meeting below.",
          remove: "Remove",
          addFixedEvent: "Add fixed event",
          fixedEventPlaceholder: "Distributed systems class",
          optionalLocation: "Optional location",
          addHardConstraint: "Add hard constraint",
          plannerParameters: "Planner parameters",
          plannerParametersSubtitle: "Working hours, focus blocks, breaks, and active days.",
          start: "Start",
          end: "End",
          maxWorkPerDay: "Max work minutes / day",
          focus: "Focus",
          break: "Break",
          buffer: "Buffer",
          activeDays: "Active days",
          savePlannerParameters: "Save planner parameters",
          optimizedSchedule: "Optimized schedule",
          generated: "Generated",
          noGeneratedSchedule: "No generated schedule yet",
          inputsChanged: "Inputs changed. Regenerate to update this board.",
          currentSync: "Current schedule is in sync with the last planner run.",
          noSchedule: "No schedule yet.",
          noScheduleDescription: "Generate planning to turn your backlog into time blocks.",
          scheduledBlocks: "scheduled block(s)",
          scheduledTaskBlock: "Scheduled task block.",
          recoveryBlock: "Constraint or recovery block.",
          decisionExplanation: "Decision explanation",
          decisionSubtitle: "Why the selected block exists and what the engine optimized for.",
          selectedBlock: "Selected block",
          reason: "Reason",
          noDetailedReason: "This block was persisted without a detailed explanation.",
          meta: "Meta",
          noMetadata: "No extra metadata on this block.",
          inspectHint: "Generate a schedule and click a block to inspect the reasoning.",
          engineActivity: "Engine activity",
          engineSubtitle: "Warnings, feasibility notes, and unscheduled work.",
          noWarnings: "No warnings right now.",
          unscheduled: "unscheduled",
          nextSteps: "What to do next",
          nextStep1: "Capture every open task in the backlog.",
          nextStep2: "Block classes and meetings as fixed events.",
          nextStep3: "Set realistic workday limits, then regenerate.",
          refineBacklog: "Refine task backlog"
        };

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [tasksData, fixedEventsData, preferencesData, scheduleData, feasibilityData] = await Promise.all([
        apiRequest<{ tasks: Task[] }>("/api/tasks"),
        apiRequest<{ fixedEvents: FixedEvent[] }>("/api/fixed-events"),
        apiRequest<{ preferences: PlanningPreferences }>("/api/constraints"),
        apiRequest<{ schedule: ScheduleSnapshot | null }>("/api/schedule"),
        apiRequest<{ feasibility: { feasibilityPct: number; demandMinutes: number; freeMinutes: number; warnings: string[] } }>(
          "/api/schedule/feasibility",
          {
            method: "POST",
            body: JSON.stringify({})
          }
        )
      ]);

      const nextTasks = sortTasks(tasksData.tasks ?? []);
      const nextFixedEvents = sortFixedEvents(fixedEventsData.fixedEvents ?? []);
      const nextPreferences = preferencesData.preferences ?? defaultPreferences();
      const nextSchedule = scheduleData.schedule ?? null;

      setTasks(nextTasks);
      setFixedEvents(nextFixedEvents);
      setPreferences(nextPreferences);
      setPreferencesForm(preferencesToForm(nextPreferences));
      setSchedule(nextSchedule);
      setFeasibility(feasibilityData.feasibility ?? null);
      setPlanNeedsRefresh(false);

      const firstTaskBlock = nextSchedule?.blocks.find((block) => block.type === "task") ?? nextSchedule?.blocks[0] ?? null;
      setSelectedBlockId(firstTaskBlock?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialData) {
      loadWorkspace();
    }
  }, []);

  async function savePreferences() {
    setSavingPreferences(true);
    setError(null);
    setNotice(null);

    try {
      const nextPreferences = formToPreferences(preferencesForm, preferences);
      const data = await apiRequest<{ preferences: PlanningPreferences }>("/api/constraints", {
        method: "PUT",
        body: JSON.stringify(nextPreferences)
      });

      setPreferences(data.preferences);
      setPreferencesForm(preferencesToForm(data.preferences));
      setPlanNeedsRefresh(true);

      const nextFeasibility = await apiRequest<{
        feasibility: { feasibilityPct: number; demandMinutes: number; freeMinutes: number; warnings: string[] };
      }>("/api/schedule/feasibility", {
        method: "POST",
        body: JSON.stringify({})
      });

      setFeasibility(nextFeasibility.feasibility);
      setNotice(copy.plannerSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.plannerSaveError);
    } finally {
      setSavingPreferences(false);
    }
  }

  async function createFixedEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingEvent(true);
    setError(null);
    setNotice(null);

    try {
      const payload = {
        title: eventForm.title.trim(),
        startAt: fromDatetimeLocalInput(eventForm.startAt),
        endAt: fromDatetimeLocalInput(eventForm.endAt),
        location: eventForm.location.trim() || null
      };

      if (!payload.title || !payload.startAt || !payload.endAt) {
        throw new Error(copy.eventRequired);
      }

      const data = await apiRequest<{ fixedEvent: FixedEvent }>("/api/fixed-events", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setFixedEvents((current) => sortFixedEvents([...current, data.fixedEvent]));
      setEventForm(EMPTY_EVENT_FORM);
      setPlanNeedsRefresh(true);
      setNotice(copy.eventAdded);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.eventAddError);
    } finally {
      setSavingEvent(false);
    }
  }

  async function deleteFixedEvent(eventId: string) {
    setError(null);
    setNotice(null);

    try {
      await apiRequest(`/api/fixed-events/${eventId}`, { method: "DELETE" });
      setFixedEvents((current) => current.filter((event) => event.id !== eventId));
      setPlanNeedsRefresh(true);
      setNotice(copy.eventRemoved);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.eventRemoveError);
    }
  }

  async function runPlanner(mode: "generate" | "reschedule") {
    setRunningPlanner(true);
    setError(null);
    setNotice(null);

    try {
      const data = await apiRequest<{ schedule: GenerateScheduleOutput }>(
        mode === "reschedule" ? "/api/schedule/reschedule" : "/api/schedule/generate",
        {
          method: "POST",
          body: JSON.stringify({})
        }
      );

      setSchedule(data.schedule);
      setFeasibility((current) => ({
        feasibilityPct: data.schedule.stats.feasibilityPct,
        demandMinutes: current?.demandMinutes ?? 0,
        freeMinutes: current?.freeMinutes ?? 0,
        warnings: current?.warnings ?? []
      }));
      setPlanNeedsRefresh(false);
      setSelectedBlockId(data.schedule.blocks[0]?.id ?? null);
      setNotice(mode === "generate" ? copy.planningGenerated : copy.planningRegenerated);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.plannerRunError);
    } finally {
      setRunningPlanner(false);
    }
  }

  const openTasks = sortTasks(tasks.filter((task) => task.status !== "done" && task.remainingMinutes > 0));
  const dayGroups = groupBlocksByDay(schedule?.blocks ?? [], locale);
  const selectedBlock =
    schedule?.blocks.find((block) => block.id === selectedBlockId) ??
    schedule?.blocks.find((block) => block.type === "task") ??
    schedule?.blocks[0] ??
    null;
  const scheduledMinutes = sumScheduledMinutes(schedule?.blocks ?? []);
  const topWarnings = [...(schedule?.warnings ?? []), ...(feasibility?.warnings ?? [])];

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowParameters((visible) => !visible)}
            className="btn-secondary !px-4 !py-2.5 !text-sm rounded-xl shadow-sm"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            {showParameters ? copy.hideParameters : copy.showParameters}
          </button>

          <button
            type="button"
            onClick={() => runPlanner(schedule ? "reschedule" : "generate")}
            disabled={runningPlanner}
            className="btn-primary !px-4 !py-2.5 !text-sm rounded-xl shadow-md hover:-translate-y-1 disabled:opacity-60"
          >
            {runningPlanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarSync className="mr-2 h-4 w-4" />}
            {schedule ? (planNeedsRefresh ? copy.regeneratePlanning : copy.refreshPlanning) : copy.generatePlanning}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.openBacklog}</p>
          <p className="mt-2 font-display text-3xl font-bold">{openTasks.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.scheduledWork}</p>
          <p className="mt-2 font-display text-3xl font-bold">{formatMinutesShort(scheduledMinutes)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.feasibility}</p>
          <p className="mt-2 font-display text-3xl font-bold">{feasibility?.feasibilityPct ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 text-orange-700 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.hardConstraints}</p>
          <p className="mt-2 font-display text-3xl font-bold">{fixedEvents.length}</p>
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
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
                <p className="text-sm font-semibold">{copy.taskBacklog}</p>
                <p className="text-xs text-[var(--muted)]">{copy.taskBacklogSubtitle}</p>
              </div>

              <div className="max-h-[380px] space-y-3 overflow-y-auto px-4 py-4">
                {openTasks.length === 0 ? (
                  <div className="border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[var(--muted)]">
                    {copy.noOpenTasks} <Link href="/tasks" className="font-semibold text-[var(--ink)] underline">{copy.tasksLink}</Link>.
                  </div>
                ) : (
                  openTasks.slice(0, 8).map((task) => (
                    <div key={task.id} className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{task.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {formatMinutesShort(task.remainingMinutes)} {copy.left}
                            {task.deadline ? ` · ${copy.due} ${formatDateShort(task.deadline, locale)}` : ""}
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

            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
                <p className="text-sm font-semibold">{copy.constraintsTitle}</p>
                <p className="text-xs text-[var(--muted)]">{copy.constraintsSubtitle}</p>
              </div>

              <div className="space-y-3 px-4 py-4">
                {fixedEvents.length === 0 ? (
                  <div className="border border-dashed border-[var(--line)] px-4 py-6 text-sm text-[var(--muted)]">
                    {copy.noFixedEvents}
                  </div>
                ) : (
                  fixedEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{event.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {formatDateShort(event.startAt, locale)} · {formatTimeOnly(event.startAt, locale)} - {formatTimeOnly(event.endAt, locale)}
                          </p>
                          {event.location ? <p className="mt-1 text-xs text-[var(--muted)]">{event.location}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteFixedEvent(event.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {copy.remove}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={createFixedEvent} className="border-t border-[var(--line)] px-4 py-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <CalendarPlus2 className="h-4 w-4" />
                  {copy.addFixedEvent}
                </div>
                <div className="space-y-3">
                  <input
                    value={eventForm.title}
                    onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm"
                    placeholder={copy.fixedEventPlaceholder}
                  />
                  <input
                    type="datetime-local"
                    value={eventForm.startAt}
                    onChange={(event) => setEventForm((current) => ({ ...current, startAt: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={eventForm.endAt}
                    onChange={(event) => setEventForm((current) => ({ ...current, endAt: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm"
                  />
                  <input
                    value={eventForm.location}
                    onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm"
                    placeholder={copy.optionalLocation}
                  />
                  <button type="submit" disabled={savingEvent} className="btn-secondary w-full !py-2.5 !text-sm rounded-xl disabled:opacity-60">
                    {savingEvent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck2 className="mr-2 h-4 w-4" />}
                    {copy.addHardConstraint}
                  </button>
                </div>
              </form>
            </div>

            {showParameters ? (
              <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
                  <p className="text-sm font-semibold">{copy.plannerParameters}</p>
                  <p className="text-xs text-[var(--muted)]">{copy.plannerParametersSubtitle}</p>
                </div>
                <div className="space-y-4 px-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {copy.start}
                      <input
                        type="time"
                        value={preferencesForm.workdayStart}
                        onChange={(event) => setPreferencesForm((current) => ({ ...current, workdayStart: event.target.value }))}
                        className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm font-medium text-[var(--ink)]"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {copy.end}
                      <input
                        type="time"
                        value={preferencesForm.workdayEnd}
                        onChange={(event) => setPreferencesForm((current) => ({ ...current, workdayEnd: event.target.value }))}
                        className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm font-medium text-[var(--ink)]"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    {copy.maxWorkPerDay}
                    <input
                      type="number"
                      min="60"
                      step="15"
                      value={preferencesForm.maxWorkMinutesPerDay}
                      onChange={(event) =>
                        setPreferencesForm((current) => ({ ...current, maxWorkMinutesPerDay: event.target.value }))
                      }
                      className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm font-medium text-[var(--ink)]"
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {copy.focus}
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={preferencesForm.focusBlockMinutes}
                        onChange={(event) =>
                          setPreferencesForm((current) => ({ ...current, focusBlockMinutes: event.target.value }))
                        }
                        className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm font-medium text-[var(--ink)]"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {copy.break}
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={preferencesForm.breakMinutes}
                        onChange={(event) => setPreferencesForm((current) => ({ ...current, breakMinutes: event.target.value }))}
                        className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm font-medium text-[var(--ink)]"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {copy.buffer}
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={preferencesForm.bufferMinutesBetweenSessions}
                        onChange={(event) =>
                          setPreferencesForm((current) => ({
                            ...current,
                            bufferMinutesBetweenSessions: event.target.value
                          }))
                        }
                        className="rounded-lg border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm font-medium text-[var(--ink)]"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{copy.activeDays}</p>
                    <div className="grid grid-cols-4 gap-2">
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
                            className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                              active ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] text-[var(--muted)]"
                            }`}
                          >
                            {weekday.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={savePreferences}
                    disabled={savingPreferences}
                    className="btn-secondary w-full !py-2.5 !text-sm rounded-xl disabled:opacity-60"
                  >
                    {savingPreferences ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {copy.savePlannerParameters}
                  </button>
                </div>
              </div>
            ) : null}
          </aside>

          <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold">{copy.optimizedSchedule}</p>
                <p className="text-sm text-[var(--muted)]">
                  {schedule?.generatedAt ? `${copy.generated} ${formatDateShort(schedule.generatedAt, locale)}` : copy.noGeneratedSchedule}
                </p>
              </div>
              <div className="text-sm text-[var(--muted)]">
                {planNeedsRefresh ? copy.inputsChanged : copy.currentSync}
              </div>
            </div>

            {dayGroups.length === 0 ? (
              <div className="px-6 py-24 text-center">
                <p className="text-lg font-semibold">{copy.noSchedule}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{copy.noScheduleDescription}</p>
              </div>
            ) : (
              <div className="max-h-[1100px] overflow-y-auto px-5 py-5">
                <div className="space-y-8">
                  {dayGroups.map((group) => (
                    <div key={group.key}>
                      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-[var(--line)] bg-white/95 py-3 backdrop-blur">
                        <div>
                          <p className="text-lg font-semibold">{group.label}</p>
                          <p className="text-xs text-[var(--muted)]">{group.blocks.length} {copy.scheduledBlocks}</p>
                        </div>
                        <span className="text-xs font-semibold text-[var(--muted)]">
                          {formatMinutesShort(
                            group.blocks.reduce(
                              (total, block) =>
                                total + Math.max(0, (Date.parse(block.endAt) - Date.parse(block.startAt)) / 60000),
                              0
                            )
                          )}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {group.blocks.map((block) => {
                          const isActive = block.id === selectedBlock?.id;
                          const isTask = block.type === "task";
                          const borderTone =
                            block.type === "fixed_event"
                              ? "border-blue-200 bg-blue-50"
                              : block.type === "break"
                                ? "border-amber-200 bg-amber-50"
                                : "border-emerald-200 bg-emerald-50";

                          return (
                            <button
                              key={block.id}
                              type="button"
                              onClick={() => setSelectedBlockId(block.id)}
                              className={`flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-colors shadow-sm ${
                                isActive ? "border-[var(--ink)] bg-[var(--canvas-deep)]" : borderTone
                              }`}
                            >
                              <div className="w-24 shrink-0 text-xs font-semibold text-[var(--muted)]">
                                <div>{formatTimeOnly(block.startAt, locale)}</div>
                                <div className="mt-1">{formatTimeOnly(block.endAt, locale)}</div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-[var(--ink)]">{block.title}</p>
                                  <span className="border border-[var(--line)] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                                    {blockTypeLabel(block.type, locale)}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                  {block.reason || (isTask ? copy.scheduledTaskBlock : copy.recoveryBlock)}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
                <p className="text-sm font-semibold">{copy.decisionExplanation}</p>
                <p className="text-xs text-[var(--muted)]">{copy.decisionSubtitle}</p>
              </div>
              <div className="space-y-4 px-4 py-4">
                {selectedBlock ? (
                  <>
                    <div className="rounded-lg border border-[var(--line)] px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{copy.selectedBlock}</p>
                      <p className="mt-2 text-sm font-semibold">{selectedBlock.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {formatDateShort(selectedBlock.startAt, locale)} · {formatTimeOnly(selectedBlock.startAt, locale)} - {formatTimeOnly(selectedBlock.endAt, locale)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--line)] px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{copy.reason}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {selectedBlock.reason || copy.noDetailedReason}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--line)] px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{copy.meta}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {selectedBlock.meta ? JSON.stringify(selectedBlock.meta) : copy.noMetadata}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--muted)]">{copy.inspectHint}</p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
                <p className="text-sm font-semibold">{copy.engineActivity}</p>
                <p className="text-xs text-[var(--muted)]">{copy.engineSubtitle}</p>
              </div>
              <div className="space-y-3 px-4 py-4">
                {topWarnings.length === 0 && !(schedule?.unscheduled?.length) ? (
                  <p className="text-sm text-[var(--muted)]">{copy.noWarnings}</p>
                ) : null}

                {topWarnings.map((warning) => (
                  <div key={warning} className="flex gap-3 border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}

                {schedule?.unscheduled?.map((task) => (
                  <div key={task.taskId} className="border border-red-200 bg-red-50 px-3 py-3">
                    <p className="text-sm font-semibold text-red-700">{task.title}</p>
                    <p className="mt-1 text-xs text-red-600">
                      {formatMinutesShort(task.remainingMinutes)} {copy.unscheduled} · {task.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[var(--ink)] px-4 py-4 text-white shadow-xl">
              <p className="text-sm font-semibold">{copy.nextSteps}</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                <li>{copy.nextStep1}</li>
                <li>{copy.nextStep2}</li>
                <li>{copy.nextStep3}</li>
              </ul>
              <Link href="/tasks" className="mt-4 inline-flex text-sm font-semibold text-white underline">
                {copy.refineBacklog}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
