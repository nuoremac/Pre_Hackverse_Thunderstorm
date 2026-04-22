import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { computeDashboardStats, type DashboardStats } from "@/features/analytics/summary";
import { defaultPreferences, sanitizePreferences } from "@/features/constraints/defaults";
import { estimateFeasibility } from "@/features/schedule/feasibility";
import { DAY_MS, toIso } from "@/lib/datetime";
import {
  getFixedEvent,
  getLastSchedule,
  getPreferences,
  getProfile,
  listFixedEvents,
  listTasks
} from "@/lib/dev-store";
import {
  dbFixedEventToFixedEvent,
  dbPreferencesToPreferences,
  dbScheduleBlockToScheduleBlock,
  dbTaskToTask,
  type DbFixedEventRow,
  type DbPreferencesRow,
  type DbScheduleBlockRow,
  type DbTaskRow
} from "@/lib/supabase/mappers";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  FixedEvent,
  GenerateScheduleOutput,
  PlanningPreferences,
  ScheduleBlock,
  Task,
  UnscheduledTask
} from "@/types/planning";
import type { UserProfile } from "@/types/profile";

export type DashboardShellUser = {
  fullName: string;
  email: string;
  mode: "supabase" | "dev";
};

export type StoredScheduleSnapshot = {
  generatedAt: string;
  blocks: ScheduleBlock[];
};

export type PlannerScheduleSnapshot = StoredScheduleSnapshot & {
  unscheduled?: UnscheduledTask[];
  warnings?: string[];
  stats?: GenerateScheduleOutput["stats"];
};

export type PlannerFeasibilitySnapshot = {
  feasibilityPct: number;
  demandMinutes: number;
  freeMinutes: number;
  warnings: string[];
};

export type DashboardPageData = {
  tasks: Task[];
  stats: DashboardStats;
  schedule: StoredScheduleSnapshot | null;
};

export type TasksPageData = {
  tasks: Task[];
};

export type AnalyticsPageData = {
  tasks: Task[];
  stats: DashboardStats;
  schedule: StoredScheduleSnapshot | null;
};

export type SettingsPageData = {
  profile: UserProfile;
  preferences: PlanningPreferences;
};

export type PlannerPageData = {
  tasks: Task[];
  fixedEvents: FixedEvent[];
  preferences: PlanningPreferences;
  schedule: PlannerScheduleSnapshot | null;
  feasibility: PlannerFeasibilitySnapshot;
};

export async function loadDashboardShellUser(): Promise<DashboardShellUser> {
  noStore();

  if (!isSupabaseConfigured()) {
    const profile = getProfile("demo");
    return {
      fullName: profile.fullName,
      email: profile.email,
      mode: "dev"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    fullName: profile?.full_name?.trim() || user.user_metadata?.full_name || user.email || "User",
    email: user.email || "",
    mode: "supabase"
  };
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  noStore();

  if (!isSupabaseConfigured()) {
    const preferences = getPreferences("demo");
    const lastSchedule = getLastSchedule("demo");
    return {
      tasks: listTasks("demo"),
      stats: computeDashboardStats({
        tasks: listTasks("demo"),
        lastSchedule,
        timezoneOffsetMinutes: preferences.timezoneOffsetMinutes,
        maxWorkMinutesPerDay: preferences.maxWorkMinutesPerDay
      }),
      schedule: lastSchedule
        ? {
            generatedAt: lastSchedule.generatedAt,
            blocks: lastSchedule.blocks
          }
        : null
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    redirect("/login");
  }

  const [tasksRes, fixedRes, prefsRes, blocksRes] = await Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: true }),
    supabase.from("fixed_events").select("*").order("start_at", { ascending: true }),
    supabase.from("preferences").select("*").limit(1).maybeSingle(),
    supabase.from("schedule_blocks").select("*").order("start_at", { ascending: true })
  ]);

  if (tasksRes.error) throw new Error(tasksRes.error.message);
  if (fixedRes.error) throw new Error(fixedRes.error.message);
  if (prefsRes.error) throw new Error(prefsRes.error.message);
  if (blocksRes.error) throw new Error(blocksRes.error.message);

  const tasks = (tasksRes.data ?? []).map((row) => dbTaskToTask(row as DbTaskRow));
  const fixedEvents = (fixedRes.data ?? []).map((row) => dbFixedEventToFixedEvent(row as DbFixedEventRow));
  const preferences = prefsRes.data
    ? dbPreferencesToPreferences(prefsRes.data as DbPreferencesRow)
    : sanitizePreferences(defaultPreferences());

  const taskBlocks = (blocksRes.data ?? []).map((row) => dbScheduleBlockToScheduleBlock(row as DbScheduleBlockRow));
  const fixedBlocks = fixedEvents.map((event) => ({
    id: event.id,
    type: "fixed_event" as const,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    meta: { location: event.location ?? null },
    reason: "Fixed event (hard constraint)."
  }));
  const mergedBlocks = [...fixedBlocks, ...taskBlocks].sort(
    (a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)
  );

  const nowMs = Date.now();
  const feasibility = estimateFeasibility({
    nowMs,
    horizonStartMs: nowMs,
    horizonEndMs: nowMs + 7 * DAY_MS,
    tasks,
    fixedEvents,
    preferences
  });
  const stats = computeDashboardStats({
    tasks,
    lastSchedule: {
      generatedAt: toIso(nowMs),
      blocks: mergedBlocks,
      unscheduled: [],
      warnings: [],
      stats: {
        totalDemandMinutes: feasibility.demandMinutes,
        scheduledWorkMinutes: 0,
        freeMinutesInHorizon: feasibility.freeMinutes,
        feasibilityPct: feasibility.feasibilityPct,
        scheduledByDay: {}
      }
    },
    timezoneOffsetMinutes: preferences.timezoneOffsetMinutes,
    maxWorkMinutesPerDay: preferences.maxWorkMinutesPerDay
  });

  return {
    tasks,
    stats,
    schedule: {
      generatedAt: toIso(nowMs),
      blocks: mergedBlocks
    }
  };
}

