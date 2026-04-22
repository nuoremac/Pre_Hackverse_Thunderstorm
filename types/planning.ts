export type IsoDateTime = string;

export type TaskStatus = "todo" | "in_progress" | "done";
export type PreferredTimeOfDay = "any" | "morning" | "afternoon" | "evening";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: TaskStatus;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  deadline?: IsoDateTime | null;
  estimatedMinutes: number;
  remainingMinutes: number;
  priority: number; // 1..5
  difficulty: number; // 1..5
  splittable: boolean;
  preferredTimeOfDay?: PreferredTimeOfDay | null;
};

export type FixedEvent = {
  id: string;
  title: string;
  startAt: IsoDateTime;
  endAt: IsoDateTime;
  location?: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

// NOTE: timezoneOffsetMinutes follows JS Date.getTimezoneOffset() semantics:
// minutes = UTC - local (so Africa/Douala is typically -60).
export type PlanningPreferences = {
  timezoneOffsetMinutes: number;
  workdayStartMinutes: number; // minutes from local midnight
  workdayEndMinutes: number; // minutes from local midnight
  maxWorkMinutesPerDay: number;
  focusBlockMinutes: number;
  breakMinutes: number;
  bufferMinutesBetweenSessions: number;
  allowedWeekdays: number[]; // 0=Sun .. 6=Sat (in user's local time)
};

export type ScheduleBlockType = "task" | "break" | "fixed_event";

export type ScheduleBlock = {
  id: string;
  type: ScheduleBlockType;
  title: string;
  startAt: IsoDateTime;
  endAt: IsoDateTime;
  taskId?: string | null;
  meta?: Record<string, unknown> | null;
  reason?: string | null;
};

export type GenerateScheduleInput = {
  now?: IsoDateTime;
  horizon?: { start?: IsoDateTime; end?: IsoDateTime };
  tasks: Task[];
  fixedEvents: FixedEvent[];
  preferences: PlanningPreferences;
};

export type UnscheduledTask = {
  taskId: string;
  title: string;
  remainingMinutes: number;
  reason: string;
};

export type ScheduleStats = {
  totalDemandMinutes: number;
  scheduledWorkMinutes: number;
  freeMinutesInHorizon: number;
  feasibilityPct: number;
  scheduledByDay: Record<string, number>; // local YYYY-MM-DD -> minutes
};

export type GenerateScheduleOutput = {
  generatedAt: IsoDateTime;
  blocks: ScheduleBlock[];
  unscheduled: UnscheduledTask[];
  warnings: string[];
  stats: ScheduleStats;
};

