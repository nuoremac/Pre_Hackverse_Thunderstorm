"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvErrorMessage, getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const publicKey = getSupabasePublicKey();
  if (!url || !publicKey) throw new Error(getSupabaseEnvErrorMessage());

  return createBrowserClient(url, publicKey);
}
