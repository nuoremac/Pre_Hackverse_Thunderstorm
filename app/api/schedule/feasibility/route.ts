import { NextResponse } from "next/server";
import type { PlanningPreferences, Task, FixedEvent } from "@/types/planning";
import { getPreferences, getUserIdFromRequest, listFixedEvents, listTasks } from "@/lib/dev-store";
import { DAY_MS, parseIsoMs } from "@/lib/datetime";
import { estimateFeasibility } from "@/features/schedule/feasibility";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, dbPreferencesToPreferences, dbTaskToTask, type DbFixedEventRow, type DbPreferencesRow, type DbTaskRow } from "@/lib/supabase/mappers";
import { defaultPreferences, sanitizePreferences } from "@/features/constraints/defaults";

export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
  }

  const nowMs = parseIsoMs(body?.now) ?? Date.now();
  const horizonStartMs = parseIsoMs(body?.horizon?.start) ?? nowMs;
  const horizonEndMs = parseIsoMs(body?.horizon?.end) ?? nowMs + 7 * DAY_MS;

  const useStored = body?.useStored !== false;
  if (useStored && isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      const [tasksRes, fixedRes, prefsRes] = await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("fixed_events").select("*"),
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

      const feasibility = estimateFeasibility({
        nowMs,
        horizonStartMs,
        horizonEndMs,
        tasks,
        fixedEvents,
        preferences
      });

      return NextResponse.json({ storage: "supabase", feasibility });
    }
  }

  const tasks: Task[] = useStored ? listTasks(userId) : (Array.isArray(body?.tasks) ? body.tasks : []);
  const fixedEvents: FixedEvent[] = useStored ? listFixedEvents(userId) : (Array.isArray(body?.fixedEvents) ? body.fixedEvents : []);
  const preferences: PlanningPreferences = useStored ? getPreferences(userId) : (body?.preferences as PlanningPreferences);

  const feasibility = estimateFeasibility({
    nowMs,
    horizonStartMs,
    horizonEndMs,
    tasks,
    fixedEvents,
    preferences
  });

  return NextResponse.json({ storage: "dev", feasibility });
}
