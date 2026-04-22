import { NextResponse } from "next/server";
import type { Task } from "@/types/planning";
import { getUserIdFromRequest, listTasks, newId, upsertTask } from "@/lib/dev-store";
import { clampNumber, toIso } from "@/lib/datetime";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import { dbTaskToTask, type DbTaskRow } from "@/lib/supabase/mappers";
import { taskCreateSchema } from "@/features/tasks/schemas";

export async function GET(req: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: true });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const tasks = (data ?? []).map((row) => dbTaskToTask(row as DbTaskRow));
      return NextResponse.json({ storage: "supabase", tasks: tasks satisfies Task[] });
    }
  }

  const userId = getUserIdFromRequest(req);
  return NextResponse.json({ storage: "dev", tasks: listTasks(userId) satisfies Task[] });
}

export async function POST(req: Request) {
  const nowIso = toIso(Date.now());

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task payload.", details: parsed.error.flatten() }, { status: 400 });
  }
  const payload = parsed.data;

  const task: Task = {
    id: "pending",
    title: payload.title,
    description: payload.description ?? null,
    category: payload.category ?? null,
    status: payload.status ?? "todo",
    createdAt: nowIso,
    updatedAt: nowIso,
    deadline: payload.deadline ?? null,
    estimatedMinutes: Math.floor(payload.estimatedMinutes),
    remainingMinutes: Math.floor(payload.remainingMinutes ?? payload.estimatedMinutes),
    priority: clampNumber(payload.priority ?? 3, 1, 5),
    difficulty: clampNumber(payload.difficulty ?? 3, 1, 5),
    splittable: payload.splittable ?? true,
    preferredTimeOfDay: payload.preferredTimeOfDay ?? "any"
  };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (user) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: task.title,
          description: task.description,
          category: task.category,
          status: task.status,
          deadline: task.deadline,
          estimated_minutes: task.estimatedMinutes,
          remaining_minutes: task.remainingMinutes,
          priority: task.priority,
          difficulty: task.difficulty,
          splittable: task.splittable,
          preferred_time_of_day: task.preferredTimeOfDay
        })
        .select("*")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const created = dbTaskToTask(data as DbTaskRow);
      return NextResponse.json({ storage: "supabase", task: created }, { status: 201 });
    }
  }

  const userId = getUserIdFromRequest(req);
  const devTask = { ...task, id: newId() };
  upsertTask(userId, devTask);
  return NextResponse.json({ storage: "dev", task: devTask }, { status: 201 });
}
