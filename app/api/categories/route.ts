import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// --------------------- GET ---------------------
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("transactions")
      .select("id, type, account, amount, date, category_id") // ✅ no join
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST new transaction
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, account, amount, date, category_id } = body;

    if (!type || !account || !amount || !date || !category_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([{ type, account, amount, date, category_id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH transaction
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, type, account, amount, categoryId } = body;

    if (!id) return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });

    const { data, error } = await supabase
      .from("transactions")
      .update({ type, account, amount, category_id: categoryId })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ transaction: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE transaction
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
