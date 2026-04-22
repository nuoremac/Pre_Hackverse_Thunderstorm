import { NextResponse } from "next/server";
import type { FixedEvent } from "@/types/planning";
import { deleteFixedEvent, getFixedEvent, getUserIdFromRequest, upsertFixedEvent } from "@/lib/dev-store";
import { toIso } from "@/lib/datetime";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbFixedEventToFixedEvent, type DbFixedEventRow } from "@/lib/supabase/mappers";
import { fixedEventPatchSchema } from "@/features/fixed-events/schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data, error } = await supabase.from("fixed_events").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: "Fixed event not found." }, { status: 404 });
      return NextResponse.json({ storage: "supabase", fixedEvent: dbFixedEventToFixedEvent(data as DbFixedEventRow) });
    }
  }

  const userId = getUserIdFromRequest(req);
  const ev = getFixedEvent(userId, id);
  if (!ev) return NextResponse.json({ error: "Fixed event not found." }, { status: 404 });
  return NextResponse.json({ storage: "dev", fixedEvent: ev satisfies FixedEvent });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = fixedEventPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fixed event patch payload.", details: parsed.error.flatten() }, { status: 400 });
  }
  const patch = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const update: any = {};
      if (patch.title !== undefined) update.title = patch.title;
      if (patch.startAt !== undefined) update.start_at = patch.startAt;
      if (patch.endAt !== undefined) update.end_at = patch.endAt;
      if (patch.location !== undefined) update.location = patch.location ?? null;

      const { data, error } = await supabase.from("fixed_events").update(update).eq("id", id).select("*").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ storage: "supabase", fixedEvent: dbFixedEventToFixedEvent(data as DbFixedEventRow) });
    }
  }

  const userId = getUserIdFromRequest(req);
  const existing = getFixedEvent(userId, id);
  if (!existing) return NextResponse.json({ error: "Fixed event not found." }, { status: 404 });

  const next: FixedEvent = {
    ...existing,
    title: patch.title !== undefined ? patch.title : existing.title,
    startAt: patch.startAt !== undefined ? patch.startAt : existing.startAt,
    endAt: patch.endAt !== undefined ? patch.endAt : existing.endAt,
    location: patch.location !== undefined ? patch.location ?? null : existing.location ?? null,
    updatedAt: toIso(Date.now())
  };

  upsertFixedEvent(userId, next);
  return NextResponse.json({ storage: "dev", fixedEvent: next });
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data, error } = await supabase.from("fixed_events").delete().eq("id", id).select("id");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data || data.length === 0) return NextResponse.json({ error: "Fixed event not found." }, { status: 404 });
      return NextResponse.json({ storage: "supabase", ok: true });
    }
  }

  const userId = getUserIdFromRequest(req);
  const ok = deleteFixedEvent(userId, id);
  if (!ok) return NextResponse.json({ error: "Fixed event not found." }, { status: 404 });
  return NextResponse.json({ storage: "dev", ok: true });
}
