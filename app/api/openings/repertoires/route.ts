import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateRepertoireMetrics, calculateLineMetrics } from "@/lib/openings/opening-metrics";

export async function GET() {
  try {
    const repertoires = await prisma.openingRepertoire.findMany({
      where: { devUserId: "dev-user-001" },
      include: {
        _count: { select: { lines: true, nodes: true } },
        lines: {
          select: {
            id: true,
            attempts: {
              select: { isCorrect: true, timeMs: true, createdAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const result = repertoires.map((rep) => {
      const lineMetrics = rep.lines.map((l) =>
        calculateLineMetrics(
          l.attempts.map((a) => ({
            isCorrect: a.isCorrect,
            timeMs: a.timeMs,
            createdAt: a.createdAt,
          }))
        )
      );
      const metrics = calculateRepertoireMetrics(
        rep._count.lines,
        rep._count.nodes,
        lineMetrics
      );

      return {
        id: rep.id,
        name: rep.name,
        color: rep.color,
        sourceType: rep.sourceType,
        sourceName: rep.sourceName,
        description: rep.description,
        createdAt: rep.createdAt,
        metrics,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[openings/repertoires GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
