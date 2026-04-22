import type { PlanningPreferences } from "@/types/planning";
import { clampNumber } from "@/lib/datetime";

export function defaultPreferences(nowMs: number = Date.now()): PlanningPreferences {
  return {
    timezoneOffsetMinutes: new Date(nowMs).getTimezoneOffset(),
    workdayStartMinutes: 9 * 60,
    workdayEndMinutes: 18 * 60,
    maxWorkMinutesPerDay: 6 * 60,
    focusBlockMinutes: 90,
    breakMinutes: 15,
    bufferMinutesBetweenSessions: 5,
    allowedWeekdays: [1, 2, 3, 4, 5]
  };
}

export function sanitizePreferences(partial: Partial<PlanningPreferences> | null | undefined): PlanningPreferences {
  const base = defaultPreferences();
  const p = { ...base, ...(partial ?? {}) };

  const allowedWeekdays = Array.isArray(p.allowedWeekdays)
    ? [...new Set(p.allowedWeekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort()
    : base.allowedWeekdays;

  return {
    timezoneOffsetMinutes: clampNumber(Number(p.timezoneOffsetMinutes ?? base.timezoneOffsetMinutes), -14 * 60, 14 * 60),
    workdayStartMinutes: clampNumber(Number(p.workdayStartMinutes ?? base.workdayStartMinutes), 0, 24 * 60),
    workdayEndMinutes: clampNumber(Number(p.workdayEndMinutes ?? base.workdayEndMinutes), 0, 24 * 60),
    maxWorkMinutesPerDay: clampNumber(Number(p.maxWorkMinutesPerDay ?? base.maxWorkMinutesPerDay), 0, 24 * 60),
    focusBlockMinutes: clampNumber(Number(p.focusBlockMinutes ?? base.focusBlockMinutes), 15, 6 * 60),
    breakMinutes: clampNumber(Number(p.breakMinutes ?? base.breakMinutes), 0, 120),
    bufferMinutesBetweenSessions: clampNumber(Number(p.bufferMinutesBetweenSessions ?? base.bufferMinutesBetweenSessions), 0, 60),
    allowedWeekdays: allowedWeekdays.length > 0 ? allowedWeekdays : base.allowedWeekdays
  };
}

