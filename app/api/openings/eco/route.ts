import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const lines = await prisma.openingLine.findMany({
      where: {
        repertoire: { devUserId: "dev-user-001" },
        eco: { not: null },
      },
      select: {
        id: true,
        eco: true,
        attempts: { select: { isCorrect: true } },
      },
    });

    // Group by ECO prefix (e.g. "B9" from "B95")
    const ecoMap = new Map<
      string,
      { lines: number; attempts: number; correct: number }
    >();

    for (const line of lines) {
      const eco = line.eco!;
      const existing = ecoMap.get(eco) ?? { lines: 0, attempts: 0, correct: 0 };
      existing.lines++;
      existing.attempts += line.attempts.length;
      existing.correct += line.attempts.filter((a) => a.isCorrect).length;
      ecoMap.set(eco, existing);
    }

    const result = Array.from(ecoMap.entries())
      .map(([eco, data]) => ({
        eco,
        family: eco[0],
        lines: data.lines,
        attempts: data.attempts,
        accuracy: data.attempts > 0 ? data.correct / data.attempts : null,
      }))
      .sort((a, b) => a.eco.localeCompare(b.eco));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[openings/eco GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
