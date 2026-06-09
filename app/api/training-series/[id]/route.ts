import { NextRequest, NextResponse } from "next/server";
import { getSeriesById } from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const data = await getSeriesById(params.id);
    if (!data) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[training-series/[id] GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
