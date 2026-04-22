import { NextResponse } from "next/server";
import type { FixedEvent } from "@/types/planning";
import { getUserIdFromRequest, listFixedEvents, newId, upsertFixedEvent } from "@/lib/dev-store";
import { toIso } from "@/lib/datetime";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, type DbFixedEventRow } from "@/lib/supabase/mappers";
import { fixedEventCreateSchema } from "@/features/fixed-events/schemas";

export async function GET(req: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data, error } = await supabase.from("fixed_events").select("*").order("start_at", { ascending: true });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const fixedEvents = (data ?? []).map((row) => dbFixedEventToFixedEvent(row as DbFixedEventRow));
      return NextResponse.json({ storage: "supabase", fixedEvents: fixedEvents satisfies FixedEvent[] });
    }
  }

  const userId = getUserIdFromRequest(req);
  return NextResponse.json({ storage: "dev", fixedEvents: listFixedEvents(userId) satisfies FixedEvent[] });
}

export async function POST(req: Request) {
  const nowIso = toIso(Date.now());

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = fixedEventCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fixed event payload.", details: parsed.error.flatten() }, { status: 400 });
  }
  const payload = parsed.data;

  const ev: FixedEvent = {
    id: "pending",
    title: payload.title,
    startAt: payload.startAt,
    endAt: payload.endAt,
    location: payload.location ?? null,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data, error } = await supabase
        .from("fixed_events")
        .insert({
          title: ev.title,
          start_at: ev.startAt,
          end_at: ev.endAt,
          location: ev.location
        })
        .select("*")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ storage: "supabase", fixedEvent: dbFixedEventToFixedEvent(data as DbFixedEventRow) }, { status: 201 });
    }
  }

  const userId = getUserIdFromRequest(req);
  const devEv = { ...ev, id: newId() };
  upsertFixedEvent(userId, devEv);
  return NextResponse.json({ storage: "dev", fixedEvent: devEv }, { status: 201 });
}
