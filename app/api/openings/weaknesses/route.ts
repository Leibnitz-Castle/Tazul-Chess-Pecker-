import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLineMetrics } from "@/lib/openings/opening-metrics";

export async function GET() {
  try {
    const lines = await prisma.openingLine.findMany({
      where: {
        repertoire: { devUserId: "dev-user-001" },
        attempts: { some: {} },
      },
      include: {
        repertoire: { select: { id: true, name: true, color: true } },
        attempts: {
          select: { isCorrect: true, timeMs: true, createdAt: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    const withMetrics = lines.map((line) => ({
      id: line.id,
      name: line.name,
      eco: line.eco,
      repertoireId: line.repertoireId,
      repertoireName: line.repertoire.name,
      color: line.repertoire.color,
      metrics: calculateLineMetrics(
        line.attempts.map((a) => ({
          isCorrect: a.isCorrect,
          timeMs: a.timeMs,
          createdAt: a.createdAt,
        }))
      ),
    }));

    const weak = withMetrics
      .filter((l) => l.metrics.isWeak)
      .sort((a, b) => a.metrics.accuracy - b.metrics.accuracy);

    const dueForReview = withMetrics
      .filter((l) => l.metrics.isDueForReview && !l.metrics.isWeak)
      .sort(
        (a, b) =>
          (a.metrics.lastPracticedAt?.getTime() ?? 0) -
          (b.metrics.lastPracticedAt?.getTime() ?? 0)
      );

    return NextResponse.json({ weak, dueForReview });
  } catch (err) {
    console.error("[openings/weaknesses GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
