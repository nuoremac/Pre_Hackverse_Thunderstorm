import type {
  FixedEvent,
  GenerateScheduleInput,
  GenerateScheduleOutput,
  PlanningPreferences,
  ScheduleBlock,
  Task,
  UnscheduledTask
} from "@/types/planning";
import { DAY_MS, MINUTE_MS, clampNumber, localDayKeyFromUtcMs, parseIsoMs, toIso } from "@/lib/datetime";
import type { Interval } from "@/lib/intervals";
import { sanitizePreferences } from "@/features/constraints/defaults";
import { computeFreeSlots } from "@/features/schedule/free-slots";
import { scoreTaskBase, scoreTaskForSlot } from "@/features/tasks/scoring";
import { estimateFeasibility } from "@/features/schedule/feasibility";
import { randomUUID } from "crypto";

type ScoredTask = Task & { _baseScore: number };

export function generateSchedule(input: GenerateScheduleInput): GenerateScheduleOutput {
  const nowMs = parseIsoMs(input.now) ?? Date.now();
  const horizonStartMs = parseIsoMs(input.horizon?.start) ?? nowMs;
  const horizonEndMs = parseIsoMs(input.horizon?.end) ?? nowMs + 7 * DAY_MS;

  if (!Number.isFinite(horizonStartMs) || !Number.isFinite(horizonEndMs) || horizonEndMs <= horizonStartMs) {
    return {
      generatedAt: toIso(Date.now()),
      blocks: [],
      unscheduled: [],
      warnings: ["Invalid horizon: end must be after start."],
      stats: {
        totalDemandMinutes: 0,
        scheduledWorkMinutes: 0,
        freeMinutesInHorizon: 0,
        feasibilityPct: 0,
        scheduledByDay: {}
      }
    };
  }

  const preferences = sanitizePreferences(input.preferences);
  const minChunkMinutes = Math.min(30, Math.max(15, Math.floor(preferences.focusBlockMinutes / 3)));

  const tasks: ScoredTask[] = (input.tasks ?? [])
    .filter((t) => t.status !== "done" && (t.remainingMinutes ?? 0) > 0)
    .map((t) => ({
      ...t,
      remainingMinutes: Math.max(0, Math.floor(t.remainingMinutes)),
      estimatedMinutes: Math.max(0, Math.floor(t.estimatedMinutes)),
      _baseScore: scoreTaskBase(t, nowMs)
    }))
    .sort((a, b) => b._baseScore - a._baseScore);

  const fixedEvents: FixedEvent[] = input.fixedEvents ?? [];

  const freeSlots = computeFreeSlots({
    horizonStartMs,
    horizonEndMs,
    nowMs,
    preferences,
    fixedEvents
  });

  const scheduledByDay: Record<string, number> = {};
  const blocks: ScheduleBlock[] = [];
  const warnings: string[] = [];

  // Include fixed events as blocks so the client can render a complete calendar.
  blocks.push(...fixedEventsToBlocks(fixedEvents));

  // Greedy allocator: iterate free slots chronologically, always schedule the best-fitting task.
  for (const slot of freeSlots) {
    scheduleWithinSlot({
      slot,
      nowMs,
      preferences,
      tasks,
      scheduledByDay,
      blocks,
      minChunkMinutes
    });
    if (tasks.every((t) => t.remainingMinutes <= 0)) break;
  }

  // Compute unscheduled tasks + reasons
  const unscheduled: UnscheduledTask[] = [];
  for (const t of tasks) {
    if (t.remainingMinutes <= 0) continue;
    unscheduled.push({
      taskId: t.id,
      title: t.title,
      remainingMinutes: t.remainingMinutes,
      reason: inferUnscheduledReason({ task: t, nowMs, horizonEndMs, freeSlots, preferences })
    });
  }

  const demandMinutes = tasks.reduce((acc, t) => acc + Math.max(0, t.remainingMinutes), 0) +
    blocks
      .filter((b) => b.type === "task")
      .reduce((acc, b) => acc + Math.max(0, minutesFromBlock(b)), 0);

  const scheduledWorkMinutes = blocks
    .filter((b) => b.type === "task")
    .reduce((acc, b) => acc + Math.max(0, minutesFromBlock(b)), 0);

  const feasibility = estimateFeasibility({ nowMs, horizonStartMs, horizonEndMs, tasks, fixedEvents, preferences });
  warnings.push(...feasibility.warnings);

  // Hard warning when nothing can be scheduled.
  if (scheduledWorkMinutes === 0 && tasks.length > 0) {
    warnings.push("No task blocks could be placed. Check your working hours and fixed events.");
  }

  blocks.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));

  return {
    generatedAt: toIso(Date.now()),
    blocks,
    unscheduled,
    warnings,
    stats: {
      totalDemandMinutes: demandMinutes,
      scheduledWorkMinutes,
      freeMinutesInHorizon: feasibility.freeMinutes,
      feasibilityPct: feasibility.feasibilityPct,
      scheduledByDay
    }
  };
}

