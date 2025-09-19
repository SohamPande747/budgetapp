// app/api/accounts/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type AccountRecord = {
  id: string;
  name: string;
  type?: string;
  balance: number;
};

// ---------------- GET accounts with balances ----------------
export async function GET() {
  try {
    const supabaseServer = await createSupabaseServerClient();

    // Get all accounts for the current user
    const { data: accounts, error: accountsError } = await supabaseServer
      .from("accounts")
      .select("id, name, type");

    if (accountsError) throw accountsError;

    // Get all transactions for the current user
    const { data: transactions, error: txError } = await supabaseServer
      .from("transactions")
      .select("account_id, type, amount");

    if (txError) throw txError;

    // Compute balances by account_id
    const balances: Record<string, number> = {};
    transactions.forEach((tx) => {
      const key = tx.account_id;
      if (!balances[key]) balances[key] = 0;
      balances[key] += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    });

    const result: AccountRecord[] = accounts.map((acc) => ({
      ...acc,
      balance: balances[acc.id] ?? 0,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch accounts" }, { status: 500 });
  }
}

// ---------------- POST new account ----------------
export async function POST(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { name, type, balance } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing account name" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("accounts")
      .insert([{ name, type: type ?? "checking", balance: balance ?? 0 }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Failed to insert account" }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

// ---------------- PATCH (rename or update type) ----------------
export async function PATCH(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { id, name, type } = await req.json();

    if (!id || (!name && !type)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updateObj: Partial<{ name: string; type: string }> = {};
    if (name) updateObj.name = name;
    if (type) updateObj.type = type;

    const { data, error } = await supabaseServer
      .from("accounts")
      .update(updateObj)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update account" }, { status: 500 });
  }
}

// ---------------- DELETE account ----------------
export async function DELETE(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseServer.from("accounts").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete account" }, { status: 500 });
  }
}
