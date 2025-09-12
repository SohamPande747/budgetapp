import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for server-side
);

export async function POST(req: Request) {
  try {
    const { type, account, amount, date } = await req.json();

    const { data, error } = await supabase
      .from("transactions")
      .insert([{ type, account, amount, date }])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add transaction" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
