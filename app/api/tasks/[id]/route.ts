import { NextResponse } from "next/server";
import type { Task } from "@/types/planning";
import { deleteTask, getTask, getUserIdFromRequest, upsertTask } from "@/lib/dev-store";
import { clampNumber, toIso } from "@/lib/datetime";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbTaskToTask, type DbTaskRow } from "@/lib/supabase/mappers";
import { taskPatchSchema } from "@/features/tasks/schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
      if (error) return NextResponse.json({ error: "Task not found." }, { status: 404 });
      const task = dbTaskToTask(data as DbTaskRow);
      return NextResponse.json({ storage: "supabase", task: task satisfies Task });
    }
  }

  const userId = getUserIdFromRequest(req);
  const task = getTask(userId, id);
  if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  return NextResponse.json({ storage: "dev", task: task satisfies Task });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = taskPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task patch payload.", details: parsed.error.flatten() }, { status: 400 });
  }
  const patch = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const update: any = {};
      if (patch.title !== undefined) update.title = patch.title;
      if (patch.description !== undefined) update.description = patch.description ?? null;
      if (patch.category !== undefined) update.category = patch.category ?? null;
      if (patch.status !== undefined) update.status = patch.status;
      if (patch.deadline !== undefined) update.deadline = patch.deadline ?? null;
      if (patch.estimatedMinutes !== undefined) update.estimated_minutes = patch.estimatedMinutes;
      if (patch.remainingMinutes !== undefined) update.remaining_minutes = patch.remainingMinutes;
      if (patch.priority !== undefined) update.priority = patch.priority;
      if (patch.difficulty !== undefined) update.difficulty = patch.difficulty;
      if (patch.splittable !== undefined) update.splittable = patch.splittable;
      if (patch.preferredTimeOfDay !== undefined) update.preferred_time_of_day = patch.preferredTimeOfDay;

      const { data, error } = await supabase.from("tasks").update(update).eq("id", id).select("*").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ storage: "supabase", task: dbTaskToTask(data as DbTaskRow) });
    }
  }

  const userId = getUserIdFromRequest(req);
  const existing = getTask(userId, id);
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const next: Task = {
    ...existing,
    title: patch.title !== undefined ? patch.title : existing.title,
    description: patch.description !== undefined ? patch.description ?? null : existing.description ?? null,
    category: patch.category !== undefined ? patch.category ?? null : existing.category ?? null,
    status: patch.status !== undefined ? patch.status : existing.status,
    deadline: patch.deadline !== undefined ? patch.deadline ?? null : existing.deadline ?? null,
    estimatedMinutes: patch.estimatedMinutes !== undefined ? Math.floor(patch.estimatedMinutes) : existing.estimatedMinutes,
    remainingMinutes: patch.remainingMinutes !== undefined ? Math.floor(patch.remainingMinutes) : existing.remainingMinutes,
    priority: patch.priority !== undefined ? clampNumber(patch.priority, 1, 5) : existing.priority,
    difficulty: patch.difficulty !== undefined ? clampNumber(patch.difficulty, 1, 5) : existing.difficulty,
    splittable: patch.splittable !== undefined ? Boolean(patch.splittable) : existing.splittable,
    preferredTimeOfDay: patch.preferredTimeOfDay !== undefined ? patch.preferredTimeOfDay : existing.preferredTimeOfDay ?? "any",
    updatedAt: toIso(Date.now())
  };

  upsertTask(userId, next);
  return NextResponse.json({ storage: "dev", task: next });
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data || data.length === 0) return NextResponse.json({ error: "Task not found." }, { status: 404 });
      return NextResponse.json({ storage: "supabase", ok: true });
    }
  }

  const userId = getUserIdFromRequest(req);
  const ok = deleteTask(userId, id);
  if (!ok) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  return NextResponse.json({ storage: "dev", ok: true });
}
