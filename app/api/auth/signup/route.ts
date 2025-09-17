import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // 1️⃣ Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const userId = authData.user?.id;
  if (!userId) return NextResponse.json({ error: "User ID not found after signup" }, { status: 500 });

  try {
    // 2️⃣ Insert default categories
    const defaultCategories = [
      { user_id: userId, name: "Salary", type: "income" },
      { user_id: userId, name: "Investment", type: "income" },
      { user_id: userId, name: "Food", type: "expense" },
      { user_id: userId, name: "Transport", type: "expense" },
      { user_id: userId, name: "Entertainment", type: "expense" },
    ];
    await supabase.from("categories").insert(defaultCategories);

    // 3️⃣ Insert default accounts
    const defaultAccounts = [
      { user_id: userId, name: "Cash", balance: 0 },
      { user_id: userId, name: "Bank Account", balance: 0 },
    ];
    await supabase.from("accounts").insert(defaultAccounts);

    // 4️⃣ Optional: insert a default budget (e.g., monthly food budget)
    const { data: foodCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "Food")
      .single();

    if (foodCategory?.id) {
      await supabase.from("budgets").insert([
        { user_id: userId, category_id: foodCategory.id, amount: 5000, period: "monthly" },
      ]);
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error creating default data" }, { status: 500 });
  }

  // 5️⃣ Return user data
  return NextResponse.json({ user: authData.user });
}
