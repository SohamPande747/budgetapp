// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1️⃣ Sign up the user
    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found after signup" }, { status: 500 });
    }

    // 2️⃣ Insert default categories
    const defaultCategories = [
      { user_id: userId, name: "Salary", type: "income" },
      { user_id: userId, name: "Investment", type: "income" },
      { user_id: userId, name: "Food", type: "expense" },
      { user_id: userId, name: "Transport", type: "expense" },
      { user_id: userId, name: "Entertainment", type: "expense" },
    ];
    await supabaseServer.from("categories").insert(defaultCategories);

    // 3️⃣ Insert default accounts
    const defaultAccounts = [
      { user_id: userId, name: "Cash", balance: 0 },
      { user_id: userId, name: "Bank Account", balance: 0 },
    ];
    await supabaseServer.from("accounts").insert(defaultAccounts);

    // 4️⃣ Insert default budget for "Food"
    const { data: foodCategory } = await supabaseServer
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "Food")
      .single();

    if (foodCategory?.id) {
      await supabaseServer.from("budgets").insert([
        { user_id: userId, category_id: foodCategory.id, amount: 5000, period: "monthly" },
      ]);
    }

    // 5️⃣ Return the signed-up user
    return NextResponse.json({ user: authData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
