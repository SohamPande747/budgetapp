// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient({ req });

    const { type, account_id, amount, date, category_id } = await req.json();

    if (!type || !account_id || typeof amount !== "number" || amount <= 0 || !category_id) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseServer
      .from("transactions")
      .insert([{
        user_id: user.id,
        type,
        account_id,
        amount,
        date: date ?? new Date().toISOString(),
        category_id,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to add transaction" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient({ req });
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseServer
      .from("transactions")
      .select(`
        id,
        type,
        amount,
        date,
        category:categories(name, type),
        account:accounts(name, balance)
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient({ req });
    const { id, amount, type, account_id, category_id } = await req.json();

    if (!id || !type || !account_id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseServer
      .from("transactions")
      .update({ amount, type, account_id, category_id })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    return NextResponse.json({ transaction: data });
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient({ req });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseServer
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
