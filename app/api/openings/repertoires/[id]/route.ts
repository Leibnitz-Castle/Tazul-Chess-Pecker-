import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLineMetrics } from "@/lib/openings/opening-metrics";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rep = await prisma.openingRepertoire.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          orderBy: { orderIndex: "asc" },
          include: {
            attempts: {
              select: { isCorrect: true, timeMs: true, createdAt: true },
            },
          },
        },
        _count: { select: { nodes: true } },
      },
    });

    if (!rep) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lines = rep.lines.map((line) => {
      const metrics = calculateLineMetrics(
        line.attempts.map((a) => ({
          isCorrect: a.isCorrect,
          timeMs: a.timeMs,
          createdAt: a.createdAt,
        }))
      );
      return {
        id: line.id,
        name: line.name,
        eco: line.eco,
        side: line.side,
        pgn: line.pgn,
        startFen: line.startFen,
        finalFen: line.finalFen,
        moveCount: line.moveCount,
        isMainLine: line.isMainLine,
        orderIndex: line.orderIndex,
        metrics,
      };
    });

    return NextResponse.json({
      id: rep.id,
      name: rep.name,
      color: rep.color,
      description: rep.description,
      totalNodes: rep._count.nodes,
      lines,
    });
  } catch (err) {
    console.error("[openings/repertoires/[id] GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
