// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabaseServer = await createSupabaseServerClient({ req, res: undefined });

    // Get current logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get optional type filter from query string
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "income" or "expense"

    // Fetch categories for the user
    let query = supabaseServer
      .from("categories")
      .select("id, name, type")
      .eq("user_id", user.id);

    if (type) query = query.eq("type", type);

    const { data, error } = await query.order("name", { ascending: true });

    if (error) {
      console.error("GET categories error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("GET categories exception:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
