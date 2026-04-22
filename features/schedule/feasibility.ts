import type { FixedEvent, PlanningPreferences, Task } from "@/types/planning";
import { parseIsoMs } from "@/lib/datetime";
import { computeFreeSlots, totalMinutes } from "@/features/schedule/free-slots";

export function estimateFeasibility(args: {
  nowMs: number;
  horizonStartMs: number;
  horizonEndMs: number;
  tasks: Task[];
  fixedEvents: FixedEvent[];
  preferences: PlanningPreferences;
}): { freeMinutes: number; demandMinutes: number; feasibilityPct: number; warnings: string[] } {
  const { nowMs, horizonStartMs, horizonEndMs, tasks, fixedEvents, preferences } = args;

  const freeSlots = computeFreeSlots({ nowMs, horizonStartMs, horizonEndMs, preferences, fixedEvents });
  const freeMinutes = totalMinutes(freeSlots);

  const activeTasks = tasks.filter((t) => t.status !== "done" && (t.remainingMinutes ?? 0) > 0);
  const demandMinutes = activeTasks.reduce((acc, t) => acc + Math.max(0, t.remainingMinutes), 0);

  const feasibilityPct = demandMinutes === 0 ? 100 : Math.max(0, Math.min(100, Math.round((freeMinutes / demandMinutes) * 100)));

  const warnings: string[] = [];
  for (const t of activeTasks) {
    const deadlineMs = parseIsoMs(t.deadline);
    if (deadlineMs !== null && deadlineMs < nowMs) warnings.push(`Task "${t.title}" is already past its deadline.`);
  }

  return { freeMinutes, demandMinutes, feasibilityPct, warnings };
}