function scheduleWithinSlot(args: {
  slot: Interval;
  nowMs: number;
  preferences: PlanningPreferences;
  tasks: ScoredTask[];
  scheduledByDay: Record<string, number>;
  blocks: ScheduleBlock[];
  minChunkMinutes: number;
}): void {
  const { slot, nowMs, preferences, tasks, scheduledByDay, blocks, minChunkMinutes } = args;

  let cursorMs = Math.max(slot.startMs, nowMs);
  const endMs = slot.endMs;

  while (cursorMs + minChunkMinutes * MINUTE_MS <= endMs) {
    const dayKey = localDayKeyFromUtcMs(cursorMs, preferences.timezoneOffsetMinutes);
    const alreadyScheduled = scheduledByDay[dayKey] ?? 0;
    const dayCapacityLeft = Math.max(0, preferences.maxWorkMinutesPerDay - alreadyScheduled);
    if (dayCapacityLeft < minChunkMinutes) break;

    const pick = pickBestTaskForCursor({ cursorMs, endMs, nowMs, preferences, tasks, dayCapacityLeft, minChunkMinutes });
    if (!pick) break;

    const { task, chunkMinutes, slotScore } = pick;
    const startAt = cursorMs;
    const endAt = cursorMs + chunkMinutes * MINUTE_MS;

    blocks.push({
      id: randomUUID(),
      type: "task",
      taskId: task.id,
      title: task.title,
      startAt: toIso(startAt),
      endAt: toIso(endAt),
      meta: {
        score: Math.round(slotScore),
        baseScore: Math.round(task._baseScore),
        chunkMinutes
      },
      reason: buildReason({ task, nowMs, startMs: startAt, endMs: endAt, preferences })
    });

    task.remainingMinutes = Math.max(0, task.remainingMinutes - chunkMinutes);
    scheduledByDay[dayKey] = alreadyScheduled + chunkMinutes;
    cursorMs = endAt;

    // Add break only if we can still fit meaningful work after it.
    const breakMinutes = Math.max(0, preferences.breakMinutes);
    const bufferMinutes = Math.max(0, preferences.bufferMinutesBetweenSessions);
    const hasRemainingTasks = tasks.some((t) => t.remainingMinutes > 0);

    if (hasRemainingTasks && breakMinutes > 0 && cursorMs + (breakMinutes + bufferMinutes + minChunkMinutes) * MINUTE_MS <= endMs) {
      blocks.push({
        id: randomUUID(),
        type: "break",
        title: "Break",
        startAt: toIso(cursorMs),
        endAt: toIso(cursorMs + breakMinutes * MINUTE_MS),
        reason: "Recovery buffer inserted to reduce fatigue and context switching.",
        meta: { breakMinutes }
      });
      cursorMs += breakMinutes * MINUTE_MS;
    }

    cursorMs += bufferMinutes * MINUTE_MS;
  }
}

function pickBestTaskForCursor(args: {
  cursorMs: number;
  endMs: number;
  nowMs: number;
  preferences: PlanningPreferences;
  tasks: ScoredTask[];
  dayCapacityLeft: number;
  minChunkMinutes: number;
}): { task: ScoredTask; chunkMinutes: number; slotScore: number } | null {
  const { cursorMs, endMs, nowMs, preferences, tasks, dayCapacityLeft, minChunkMinutes } = args;
  const availableMinutes = Math.min(dayCapacityLeft, Math.floor((endMs - cursorMs) / MINUTE_MS));
  if (availableMinutes < minChunkMinutes) return null;

  let best: { task: ScoredTask; chunkMinutes: number; slotScore: number } | null = null;

  for (const task of tasks) {
    if (task.remainingMinutes <= 0) continue;

    const deadlineMs = parseIsoMs(task.deadline);
    if (deadlineMs !== null && cursorMs >= deadlineMs) continue;

    const latestEndMs = deadlineMs !== null ? Math.min(endMs, deadlineMs) : endMs;
    const maxMinutesForTaskHere = Math.min(dayCapacityLeft, Math.floor((latestEndMs - cursorMs) / MINUTE_MS));
    if (maxMinutesForTaskHere < minChunkMinutes) continue;

    const chunkMinutes = chooseChunkMinutes({ task, maxMinutesHere: maxMinutesForTaskHere, preferences, minChunkMinutes });
    if (chunkMinutes < minChunkMinutes) continue;

    const slotScore = scoreTaskForSlot({
      task,
      nowMs,
      slotStartMs: cursorMs,
      timezoneOffsetMinutes: preferences.timezoneOffsetMinutes,
      baseScore: task._baseScore
    });

    if (!best || slotScore > best.slotScore) best = { task, chunkMinutes, slotScore };
  }

  return best;
}

