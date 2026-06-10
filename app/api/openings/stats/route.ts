import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLineMetrics, calculateRepertoireMetrics } from "@/lib/openings/opening-metrics";

export async function GET() {
  try {
    const repertoires = await prisma.openingRepertoire.findMany({
      where: { devUserId: "dev-user-001" },
      include: {
        _count: { select: { lines: true, nodes: true } },
        lines: {
          select: {
            id: true,
            name: true,
            eco: true,
            attempts: {
              select: { isCorrect: true, timeMs: true, createdAt: true },
            },
          },
        },
      },
    });

    const stats = repertoires.map((rep) => {
      const lineMetrics = rep.lines.map((l) => ({
        lineId: l.id,
        lineName: l.name,
        eco: l.eco,
        metrics: calculateLineMetrics(
          l.attempts.map((a) => ({
            isCorrect: a.isCorrect,
            timeMs: a.timeMs,
            createdAt: a.createdAt,
          }))
        ),
      }));

      const allMetrics = lineMetrics.map((lm) => lm.metrics);
      const repMetrics = calculateRepertoireMetrics(
        rep._count.lines,
        rep._count.nodes,
        allMetrics
      );

      return {
        repertoireId: rep.id,
        name: rep.name,
        color: rep.color,
        metrics: repMetrics,
        lines: lineMetrics,
      };
    });

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[openings/stats GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
