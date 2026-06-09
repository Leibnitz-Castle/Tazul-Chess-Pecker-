import { NextRequest, NextResponse } from "next/server";
import { getTrainingItems } from "@/lib/db";
import { TrainingFiltersSchema } from "@/lib/validations/training-item";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const parsed = TrainingFiltersSchema.safeParse({
    chapter: searchParams.get("chapter") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    side_to_move: searchParams.get("side_to_move") ?? undefined,
    source_name: searchParams.get("source_name") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await getTrainingItems(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[training-items GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
