import type { FixedEvent, PlanningPreferences, ScheduleBlock, Task } from "@/types/planning";
import { clampNumber, toIso } from "@/lib/datetime";

export type DbTaskRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  deadline: string | null;
  estimated_minutes: number;
  remaining_minutes: number;
  priority: number;
  difficulty: number;
  splittable: boolean;
  preferred_time_of_day: string | null;
  created_at: string;
  updated_at: string;
};

export function dbTaskToTask(row: DbTaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: normalizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deadline: row.deadline,
    estimatedMinutes: row.estimated_minutes,
    remainingMinutes: row.remaining_minutes,
    priority: clampNumber(row.priority ?? 3, 1, 5),
    difficulty: clampNumber(row.difficulty ?? 3, 1, 5),
    splittable: Boolean(row.splittable ?? true),
    preferredTimeOfDay: normalizePreferred(row.preferred_time_of_day)
  };
}

export type DbFixedEventRow = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export function dbFixedEventToFixedEvent(row: DbFixedEventRow): FixedEvent {
  return {
    id: row.id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export type DbPreferencesRow = {
  user_id: string;
  timezone_offset_minutes: number;
  workday_start_minutes: number;
  workday_end_minutes: number;
  max_work_minutes_per_day: number;
  focus_block_minutes: number;
  break_minutes: number;
  buffer_minutes_between_sessions: number;
  allowed_weekdays: number[];
  created_at: string;
  updated_at: string;
};

export function dbPreferencesToPreferences(row: DbPreferencesRow): PlanningPreferences {
  return {
    timezoneOffsetMinutes: row.timezone_offset_minutes,
    workdayStartMinutes: row.workday_start_minutes,
    workdayEndMinutes: row.workday_end_minutes,
    maxWorkMinutesPerDay: row.max_work_minutes_per_day,
    focusBlockMinutes: row.focus_block_minutes,
    breakMinutes: row.break_minutes,
    bufferMinutesBetweenSessions: row.buffer_minutes_between_sessions,
    allowedWeekdays: Array.isArray(row.allowed_weekdays) ? row.allowed_weekdays : [1, 2, 3, 4, 5]
  };
}

export type DbScheduleBlockRow = {
  id: string;
  task_id: string | null;
  type: string;
  title: string;
  start_at: string;
  end_at: string;
  meta: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
};

export function dbScheduleBlockToScheduleBlock(row: DbScheduleBlockRow): ScheduleBlock {
  return {
    id: row.id,
    taskId: row.task_id,
    type: normalizeScheduleType(row.type),
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    meta: row.meta,
    reason: row.reason
  };
}

export function scheduleBlockToDbScheduleBlock(block: ScheduleBlock) {
  return {
    id: block.id,
    task_id: block.taskId ?? null,
    type: block.type,
    title: block.title,
    start_at: block.startAt,
    end_at: block.endAt,
    meta: block.meta ?? null,
    reason: block.reason ?? null,
    created_at: toIso(Date.now())
  };
}

function normalizeStatus(v: unknown): Task["status"] {
  if (v === "todo" || v === "in_progress" || v === "done") return v;
  return "todo";
}

function normalizePreferred(v: unknown): Task["preferredTimeOfDay"] {
  if (v === "morning" || v === "afternoon" || v === "evening" || v === "any") return v;
  return "any";
}

function normalizeScheduleType(v: unknown): ScheduleBlock["type"] {
  if (v === "task" || v === "break" || v === "fixed_event") return v;
  return "task";
}

