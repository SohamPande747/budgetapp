// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Sign in user
    const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signin failed" }, { status: 500 });
  }
}
