import { NextResponse } from "next/server";
import { computeDashboardStats } from "@/features/analytics/summary";
import { getLastSchedule, getPreferences, getUserIdFromRequest, listTasks } from "@/lib/dev-store";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, dbPreferencesToPreferences, dbScheduleBlockToScheduleBlock, dbTaskToTask, type DbFixedEventRow, type DbPreferencesRow, type DbScheduleBlockRow, type DbTaskRow } from "@/lib/supabase/mappers";
import { DAY_MS } from "@/lib/datetime";
import { estimateFeasibility } from "@/features/schedule/feasibility";

export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      const [tasksRes, fixedRes, prefsRes, blocksRes] = await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("fixed_events").select("*"),
        supabase.from("preferences").select("*").limit(1).maybeSingle(),
        supabase.from("schedule_blocks").select("*")
      ]);

      if (tasksRes.error) return NextResponse.json({ error: tasksRes.error.message }, { status: 500 });
      if (fixedRes.error) return NextResponse.json({ error: fixedRes.error.message }, { status: 500 });
      if (prefsRes.error) return NextResponse.json({ error: prefsRes.error.message }, { status: 500 });
      if (blocksRes.error) return NextResponse.json({ error: blocksRes.error.message }, { status: 500 });

      const tasks = (tasksRes.data ?? []).map((r) => dbTaskToTask(r as DbTaskRow));
      const fixedEvents = (fixedRes.data ?? []).map((r) => dbFixedEventToFixedEvent(r as DbFixedEventRow));
      const prefs = prefsRes.data ? dbPreferencesToPreferences(prefsRes.data as DbPreferencesRow) : getPreferences(userId);

      const blocks = (blocksRes.data ?? []).map((r) => dbScheduleBlockToScheduleBlock(r as DbScheduleBlockRow));
      const nowMs = Date.now();
      const feasibility = estimateFeasibility({
        nowMs,
        horizonStartMs: nowMs,
        horizonEndMs: nowMs + 7 * DAY_MS,
        tasks,
        fixedEvents,
        preferences: prefs
      });

      const pseudoSchedule: any = { blocks, stats: { feasibilityPct: feasibility.feasibilityPct } };
      const stats = computeDashboardStats({
        tasks,
        lastSchedule: pseudoSchedule,
        timezoneOffsetMinutes: prefs.timezoneOffsetMinutes,
        maxWorkMinutesPerDay: prefs.maxWorkMinutesPerDay
      });

      return NextResponse.json({ storage: "supabase", stats, feasibility });
    }
  }

  const prefs = getPreferences(userId);
  const stats = computeDashboardStats({
    tasks: listTasks(userId),
    lastSchedule: getLastSchedule(userId),
    timezoneOffsetMinutes: prefs.timezoneOffsetMinutes,
    maxWorkMinutesPerDay: prefs.maxWorkMinutesPerDay
  });
  return NextResponse.json({ storage: "dev", stats });
}
