import type { FixedEvent, PlanningPreferences } from "@/types/planning";
import { DAY_MS, MINUTE_MS, parseIsoMs, startOfLocalDayUtcMs, localWeekdayFromUtcMs } from "@/lib/datetime";
import type { Interval } from "@/lib/intervals";
import { clampInterval, mergeIntervals, subtractIntervals } from "@/lib/intervals";

export function computeFreeSlots(args: {
  horizonStartMs: number;
  horizonEndMs: number;
  nowMs: number;
  preferences: PlanningPreferences;
  fixedEvents: FixedEvent[];
}): Interval[] {
  const { horizonStartMs, horizonEndMs, nowMs, preferences, fixedEvents } = args;

  const offsetMin = preferences.timezoneOffsetMinutes;
  const allowed = new Set(preferences.allowedWeekdays);

  const day0 = startOfLocalDayUtcMs(horizonStartMs, offsetMin);
  const slots: Interval[] = [];

  // Pre-parse fixed events into intervals once.
  const busyAll: Interval[] = [];
  for (const ev of fixedEvents) {
    const startMs = parseIsoMs(ev.startAt);
    const endMs = parseIsoMs(ev.endAt);
    if (startMs === null || endMs === null) continue;
    if (endMs <= startMs) continue;
    busyAll.push({ startMs, endMs });
  }
  const busyMerged = mergeIntervals(busyAll);

  for (let dayStartMs = day0; dayStartMs < horizonEndMs; dayStartMs += DAY_MS) {
    const weekdayLocal = localWeekdayFromUtcMs(dayStartMs, offsetMin);
    if (!allowed.has(weekdayLocal)) continue;

    const workStartMs = dayStartMs + preferences.workdayStartMinutes * MINUTE_MS;
    const workEndMs = dayStartMs + preferences.workdayEndMinutes * MINUTE_MS;
    const base = clampInterval(
      { startMs: workStartMs, endMs: workEndMs },
      Math.max(horizonStartMs, nowMs),
      horizonEndMs
    );
    if (!base) continue;

    // Collect busy that intersects the work window
    const dayBusy: Interval[] = [];
    for (const b of busyMerged) {
      if (b.endMs <= base.startMs) continue;
      if (b.startMs >= base.endMs) break;
      const clipped = clampInterval(b, base.startMs, base.endMs);
      if (clipped) dayBusy.push(clipped);
    }

    const free = subtractIntervals(base, dayBusy);
    slots.push(...free);
  }

  return mergeIntervals(slots);
}

export function totalMinutes(intervals: Interval[]): number {
  let sum = 0;
  for (const i of intervals) sum += Math.floor((i.endMs - i.startMs) / MINUTE_MS);
  return sum;
}

