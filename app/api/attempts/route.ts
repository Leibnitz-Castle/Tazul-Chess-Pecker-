import { NextRequest, NextResponse } from "next/server";
import { createAttempt } from "@/lib/db";
import { PuzzleAttemptSchema } from "@/lib/validations/training-item";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PuzzleAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const attempt = await createAttempt({
      trainingItemId: parsed.data.training_item_id,
      isCorrect: parsed.data.is_correct,
      movePlayed: parsed.data.move_played,
      expectedMove: parsed.data.expected_move,
      timeMs: parsed.data.time_ms,
    });
    return NextResponse.json(attempt, { status: 201 });
  } catch (err) {
    console.error("[attempts POST]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
