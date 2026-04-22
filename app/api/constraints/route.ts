import { NextResponse } from "next/server";
import type { PlanningPreferences } from "@/types/planning";
import { getPreferences, getUserIdFromRequest, updatePreferences } from "@/lib/dev-store";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbPreferencesToPreferences, type DbPreferencesRow } from "@/lib/supabase/mappers";
import { defaultPreferences, sanitizePreferences } from "@/features/constraints/defaults";
import { preferencesPatchSchema } from "@/features/constraints/schemas";

export async function GET(req: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      const { data, error } = await supabase.from("preferences").select("*").limit(1).maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (data) {
        return NextResponse.json({ storage: "supabase", preferences: dbPreferencesToPreferences(data as DbPreferencesRow) satisfies PlanningPreferences });
      }

      const seeded = sanitizePreferences(defaultPreferences());
      const { data: created, error: insertError } = await supabase
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

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
      return NextResponse.json({ storage: "supabase", preferences: dbPreferencesToPreferences(created as DbPreferencesRow) });
    }
  }

  const userId = getUserIdFromRequest(req);
  return NextResponse.json({ storage: "dev", preferences: getPreferences(userId) satisfies PlanningPreferences });
}

export async function PUT(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = preferencesPatchSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences payload.", details: parsed.error.flatten() }, { status: 400 });
  }
  const patch = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      // Ensure we always store a fully-specified, sanitized preferences row.
      const current = await supabase.from("preferences").select("*").limit(1).maybeSingle();
      if (current.error) return NextResponse.json({ error: current.error.message }, { status: 500 });
      const merged = sanitizePreferences({ ...(current.data ? dbPreferencesToPreferences(current.data as DbPreferencesRow) : defaultPreferences()), ...patch });

      const { data, error } = await supabase
        .from("preferences")
        .upsert({
          user_id: user.id,
          timezone_offset_minutes: merged.timezoneOffsetMinutes,
          workday_start_minutes: merged.workdayStartMinutes,
          workday_end_minutes: merged.workdayEndMinutes,
          max_work_minutes_per_day: merged.maxWorkMinutesPerDay,
          focus_block_minutes: merged.focusBlockMinutes,
          break_minutes: merged.breakMinutes,
          buffer_minutes_between_sessions: merged.bufferMinutesBetweenSessions,
          allowed_weekdays: merged.allowedWeekdays
        }, { onConflict: "user_id" })
        .select("*")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ storage: "supabase", preferences: dbPreferencesToPreferences(data as DbPreferencesRow) });
    }
  }

  const userId = getUserIdFromRequest(req);
  const next = updatePreferences(userId, patch);
  return NextResponse.json({ storage: "dev", preferences: next });
}
