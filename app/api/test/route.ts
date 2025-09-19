import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/getSessionUser";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
