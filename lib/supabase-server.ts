// lib/supabase-server.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server-side Supabase client
export async function createSupabaseServerClient(p0: unknown): Promise<SupabaseClient> {
  // Read auth cookie to respect RLS
  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // user-scoped, respects RLS
    {
      global: { headers: { cookie: cookieHeader } },
    }
  );
}
