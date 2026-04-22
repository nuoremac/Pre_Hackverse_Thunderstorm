import { NextResponse } from "next/server";
import { getLastSchedule, getPreferences, getUserIdFromRequest, listFixedEvents, listTasks, setLastSchedule } from "@/lib/dev-store";
import { generateSchedule } from "@/features/schedule/engine";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, dbPreferencesToPreferences, dbTaskToTask, scheduleBlockToDbScheduleBlock, type DbFixedEventRow, type DbPreferencesRow, type DbTaskRow } from "@/lib/supabase/mappers";
import type { FixedEvent, PlanningPreferences, Task } from "@/types/planning";
import { defaultPreferences, sanitizePreferences } from "@/features/constraints/defaults";

export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  const previous = getLastSchedule(userId);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // allow empty
  }

  if (isSupabaseConfigured()) {
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
      const preferences: PlanningPreferences = prefsRes.data
        ? dbPreferencesToPreferences(prefsRes.data as DbPreferencesRow)
        : sanitizePreferences(defaultPreferences());

      const schedule = generateSchedule({
        now: body?.now,
        horizon: body?.horizon,
        tasks,
        fixedEvents,
        preferences
      });

      // Persist schedule blocks to Supabase (best-effort)
      if (!body?.dryRun) {
        const toPersist = schedule.blocks.filter((b) => b.type !== "fixed_event").map(scheduleBlockToDbScheduleBlock);
        const del = await supabase.from("schedule_blocks").delete().eq("user_id", user.id);
        if (del.error) schedule.warnings.push(`Could not clear previous schedule_blocks: ${del.error.message}`);
        else if (toPersist.length > 0) {
          const ins = await supabase.from("schedule_blocks").insert(toPersist);
          if (ins.error) schedule.warnings.push(`Could not persist schedule_blocks: ${ins.error.message}`);
        }
      }

      return NextResponse.json({
        storage: "supabase",
        schedule,
        note: "Reschedule currently regenerates the plan from the latest tasks + constraints. Next step: handle 'missed blocks' explicitly."
      });
    }
  }

  // MVP: reschedule = regenerate using current stored state.
  const schedule = generateSchedule({
    now: body?.now,
    horizon: body?.horizon,
    tasks: listTasks(userId),
    fixedEvents: listFixedEvents(userId),
    preferences: getPreferences(userId)
  });

  setLastSchedule(userId, schedule);

  return NextResponse.json({
    storage: "dev",
    schedule,
    previousSchedule: previous,
    note: "MVP reschedule regenerates the plan from the latest tasks + constraints. Next step: handle 'missed blocks' as explicit inputs."
  });
}
