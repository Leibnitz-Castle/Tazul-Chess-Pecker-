import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const AttemptSchema = z.object({
  repertoireId: z.string().uuid(),
  lineId: z.string().uuid().optional(),
  nodeId: z.string().uuid(),
  movePlayed: z.string().min(1).max(10),
  expectedMove: z.string().min(1).max(10),
  isCorrect: z.boolean(),
  timeMs: z.number().int().min(0),
  attemptType: z.enum(["PRACTICE", "QUIZ", "REVIEW"]).default("PRACTICE"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  try {
    const attempt = await prisma.openingAttempt.create({
      data: {
        repertoireId: d.repertoireId,
        lineId: d.lineId ?? null,
        nodeId: d.nodeId,
        movePlayed: d.movePlayed,
        expectedMove: d.expectedMove,
        isCorrect: d.isCorrect,
        timeMs: d.timeMs,
        attemptType: d.attemptType,
      },
    });
    return NextResponse.json(attempt, { status: 201 });
  } catch (err) {
    console.error("[openings/attempt POST]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
