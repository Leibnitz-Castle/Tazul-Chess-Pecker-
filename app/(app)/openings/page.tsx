import { OpeningsModule } from "./OpeningsModule";
import { prisma } from "@/lib/db";
import { calculateLineMetrics, calculateRepertoireMetrics } from "@/lib/openings/opening-metrics";

export const dynamic = "force-dynamic";

async function getRepertoires() {
  try {
    const reps = await prisma.openingRepertoire.findMany({
      where: { devUserId: "dev-user-001" },
      include: {
        _count: { select: { lines: true, nodes: true } },
        lines: {
          orderBy: { orderIndex: "asc" },
          include: {
            attempts: {
              select: { isCorrect: true, timeMs: true, createdAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return reps.map((rep) => {
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
        description: rep.description,
        sourceName: rep.sourceName,
        metrics,
        lines: rep.lines.map((l, i) => ({
          id: l.id,
          repertoireId: rep.id,
          name: l.name,
          eco: l.eco,
          side: l.side,
          pgn: l.pgn,
          moveCount: l.moveCount,
          isMainLine: l.isMainLine,
          orderIndex: l.orderIndex,
          metrics: lineMetrics[i],
          nodes: [] as {
            id: string;
            san: string;
            uci: string;
            fenAfter: string;
            moveNumber: number;
            ply: number;
          }[],
        })),
      };
    });
  } catch {
    return [];
  }
}

export default async function OpeningsPage() {
  const repertoires = await getRepertoires();
  return <OpeningsModule repertoires={repertoires} />;
}
