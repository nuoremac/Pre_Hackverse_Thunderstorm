import { NextResponse } from "next/server";
import type { GenerateScheduleInput, PlanningPreferences, Task, FixedEvent } from "@/types/planning";
import { getLastSchedule, getPreferences, getUserIdFromRequest, listFixedEvents, listTasks, setLastSchedule } from "@/lib/dev-store";
import { parseIsoMs } from "@/lib/datetime";
import { generateSchedule } from "@/features/schedule/engine";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, dbPreferencesToPreferences, dbTaskToTask, scheduleBlockToDbScheduleBlock, type DbFixedEventRow, type DbPreferencesRow, type DbTaskRow } from "@/lib/supabase/mappers";
import { defaultPreferences, sanitizePreferences } from "@/features/constraints/defaults";

export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  const previous = getLastSchedule(userId);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
  }

  const useStored = body?.useStored !== false;
  const persist = body?.persist !== false; // default true

  // If Supabase is configured AND the user has a session, use it as the source of truth.
  if (useStored && isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (user) {
      const [tasksRes, fixedRes, prefsRes] = await Promise.all([
        supabase.from("tasks").select("*").order("created_at", { ascending: true }),
        supabase.from("fixed_events").select("*").order("start_at", { ascending: true }),
        supabase.from("preferences").select("*").limit(1).maybeSingle()
      ]);

      if (tasksRes.error) return NextResponse.json({ error: tasksRes.error.message }, { status: 500 });
      if (fixedRes.error) return NextResponse.json({ error: fixedRes.error.message }, { status: 500 });
      if (prefsRes.error) return NextResponse.json({ error: prefsRes.error.message }, { status: 500 });

      const tasks: Task[] = (tasksRes.data ?? []).map((r) => dbTaskToTask(r as DbTaskRow));
      const fixedEvents: FixedEvent[] = (fixedRes.data ?? []).map((r) => dbFixedEventToFixedEvent(r as DbFixedEventRow));

      let preferences: PlanningPreferences;
      if (prefsRes.data) {
        preferences = dbPreferencesToPreferences(prefsRes.data as DbPreferencesRow);
      } else {
        const seeded = sanitizePreferences(defaultPreferences());
        const inserted = await supabase
          .from("preferences")
          .insert({
            user_id: user.id,
            timezone_offset_minutes: seeded.timezoneOffsetMinutes,
            workday_start_minutes: seeded.workdayStartMinutes,
            workday_end_minutes: seeded.workdayEndMinutes,
            max_work_minutes_per_day: seeded.maxWorkMinutesPerDay,
            focus_block_minutes: seeded.focusBlockMinutes,
            break_minutes: seeded.breakMinutes,
            buffer_minutes_between_sessions: seeded.bufferMinutesBetweenSessions,
            allowed_weekdays: seeded.allowedWeekdays
          })
          .select("*")
          .single();
        if (inserted.error) return NextResponse.json({ error: inserted.error.message }, { status: 500 });
        preferences = dbPreferencesToPreferences(inserted.data as DbPreferencesRow);
      }

      const payload: GenerateScheduleInput = {
        now: body?.now,
        horizon: body?.horizon,
        tasks,
        fixedEvents,
        preferences
      };

      const schedule = generateSchedule(payload);

      if (!body?.dryRun && persist) {
        const toPersist = schedule.blocks.filter((b) => b.type !== "fixed_event").map(scheduleBlockToDbScheduleBlock);
        const del = await supabase.from("schedule_blocks").delete().eq("user_id", user.id);
        if (del.error) {
          // Non-fatal: still return schedule, but surface the warning.
          schedule.warnings.push(`Could not clear previous schedule_blocks: ${del.error.message}`);
        } else if (toPersist.length > 0) {
          const ins = await supabase.from("schedule_blocks").insert(toPersist);
          if (ins.error) schedule.warnings.push(`Could not persist schedule_blocks: ${ins.error.message}`);
        }
      }

      return NextResponse.json({
        storage: "supabase",
        schedule,
        note: body?.includePrevious ? "previousSchedule is not implemented for Supabase yet." : undefined
      });
    }
  }

  const tasks: Task[] = useStored ? listTasks(userId) : (Array.isArray(body?.tasks) ? body.tasks : []);
  const fixedEvents: FixedEvent[] = useStored ? listFixedEvents(userId) : (Array.isArray(body?.fixedEvents) ? body.fixedEvents : []);
  const preferences: PlanningPreferences = useStored ? getPreferences(userId) : (body?.preferences as PlanningPreferences);

  const horizon = body?.horizon ?? {};
  if (horizon?.start && parseIsoMs(horizon.start) === null) {
    return NextResponse.json({ error: "horizon.start must be an ISO datetime string." }, { status: 400 });
  }
  if (horizon?.end && parseIsoMs(horizon.end) === null) {
    return NextResponse.json({ error: "horizon.end must be an ISO datetime string." }, { status: 400 });
  }

  const payload: GenerateScheduleInput = {
    now: body?.now,
    horizon,
    tasks,
    fixedEvents,
    preferences
  };

  const schedule = generateSchedule(payload);

  // Persist in the dev store unless dryRun=true
  if (!body?.dryRun) setLastSchedule(userId, schedule);

  return NextResponse.json({
    storage: "dev",
    schedule,
    previousSchedule: body?.includePrevious ? previous : undefined
  });
}
