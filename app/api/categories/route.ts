// app/api/categories/route.ts
import { NextResponse } from "next/server";

import { supabase, createSupabaseServerClient } from "@/lib/supabase";

const supabaseServer = createSupabaseServerClient();
// app/api/categories/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 👈 income or expense

  let query = supabaseServer.from("categories").select("id, name, type");

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query.order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
