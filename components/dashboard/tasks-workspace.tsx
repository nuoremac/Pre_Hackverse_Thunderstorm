"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import type { PreferredTimeOfDay, Task, TaskStatus } from "@/types/planning";
import { useI18n } from "@/components/i18n/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import {
  formatDeadlineLabel,
  formatMinutesShort,
  fromDatetimeLocalInput,
  priorityLabel,
  priorityTone,
  statusLabel,
  toDatetimeLocalInput
} from "@/lib/planning-ui";

type TaskFormState = {
  title: string;
  description: string;
  category: string;
  deadline: string;
  estimatedMinutes: string;
  remainingMinutes: string;
  priority: string;
  difficulty: string;
  preferredTimeOfDay: PreferredTimeOfDay;
  splittable: boolean;
  status: TaskStatus;
};

type TasksWorkspaceProps = {
  initialData?: {
    tasks: Task[];
  };
};

const EMPTY_FORM: TaskFormState = {
  title: "",
  description: "",
  category: "",
  deadline: "",
  estimatedMinutes: "90",
  remainingMinutes: "",
  priority: "3",
  difficulty: "3",
  preferredTimeOfDay: "any",
  splittable: true,
  status: "todo"
};

function taskToForm(task: Task): TaskFormState {
  return {
    title: task.title,
    description: task.description ?? "",
    category: task.category ?? "",
    deadline: toDatetimeLocalInput(task.deadline),
    estimatedMinutes: String(task.estimatedMinutes),
    remainingMinutes: String(task.remainingMinutes),
    priority: String(task.priority),
    difficulty: String(task.difficulty),
    preferredTimeOfDay: task.preferredTimeOfDay ?? "any",
    splittable: task.splittable,
    status: task.status
  };
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

function preferredTimeLabel(value: PreferredTimeOfDay, locale: string) {
  if (locale === "fr") {
    if (value === "morning") return "matin";
    if (value === "afternoon") return "après-midi";
    if (value === "evening") return "soir";
    return "n'importe quand";
  }

  if (value === "morning") return "morning";
  if (value === "afternoon") return "afternoon";
  if (value === "evening") return "evening";
  return "any";
}

export function TasksWorkspace({ initialData }: TasksWorkspaceProps) {
  const { locale } = useI18n();
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialData?.tasks ?? []));
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);
  const copy =
    locale === "fr"
      ? {
          loadError: "Impossible de charger les tâches.",
          titleRequired: "Le titre de la tâche est obligatoire.",
          updated: "Tâche mise à jour.",
          created: "Tâche créée.",
          saveError: "Impossible d'enregistrer la tâche.",
          movedTo: "Tâche déplacée vers",
          statusUpdateError: "Impossible de mettre à jour le statut de la tâche.",
          deleted: "Tâche supprimée.",
          deleteError: "Impossible de supprimer la tâche.",
          title: "Backlog des tâches",
          subtitle: "Capturez le travail, priorisez-le, puis envoyez-le au planificateur. Le backlog est maintenant connecté à votre API.",
          openPlanner: "Ouvrir le planning",
          addTask: "Ajouter une tâche",
          openTasks: "Tâches ouvertes",
          remainingWork: "Travail restant",
          completed: "Terminées",
          editTask: "Modifier la tâche",
          newTask: "Nouvelle tâche",
          updateBacklogItem: "Mettre à jour l'élément",
          createBacklogItem: "Créer un élément",
          cancel: "Annuler",
          saveChanges: "Enregistrer",
          createTask: "Créer la tâche",
          taskTitle: "Titre de la tâche",
          taskTitlePlaceholder: "Préparer la présentation de systèmes distribués",
          category: "Catégorie",
          categoryPlaceholder: "Ingénierie, école, admin...",
          description: "Description",
          descriptionPlaceholder: "Ajoutez du contexte pour le planificateur et pour vous.",
          deadline: "Échéance",
          status: "Statut",
          todo: "À faire",
          inProgress: "En cours",
          done: "Terminé",
          estimatedMinutes: "Minutes estimées",
          remainingMinutes: "Minutes restantes",
          remainingPlaceholder: "Par défaut : durée estimée",
          priority: "Priorité",
          difficulty: "Difficulté",
          preferredTimeOfDay: "Moment préféré de la journée",
          anyTime: "N'importe quand",
          morning: "Matin",
          afternoon: "Après-midi",
          evening: "Soir",
          splittable: "Autoriser le planificateur à couper cette tâche en plusieurs blocs",
          searchPlaceholder: "Rechercher par titre, catégorie ou description",
          allStatuses: "Tous les statuts",
          refresh: "Actualiser",
          loading: "Chargement de votre backlog...",
          noMatches: "Aucune tâche ne correspond aux filtres actuels.",
          noMatchesDescription: "Ajoutez une tâche ou effacez la recherche pour remplir le backlog.",
          noDescription: "Aucune description fournie.",
          leftOf: "restant sur",
          uncategorized: "Sans catégorie",
          start: "Démarrer",
          markDone: "Marquer terminé",
          reopen: "Rouvrir",
          edit: "Modifier",
          delete: "Supprimer",
          showing: "Affichage de",
          of: "sur",
          tasksLabel: "tâches",
          openWorkRemaining: "Travail ouvert restant"
        }
      : {
          loadError: "Could not load tasks.",
          titleRequired: "Task title is required.",
          updated: "Task updated.",
          created: "Task created.",
          saveError: "Could not save the task.",
          movedTo: "Task moved to",
          statusUpdateError: "Could not update the task status.",
          deleted: "Task deleted.",
          deleteError: "Could not delete the task.",
          title: "Task Backlog",
          subtitle: "Capture work, prioritize it, then send it to the planner. The backlog is now live against your API.",
          openPlanner: "Open Planner",
          addTask: "Add Task",
          openTasks: "Open Tasks",
          remainingWork: "Remaining Work",
          completed: "Completed",
          editTask: "Edit task",
          newTask: "New task",
          updateBacklogItem: "Update backlog item",
          createBacklogItem: "Create backlog item",
          cancel: "Cancel",
          saveChanges: "Save changes",
          createTask: "Create task",
          taskTitle: "Task title",
          taskTitlePlaceholder: "Prepare distributed systems presentation",
          category: "Category",
          categoryPlaceholder: "Engineering, school, admin...",
          description: "Description",
          descriptionPlaceholder: "Add context for the scheduler and for yourself.",
          deadline: "Deadline",
          status: "Status",
          todo: "To do",
          inProgress: "In progress",
          done: "Done",
          estimatedMinutes: "Estimated minutes",
          remainingMinutes: "Remaining minutes",
          remainingPlaceholder: "Defaults to estimated time",
          priority: "Priority",
          difficulty: "Difficulty",
          preferredTimeOfDay: "Preferred time of day",
          anyTime: "Any time",
          morning: "Morning",
          afternoon: "Afternoon",
          evening: "Evening",
          splittable: "Allow the planner to split this task into multiple blocks",
          searchPlaceholder: "Search by title, category, or description",
          allStatuses: "All statuses",
          refresh: "Refresh",
          loading: "Loading your backlog...",
          noMatches: "No tasks match your current filters.",
          noMatchesDescription: "Add a task or clear the search to populate the backlog.",
          noDescription: "No description provided.",
          leftOf: "left of",
          uncategorized: "Uncategorized",
          start: "Start",
          markDone: "Mark done",
          reopen: "Reopen",
          edit: "Edit",
          delete: "Delete",
          showing: "Showing",
          of: "of",
          tasksLabel: "tasks",
          openWorkRemaining: "Open work remaining"
        };

  const deferredSearch = useDeferredValue(search);

  async function loadTasks() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<{ tasks: Task[] }>("/api/tasks");
      setTasks(sortTasks(data.tasks ?? []));
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialData) {
      loadTasks();
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        deadline: fromDatetimeLocalInput(form.deadline),
        estimatedMinutes: Number(form.estimatedMinutes),
        remainingMinutes: form.remainingMinutes.trim() ? Number(form.remainingMinutes) : undefined,
        priority: Number(form.priority),
        difficulty: Number(form.difficulty),
        preferredTimeOfDay: form.preferredTimeOfDay,
        splittable: form.splittable,
        status: form.status
      };

      if (!payload.title) throw new Error(copy.titleRequired);

      if (editingTaskId) {
        const data = await apiRequest<{ task: Task }>(`/api/tasks/${editingTaskId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setTasks((current) => sortTasks(current.map((task) => (task.id === editingTaskId ? data.task : task))));
        setNotice(copy.updated);
      } else {
        const data = await apiRequest<{ task: Task }>("/api/tasks", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setTasks((current) => sortTasks([...current, data.task]));
        setNotice(copy.created);
      }

      setForm(EMPTY_FORM);
      setFormOpen(false);
      setEditingTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function updateTaskStatus(task: Task, nextStatus: TaskStatus) {
    setError(null);
    setNotice(null);

    try {
      const payload =
        nextStatus === "done"
          ? { status: nextStatus, remainingMinutes: 0 }
          : { status: nextStatus, remainingMinutes: task.remainingMinutes > 0 ? task.remainingMinutes : task.estimatedMinutes };

      const data = await apiRequest<{ task: Task }>(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      setTasks((current) => sortTasks(current.map((item) => (item.id === task.id ? data.task : item))));
      setNotice(`${copy.movedTo} ${statusLabel(nextStatus, locale).toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.statusUpdateError);
    }
  }

  async function removeTask(taskId: string) {
    setError(null);
    setNotice(null);

    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== taskId));
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setFormOpen(false);
        setForm(EMPTY_FORM);
      }
      setNotice(copy.deleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.deleteError);
    }
  }

  function beginCreate() {
    setEditingTaskId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setNotice(null);
  }

  function beginEdit(task: Task) {
    setEditingTaskId(task.id);
    setForm(taskToForm(task));
    setFormOpen(true);
    setNotice(null);
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
    const haystack = `${task.title} ${task.category ?? ""} ${task.description ?? ""}`.toLowerCase();
    const matchesSearch = haystack.includes(deferredSearch.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openTasks = tasks.filter((task) => task.status !== "done");
  const totalOpenMinutes = openTasks.reduce((total, task) => total + task.remainingMinutes, 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/planner" className="btn-secondary !px-5 !py-2.5 !text-sm rounded-xl shadow-sm">
            {copy.openPlanner}
          </Link>
          <button type="button" onClick={beginCreate} className="btn-primary !px-5 !py-2.5 !text-sm rounded-xl shadow-md hover:-translate-y-1">
            <Plus className="mr-2 h-4 w-4" />
            {copy.addTask}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.openTasks}</p>
          <p className="mt-2 font-display text-3xl font-bold">{openTasks.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.remainingWork}</p>
          <p className="mt-2 font-display text-3xl font-bold">{formatMinutesShort(totalOpenMinutes)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{copy.completed}</p>
          <p className="mt-2 font-display text-3xl font-bold">{tasks.filter((task) => task.status === "done").length}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
      ) : null}

      {formOpen ? (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {editingTaskId ? copy.editTask : copy.newTask}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{editingTaskId ? copy.updateBacklogItem : copy.createBacklogItem}</h2>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingTaskId(null);
                  setForm(EMPTY_FORM);
                }}
                className="btn-secondary !px-4 !py-2.5 !text-sm rounded-xl"
              >
                {copy.cancel}
              </button>
              <button type="submit" disabled={saving} className="btn-primary !px-4 !py-2.5 !text-sm rounded-xl disabled:opacity-60">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingTaskId ? copy.saveChanges : copy.createTask}
              </button>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.taskTitle}
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
                placeholder={copy.taskTitlePlaceholder}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.category}
              <input
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
                placeholder={copy.categoryPlaceholder}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
              {copy.description}
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-28 rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
                placeholder={copy.descriptionPlaceholder}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.deadline}
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.status}
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
              >
                <option value="todo">{copy.todo}</option>
                <option value="in_progress">{copy.inProgress}</option>
                <option value="done">{copy.done}</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.estimatedMinutes}
              <input
                type="number"
                min="15"
                step="15"
                value={form.estimatedMinutes}
                onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.remainingMinutes}
              <input
                type="number"
                min="0"
                step="15"
                value={form.remainingMinutes}
                onChange={(event) => setForm((current) => ({ ...current, remainingMinutes: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
                placeholder={copy.remainingPlaceholder}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.priority}
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
              >
                <option value="1">{locale === "fr" ? "1 - Faible" : "1 - Low"}</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">{locale === "fr" ? "5 - Critique" : "5 - Critical"}</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.difficulty}
              <select
                value={form.difficulty}
                onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value }))}
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
              >
                <option value="1">{locale === "fr" ? "1 - Léger" : "1 - Light"}</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">{locale === "fr" ? "5 - Difficile" : "5 - Hard"}</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {copy.preferredTimeOfDay}
              <select
                value={form.preferredTimeOfDay}
                onChange={(event) =>
                  setForm((current) => ({ ...current, preferredTimeOfDay: event.target.value as PreferredTimeOfDay }))
                }
                className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2"
              >
                <option value="any">{copy.anyTime}</option>
                <option value="morning">{copy.morning}</option>
                <option value="afternoon">{copy.afternoon}</option>
                <option value="evening">{copy.evening}</option>
              </select>
            </label>

            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.splittable}
                onChange={(event) => setForm((current) => ({ ...current, splittable: event.target.checked }))}
              />
              {copy.splittable}
            </label>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-xl border border-[var(--line)] bg-gray-50 py-2 pl-10 pr-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | TaskStatus)}
              className="rounded-xl border border-[var(--line)] bg-gray-50 px-3 py-2 text-sm"
            >
              <option value="all">{copy.allStatuses}</option>
              <option value="todo">{copy.todo}</option>
              <option value="in_progress">{copy.inProgress}</option>
              <option value="done">{copy.done}</option>
            </select>
            <button type="button" onClick={loadTasks} className="btn-secondary !px-4 !py-2.5 !text-sm rounded-xl">
              {copy.refresh}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm text-[var(--muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            {copy.loading}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <p className="text-lg font-semibold">{copy.noMatches}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{copy.noMatchesDescription}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filteredTasks.map((task) => (
              <div key={task.id} className="grid gap-4 px-5 py-5 transition-colors hover:bg-gray-50/70 xl:grid-cols-[1.7fr_1fr_220px]">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    {task.status === "done" ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : task.status === "in_progress" ? (
                      <div className="mt-0.5 h-5 w-5 shrink-0 border-2 border-[var(--ink)] border-t-transparent animate-spin" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-base font-semibold ${task.status === "done" ? "text-gray-400 line-through" : "text-[var(--ink)]"}`}>
                          {task.title}
                        </h3>
                        <span className={`border px-2 py-1 text-[11px] font-bold ${priorityTone(task.priority)}`}>
                          {priorityLabel(task.priority)}
                        </span>
                        <span className="border border-[var(--line)] px-2 py-1 text-[11px] font-semibold text-[var(--muted)]">
                          {statusLabel(task.status, locale)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {task.description?.trim() || copy.noDescription}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 xl:grid-cols-1">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    <span>
                      {formatMinutesShort(task.remainingMinutes)} {copy.leftOf} {formatMinutesShort(task.estimatedMinutes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDeadlineLabel(task.deadline, locale)}</span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    {task.category?.trim() || copy.uncategorized} · {preferredTimeLabel(task.preferredTimeOfDay ?? "any", locale)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  {task.status === "todo" ? (
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(task, "in_progress")}
                          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--canvas-deep)]"
                    >
                      {copy.start}
                    </button>
                  ) : null}

                  {task.status !== "done" ? (
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(task, "done")}
                      className="rounded-lg border border-[var(--ink)] bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white"
                    >
                      {copy.markDone}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(task, "todo")}
                      className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--canvas-deep)]"
                    >
                      {copy.reopen}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => beginEdit(task)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--canvas-deep)]"
                  >
                    <Pencil className="h-4 w-4" />
                    {copy.edit}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {copy.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--line)] px-5 py-4 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <span>
            {copy.showing} {filteredTasks.length} {copy.of} {tasks.length} {copy.tasksLabel}
          </span>
          <span>{copy.openWorkRemaining}: {formatMinutesShort(totalOpenMinutes)}</span>
        </div>
      </div>
    </div>
  );
}
