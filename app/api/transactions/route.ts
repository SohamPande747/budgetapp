// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, createSupabaseServerClient } from "@/lib/supabase";

const supabaseServer = createSupabaseServerClient();

// --------------------- POST ---------------------
export async function POST(req: NextRequest) {
  try {
    const { type, account, amount, date, category_id } = await req.json();

    if (!type || !account || typeof amount !== "number" || amount <= 0 || !category_id) {
      console.log("Validation failed:", { type, account, amount, category_id });
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("transactions")
      .insert([{ type, account, amount, date, category_id }])
      .select();

    if (error) {
      console.log("Supabase insert error:", error);
      throw error;
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add transaction" },
      { status: 500 }
    );
  }
}
// --------------------- GET ---------------------
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("transactions")
      .select("id, type, account, amount, date, category_id") // ❌ no join
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch transactions" }, { status: 500 });
  }
}


// --------------------- PATCH ---------------------
export async function PATCH(req: NextRequest) {
  try {
    const { id, amount, type, account, category_id } = await req.json();

    // ✅ Validation
    if (!id || !type || !account || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("transactions")
      .update({ amount, type, account, category_id })
      .eq("id", id)
      .select()
      .single(); // ensures single object

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    return NextResponse.json({ transaction: data });
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

// --------------------- DELETE ---------------------
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // ✅ Validation
    if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
