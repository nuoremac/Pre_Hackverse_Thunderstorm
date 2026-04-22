import { NextResponse } from "next/server";
import { getLastSchedule, getUserIdFromRequest } from "@/lib/dev-store";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, dbScheduleBlockToScheduleBlock, type DbFixedEventRow, type DbScheduleBlockRow } from "@/lib/supabase/mappers";
import { toIso } from "@/lib/datetime";

export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      const [blocksRes, fixedRes] = await Promise.all([
        supabase.from("schedule_blocks").select("*").order("start_at", { ascending: true }),
        supabase.from("fixed_events").select("*").order("start_at", { ascending: true })
      ]);

      if (blocksRes.error) return NextResponse.json({ error: blocksRes.error.message }, { status: 500 });
      if (fixedRes.error) return NextResponse.json({ error: fixedRes.error.message }, { status: 500 });

      const blocks = (blocksRes.data ?? []).map((r) => dbScheduleBlockToScheduleBlock(r as DbScheduleBlockRow));
      const fixedBlocks = (fixedRes.data ?? []).map((r) => {
        const ev = dbFixedEventToFixedEvent(r as DbFixedEventRow);
        return {
          id: ev.id,
          type: "fixed_event" as const,
          title: ev.title,
          startAt: ev.startAt,
          endAt: ev.endAt,
          meta: { location: ev.location ?? null },
          reason: "Fixed event (hard constraint)."
        };
      });

      const merged = [...fixedBlocks, ...blocks].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
      return NextResponse.json({ storage: "supabase", schedule: { generatedAt: toIso(Date.now()), blocks: merged } });
    }
  }

  const schedule = getLastSchedule(userId);
  return NextResponse.json({ storage: "dev", schedule });
}
