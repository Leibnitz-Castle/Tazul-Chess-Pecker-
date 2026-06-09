import { NextResponse } from "next/server";
import { getWoodpeckerStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getWoodpeckerStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[stats/woodpecker GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