function chooseChunkMinutes(args: {
  task: ScoredTask;
  maxMinutesHere: number;
  preferences: PlanningPreferences;
  minChunkMinutes: number;
}): number {
  const { task, maxMinutesHere, preferences, minChunkMinutes } = args;
  const remaining = Math.max(0, task.remainingMinutes);

  if (!task.splittable) {
    return remaining <= maxMinutesHere ? remaining : 0;
  }

  const block = clampNumber(preferences.focusBlockMinutes, minChunkMinutes, 6 * 60);
  const chunk = Math.min(block, remaining, maxMinutesHere);
  return chunk;
}

function buildReason(args: {
  task: Task;
  nowMs: number;
  startMs: number;
  endMs: number;
  preferences: PlanningPreferences;
}): string {
  const { task, nowMs, startMs, endMs, preferences } = args;
  const parts: string[] = [];

  const deadlineMs = parseIsoMs(task.deadline);
  if (deadlineMs !== null) {
    const hoursUntil = Math.round((deadlineMs - nowMs) / 3_600_000);
    parts.push(hoursUntil >= 0 ? `Deadline in ~${hoursUntil}h.` : "Past-deadline task (scheduled ASAP).");
  } else {
    parts.push("No deadline, scheduled by priority score.");
  }

  parts.push(`Priority ${task.priority}/5, difficulty ${task.difficulty}/5.`);

  const minutes = Math.floor((endMs - startMs) / MINUTE_MS);
  parts.push(`Allocated ${minutes} minutes within an available slot; hard constraints respected.`);

  // Quick mention of the user's workday capacity.
  parts.push(`Daily cap: ${preferences.maxWorkMinutesPerDay} min.`);

  return parts.join(" ");
}

function inferUnscheduledReason(args: {
  task: ScoredTask;
  nowMs: number;
  horizonEndMs: number;
  freeSlots: Interval[];
  preferences: PlanningPreferences;
}): string {
  const { task, nowMs, horizonEndMs, freeSlots, preferences } = args;
  const deadlineMs = parseIsoMs(task.deadline);
  const latest = deadlineMs !== null ? Math.min(deadlineMs, horizonEndMs) : horizonEndMs;

  if (deadlineMs !== null && deadlineMs < nowMs) return "Deadline already passed.";
  if (latest <= nowMs) return "No remaining horizon to schedule within.";

  // Check if there is any slot before the deadline that could fit at least a minimum chunk.
  const minChunkMinutes = Math.min(30, Math.max(15, Math.floor(preferences.focusBlockMinutes / 3)));
  const minChunkMs = minChunkMinutes * MINUTE_MS;

  for (const s of freeSlots) {
    const start = Math.max(s.startMs, nowMs);
    const end = Math.min(s.endMs, latest);
    if (end - start >= minChunkMs) return "Not enough remaining daily capacity to place this task (try increasing work hours or reducing breaks).";
  }

  if (deadlineMs !== null) return "No free slot exists before the deadline.";
  return "No free slot exists within the planning horizon.";
}

function fixedEventsToBlocks(fixedEvents: FixedEvent[]): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  for (const ev of fixedEvents) {
    const startMs = parseIsoMs(ev.startAt);
    const endMs = parseIsoMs(ev.endAt);
    if (startMs === null || endMs === null || endMs <= startMs) continue;
    blocks.push({
      id: ev.id || randomUUID(),
      type: "fixed_event",
      title: ev.title,
      startAt: toIso(startMs),
      endAt: toIso(endMs),
      meta: { location: ev.location ?? null },
      reason: "Fixed event (hard constraint)."
    });
  }
  return blocks;
}

function minutesFromBlock(block: ScheduleBlock): number {
  const start = Date.parse(block.startAt);
  const end = Date.parse(block.endAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.floor((end - start) / MINUTE_MS);
}
