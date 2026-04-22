import { minutesBetween } from "@/lib/datetime";

export type Interval = { startMs: number; endMs: number };

export function normalizeInterval(i: Interval): Interval | null {
  if (!Number.isFinite(i.startMs) || !Number.isFinite(i.endMs)) return null;
  if (i.endMs <= i.startMs) return null;
  return { startMs: i.startMs, endMs: i.endMs };
}

export function clampInterval(i: Interval, minMs: number, maxMs: number): Interval | null {
  const startMs = Math.max(i.startMs, minMs);
  const endMs = Math.min(i.endMs, maxMs);
  return normalizeInterval({ startMs, endMs });
}

export function intervalDurationMinutes(i: Interval): number {
  return minutesBetween(i.startMs, i.endMs);
}

export function sortIntervals(intervals: Interval[]): Interval[] {
  return [...intervals].sort((a, b) => (a.startMs - b.startMs) || (a.endMs - b.endMs));
}

export function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = sortIntervals(intervals)
    .map(normalizeInterval)
    .filter((x): x is Interval => x !== null);

  const merged: Interval[] = [];
  for (const cur of sorted) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push(cur);
      continue;
    }
    if (cur.startMs <= last.endMs) {
      last.endMs = Math.max(last.endMs, cur.endMs);
      continue;
    }
    merged.push(cur);
  }
  return merged;
}

export function subtractIntervals(base: Interval, busy: Interval[]): Interval[] {
  const b = normalizeInterval(base);
  if (!b) return [];
  const busyMerged = mergeIntervals(busy);

  let free: Interval[] = [b];
  for (const cut of busyMerged) {
    const next: Interval[] = [];
    for (const slot of free) {
      // No overlap
      if (cut.endMs <= slot.startMs || cut.startMs >= slot.endMs) {
        next.push(slot);
        continue;
      }
      // cut covers all
      if (cut.startMs <= slot.startMs && cut.endMs >= slot.endMs) {
        continue;
      }
      // cut overlaps start
      if (cut.startMs <= slot.startMs && cut.endMs < slot.endMs) {
        const right = normalizeInterval({ startMs: cut.endMs, endMs: slot.endMs });
        if (right) next.push(right);
        continue;
      }
      // cut overlaps end
      if (cut.startMs > slot.startMs && cut.endMs >= slot.endMs) {
        const left = normalizeInterval({ startMs: slot.startMs, endMs: cut.startMs });
        if (left) next.push(left);
        continue;
      }
      // cut in middle -> split
      const left = normalizeInterval({ startMs: slot.startMs, endMs: cut.startMs });
      const right = normalizeInterval({ startMs: cut.endMs, endMs: slot.endMs });
      if (left) next.push(left);
      if (right) next.push(right);
    }
    free = next;
    if (free.length === 0) break;
  }

  return free;
}

