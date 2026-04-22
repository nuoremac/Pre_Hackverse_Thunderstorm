import type { ScheduleBlock } from "@/types/planning";

function toIntlLocale(locale?: string): string {
  return locale === "fr" ? "fr-FR" : "en-US";
}

export function formatMinutesShort(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function formatMinutesClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatDateTimeShort(iso: string | null | undefined, locale?: string): string {
  if (!iso) return locale === "fr" ? "Aucune échéance" : "No deadline";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return locale === "fr" ? "Date invalide" : "Invalid date";

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatDateShort(iso: string | null | undefined, locale?: string): string {
  if (!iso) return locale === "fr" ? "Aucune date" : "No date";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return locale === "fr" ? "Date invalide" : "Invalid date";

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatTimeOnly(iso: string | null | undefined, locale?: string): string {
  if (!iso) return "--:--";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatDeadlineLabel(iso: string | null | undefined, locale?: string): string {
  if (!iso) return locale === "fr" ? "Aucune échéance" : "No deadline";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return locale === "fr" ? "Échéance invalide" : "Invalid deadline";

  const diffHours = Math.round((date.getTime() - Date.now()) / 3_600_000);
  if (diffHours < 0) {
    return locale === "fr"
      ? `En retard · ${formatDateTimeShort(iso, locale)}`
      : `Overdue · ${formatDateTimeShort(iso, locale)}`;
  }
  if (diffHours < 24) return locale === "fr" ? `Dans ${diffHours} h` : `Due in ${diffHours}h`;
  if (diffHours < 48) {
    return locale === "fr"
      ? `Demain · ${formatTimeOnly(iso, locale)}`
      : `Due tomorrow · ${formatTimeOnly(iso, locale)}`;
  }
  return formatDateTimeShort(iso, locale);
}

export function toDatetimeLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function fromDatetimeLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function minutesToTimeInput(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function timeInputToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

export function getWeekdayOptions(locale?: string) {
  return locale === "fr"
    ? [
        { value: 0, label: "Dim" },
        { value: 1, label: "Lun" },
        { value: 2, label: "Mar" },
        { value: 3, label: "Mer" },
        { value: 4, label: "Jeu" },
        { value: 5, label: "Ven" },
        { value: 6, label: "Sam" }
      ]
    : [
        { value: 0, label: "Sun" },
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" }
      ];
}

export function groupBlocksByDay(blocks: ScheduleBlock[], locale?: string) {
  const groups = new Map<string, ScheduleBlock[]>();

  for (const block of [...blocks].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))) {
    const key = new Date(block.startAt).toDateString();
    const dayBlocks = groups.get(key) ?? [];
    dayBlocks.push(block);
    groups.set(key, dayBlocks);
  }

  return [...groups.entries()].map(([key, dayBlocks]) => ({
    key,
    label: new Intl.DateTimeFormat(toIntlLocale(locale), {
      weekday: "long",
      month: "short",
      day: "numeric"
    }).format(new Date(dayBlocks[0].startAt)),
    blocks: dayBlocks
  }));
}

export function statusLabel(status: "todo" | "in_progress" | "done", locale?: string): string {
  if (locale === "fr") {
    if (status === "done") return "Terminé";
    if (status === "in_progress") return "En cours";
    return "À faire";
  }

  if (status === "done") return "Done";
  if (status === "in_progress") return "In Progress";
  return "To Do";
}

export function priorityLabel(priority: number): string {
  if (priority >= 5) return "P0";
  if (priority === 4) return "P1";
  if (priority === 3) return "P2";
  if (priority === 2) return "P3";
  return "P4";
}

export function priorityTone(priority: number): string {
  if (priority >= 5) return "bg-red-50 text-red-700 border-red-200";
  if (priority === 4) return "bg-orange-50 text-orange-700 border-orange-200";
  if (priority === 3) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
}
