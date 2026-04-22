import type { IsoDateTime } from "@/types/planning";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export function parseIsoMs(value: unknown): number | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

export function toIso(ms: number): IsoDateTime {
  return new Date(ms).toISOString();
}

// Convert a UTC timestamp to a local "shifted" timestamp using getTimezoneOffset semantics.
// localMs = utcMs - offsetMinutes*MINUTE_MS
export function shiftUtcToLocalMs(utcMs: number, timezoneOffsetMinutes: number): number {
  return utcMs - timezoneOffsetMinutes * MINUTE_MS;
}

// Convert a local shifted timestamp back to UTC.
// utcMs = localMs + offsetMinutes*MINUTE_MS
export function shiftLocalToUtcMs(localMs: number, timezoneOffsetMinutes: number): number {
  return localMs + timezoneOffsetMinutes * MINUTE_MS;
}

// Start of local day, expressed as a UTC timestamp.
export function startOfLocalDayUtcMs(utcMs: number, timezoneOffsetMinutes: number): number {
  const localMs = shiftUtcToLocalMs(utcMs, timezoneOffsetMinutes);
  const d = new Date(localMs);
  const startLocalMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return shiftLocalToUtcMs(startLocalMs, timezoneOffsetMinutes);
}

export function localDayKeyFromUtcMs(utcMs: number, timezoneOffsetMinutes: number): string {
  const localMs = shiftUtcToLocalMs(utcMs, timezoneOffsetMinutes);
  const d = new Date(localMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function localWeekdayFromUtcMs(utcMs: number, timezoneOffsetMinutes: number): number {
  const localMs = shiftUtcToLocalMs(utcMs, timezoneOffsetMinutes);
  return new Date(localMs).getUTCDay();
}

export function localHourFromUtcMs(utcMs: number, timezoneOffsetMinutes: number): number {
  const localMs = shiftUtcToLocalMs(utcMs, timezoneOffsetMinutes);
  return new Date(localMs).getUTCHours();
}

export function addDaysUtcMs(utcMs: number, days: number): number {
  return utcMs + days * DAY_MS;
}

export function clampNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function minutesBetween(startMs: number, endMs: number): number {
  return Math.max(0, Math.floor((endMs - startMs) / MINUTE_MS));
}

export function minutesToMs(minutes: number): number {
  return minutes * MINUTE_MS;
}

export { MINUTE_MS, DAY_MS };

