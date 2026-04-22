import type { PreferredTimeOfDay, Task } from "@/types/planning";
import { clampNumber, localHourFromUtcMs, parseIsoMs } from "@/lib/datetime";

export function scoreTaskBase(task: Task, nowMs: number): number {
  const priority = clampNumber(task.priority ?? 3, 1, 5);
  const difficulty = clampNumber(task.difficulty ?? 3, 1, 5);
  const remaining = clampNumber(task.remainingMinutes ?? 0, 0, 10_000);

  const priorityScore = priority * 20; // 20..100
  const difficultyScore = difficulty * 6; // 6..30
  const durationRiskScore = clampNumber(remaining / 30, 0, 60); // 0..60

  const deadlineMs = parseIsoMs(task.deadline);
  let urgencyScore = 0;
  let overduePenalty = 0;
  if (deadlineMs !== null) {
    const hoursUntil = (deadlineMs - nowMs) / 3_600_000;
    // More urgent as hoursUntil approaches 0.
    urgencyScore = clampNumber(120 / (Math.max(1, hoursUntil / 6)), 0, 120);
    if (hoursUntil < 0) overduePenalty = 50;
  }

  return priorityScore + difficultyScore + durationRiskScore + urgencyScore - overduePenalty;
}

export function scoreTaskForSlot(args: {
  task: Task;
  nowMs: number;
  slotStartMs: number;
  timezoneOffsetMinutes: number;
  baseScore?: number;
}): number {
  const base = args.baseScore ?? scoreTaskBase(args.task, args.nowMs);
  const pref = normalizePreferredTimeOfDay(args.task.preferredTimeOfDay);
  if (pref === "any") return base;

  const hour = localHourFromUtcMs(args.slotStartMs, args.timezoneOffsetMinutes);
  const bonus = timeOfDayBonus(pref, hour);
  return base + bonus;
}

function normalizePreferredTimeOfDay(pref: Task["preferredTimeOfDay"]): PreferredTimeOfDay {
  if (pref === "morning" || pref === "afternoon" || pref === "evening") return pref;
  return "any";
}

function timeOfDayBonus(pref: Exclude<PreferredTimeOfDay, "any">, hourLocal: number): number {
  // Very lightweight heuristic: prefer matching blocks, otherwise no penalty.
  if (pref === "morning") return hourLocal >= 6 && hourLocal < 12 ? 10 : 0;
  if (pref === "afternoon") return hourLocal >= 12 && hourLocal < 17 ? 10 : 0;
  return hourLocal >= 17 && hourLocal < 22 ? 10 : 0;
}

