import type { GenerateScheduleOutput, ScheduleBlock, Task } from "@/types/planning";
import { MINUTE_MS, localDayKeyFromUtcMs, parseIsoMs } from "@/lib/datetime";

export type DashboardStats = {
  tasksTotal: number;
  tasksDone: number;
  tasksOpen: number;
  scheduledWorkMinutes: number;
  feasibilityPct: number;
  overloadDays: Array<{ day: string; scheduledMinutes: number; maxMinutes: number }>;
};

export function computeDashboardStats(args: {
  tasks: Task[];
  lastSchedule: GenerateScheduleOutput | null;
  timezoneOffsetMinutes: number;
  maxWorkMinutesPerDay: number;
}): DashboardStats {
  const { tasks, lastSchedule, timezoneOffsetMinutes, maxWorkMinutesPerDay } = args;

  const tasksTotal = tasks.length;
  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const tasksOpen = tasksTotal - tasksDone;

  const blocks = lastSchedule?.blocks ?? [];
  const scheduledWorkMinutes = sumScheduledWorkMinutes(blocks);
  const feasibilityPct = lastSchedule?.stats?.feasibilityPct ?? 0;

  const byDay: Record<string, number> = {};
  for (const b of blocks) {
    if (b.type !== "task") continue;
    const startMs = parseIsoMs(b.startAt);
    const endMs = parseIsoMs(b.endAt);
    if (startMs === null || endMs === null || endMs <= startMs) continue;
    const day = localDayKeyFromUtcMs(startMs, timezoneOffsetMinutes);
    byDay[day] = (byDay[day] ?? 0) + Math.floor((endMs - startMs) / MINUTE_MS);
  }

  const overloadDays = Object.entries(byDay)
    .filter(([, minutes]) => minutes > maxWorkMinutesPerDay)
    .map(([day, minutes]) => ({ day, scheduledMinutes: minutes, maxMinutes: maxWorkMinutesPerDay }))
    .sort((a, b) => b.scheduledMinutes - a.scheduledMinutes);

  return {
    tasksTotal,
    tasksDone,
    tasksOpen,
    scheduledWorkMinutes,
    feasibilityPct,
    overloadDays
  };
}

function sumScheduledWorkMinutes(blocks: ScheduleBlock[]): number {
  let total = 0;
  for (const b of blocks) {
    if (b.type !== "task") continue;
    const startMs = parseIsoMs(b.startAt);
    const endMs = parseIsoMs(b.endAt);
    if (startMs === null || endMs === null || endMs <= startMs) continue;
    total += Math.floor((endMs - startMs) / MINUTE_MS);
  }
  return total;
}

