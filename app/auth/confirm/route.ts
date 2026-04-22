import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (!isSupabaseConfigured()) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "supabase_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();

  // 1. Handle PKCE Code Flow (Modern standard for @supabase/ssr)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(redirectTo);
    } else {
      console.error("Auth Confirmation Error (Code):", error.message);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "auth_code_exchange_failed");
      loginUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Handle Token Hash Flow (OTP / Magic Link)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    } else {
      console.error("Auth Confirmation Error (Token):", error.message);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "auth_token_verify_failed");
      loginUrl.searchParams.set("message", error.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Fallback if no valid auth parameters were found
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("error", "invalid_auth_params");
  loginUrl.searchParams.set("message", "No valid authentication parameters (code or token_hash) were found in the URL.");
  return NextResponse.redirect(loginUrl);
}

