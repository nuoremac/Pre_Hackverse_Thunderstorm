import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getProfile, getUserIdFromRequest, updateProfile } from "@/lib/dev-store";
import type { UserProfile } from "@/types/profile";

export async function GET(req: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profile: UserProfile = {
      fullName: data?.full_name?.trim() || user.user_metadata?.full_name || user.email || "User",
      email: user.email || "",
      mode: "supabase"
    };

    return NextResponse.json({ storage: "supabase", profile });
  }

  const userId = getUserIdFromRequest(req);
  return NextResponse.json({ storage: "dev", profile: getProfile(userId) });
}

export async function PUT(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  if (!fullName) {
    return NextResponse.json({ error: "fullName is required." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, full_name: fullName }, { onConflict: "user_id" })
      .select("full_name")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      storage: "supabase",
      profile: {
        fullName: data.full_name?.trim() || fullName,
        email: user.email || "",
        mode: "supabase"
      } satisfies UserProfile
    });
  }

  const userId = getUserIdFromRequest(req);
  return NextResponse.json({ storage: "dev", profile: updateProfile(userId, { fullName }) });
}
