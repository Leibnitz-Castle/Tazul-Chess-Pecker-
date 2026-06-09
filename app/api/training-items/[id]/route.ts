import { NextRequest, NextResponse } from "next/server";
import { getTrainingItemById } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await getTrainingItemById(params.id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    console.error("[training-items/[id] GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