export async function loadTasksPageData(): Promise<TasksPageData> {
  noStore();

  if (!isSupabaseConfigured()) {
    return { tasks: listTasks("demo") };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  return {
    tasks: (data ?? []).map((row) => dbTaskToTask(row as DbTaskRow))
  };
}

export async function loadAnalyticsPageData(): Promise<AnalyticsPageData> {
  return loadDashboardPageData();
}

export async function loadSettingsPageData(): Promise<SettingsPageData> {
  noStore();

  if (!isSupabaseConfigured()) {
    return {
      profile: getProfile("demo"),
      preferences: getPreferences("demo")
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    redirect("/login");
  }

  const [profileRes, preferencesRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("preferences").select("*").limit(1).maybeSingle()
  ]);

  if (profileRes.error) throw new Error(profileRes.error.message);
  if (preferencesRes.error) throw new Error(preferencesRes.error.message);

  return {
    profile: {
      fullName: profileRes.data?.full_name?.trim() || user.user_metadata?.full_name || user.email || "User",
      email: user.email || "",
      mode: "supabase"
    },
    preferences: preferencesRes.data
      ? dbPreferencesToPreferences(preferencesRes.data as DbPreferencesRow)
      : sanitizePreferences(defaultPreferences())
  };
}

export async function loadPlannerPageData(): Promise<PlannerPageData> {
  noStore();

  if (!isSupabaseConfigured()) {
    const tasks = listTasks("demo");
    const fixedEvents = listFixedEvents("demo");
    const preferences = getPreferences("demo");
    const schedule = getLastSchedule("demo");
    const nowMs = Date.now();
    const feasibility = estimateFeasibility({
      nowMs,
      horizonStartMs: nowMs,
      horizonEndMs: nowMs + 7 * DAY_MS,
      tasks,
      fixedEvents,
      preferences
    });

    return {
      tasks,
      fixedEvents,
      preferences,
      schedule,
      feasibility
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const [tasksRes, fixedRes, prefsRes, blocksRes] = await Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: true }),
    supabase.from("fixed_events").select("*").order("start_at", { ascending: true }),
    supabase.from("preferences").select("*").limit(1).maybeSingle(),
    supabase.from("schedule_blocks").select("*").order("start_at", { ascending: true })
  ]);

  if (tasksRes.error) throw new Error(tasksRes.error.message);
  if (fixedRes.error) throw new Error(fixedRes.error.message);
  if (prefsRes.error) throw new Error(prefsRes.error.message);
  if (blocksRes.error) throw new Error(blocksRes.error.message);

  const tasks = (tasksRes.data ?? []).map((row) => dbTaskToTask(row as DbTaskRow));
  const fixedEvents = (fixedRes.data ?? []).map((row) => dbFixedEventToFixedEvent(row as DbFixedEventRow));
  const preferences = prefsRes.data
    ? dbPreferencesToPreferences(prefsRes.data as DbPreferencesRow)
    : sanitizePreferences(defaultPreferences());
  const taskBlocks = (blocksRes.data ?? []).map((row) => dbScheduleBlockToScheduleBlock(row as DbScheduleBlockRow));
  const fixedBlocks = fixedEvents.map((event) => ({
    id: event.id,
    type: "fixed_event" as const,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    meta: { location: event.location ?? null },
    reason: "Fixed event (hard constraint)."
  }));
  const mergedBlocks = [...fixedBlocks, ...taskBlocks].sort(
    (a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)
  );

  const nowMs = Date.now();
  const feasibility = estimateFeasibility({
    nowMs,
    horizonStartMs: nowMs,
    horizonEndMs: nowMs + 7 * DAY_MS,
    tasks,
    fixedEvents,
    preferences
  });

  return {
    tasks,
    fixedEvents,
    preferences,
    schedule: mergedBlocks.length
      ? {
          generatedAt: toIso(nowMs),
          blocks: mergedBlocks
        }
      : null,
    feasibility
  };
}
