// lib/supabase-client.ts
import { createClient } from "@supabase/supabase-js";

// Client-side (browser) Supabase
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
