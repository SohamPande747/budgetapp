// app/api/auth/google/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client for public (client-scoped) operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // OAuth returns a redirect URL
    return NextResponse.redirect(data.url);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "OAuth initiation failed" }, { status: 500 });
  }
}
