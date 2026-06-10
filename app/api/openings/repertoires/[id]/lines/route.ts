import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLineMetrics } from "@/lib/openings/opening-metrics";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lines = await prisma.openingLine.findMany({
      where: { repertoireId: params.id },
      orderBy: { orderIndex: "asc" },
      include: {
        attempts: {
          select: { isCorrect: true, timeMs: true, createdAt: true },
        },
        lineNodes: {
          orderBy: { orderIndex: "asc" },
          select: {
            orderIndex: true,
            node: {
              select: { id: true, san: true, uci: true, fenAfter: true, moveNumber: true, ply: true },
            },
          },
        },
      },
    });

    const result = lines.map((line) => {
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
        nodes: line.lineNodes.map((ln) => ({
          ...ln.node,
          orderIndex: ln.orderIndex,
        })),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[openings/repertoires/[id]/lines GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
