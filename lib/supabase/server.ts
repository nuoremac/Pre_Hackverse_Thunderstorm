import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvErrorMessage, getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/config";

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublicKey());
}

export async function createSupabaseServerClient() {
  const url = getSupabaseUrl();
  const publicKey = getSupabasePublicKey();
  if (!url || !publicKey) throw new Error(getSupabaseEnvErrorMessage());

  const cookieStore = await cookies();
  const cookieStoreAny = cookieStore as any;

  return createServerClient(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStoreAny.getAll();
      },
      setAll(cookiesToSet) {
        // Route handlers can set cookies; server components may be read-only.
        try {
          for (const { name, value, options } of cookiesToSet) cookieStoreAny.set(name, value, options);
        } catch {
          // ignore
        }
      }
    }
  });
}
