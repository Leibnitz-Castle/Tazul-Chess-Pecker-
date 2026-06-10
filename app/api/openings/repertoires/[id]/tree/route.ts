import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nodes = await prisma.openingMoveNode.findMany({
      where: { repertoireId: params.id },
      select: {
        id: true,
        parentId: true,
        san: true,
        uci: true,
        fenAfter: true,
        fenBefore: true,
        moveNumber: true,
        ply: true,
        eco: true,
        lineName: true,
        path: true,
        depth: true,
        isMainLine: true,
        orderIndex: true,
        attempts: {

          select: { isCorrect: true, timeMs: true, createdAt: true },
        },
      },
      orderBy: [{ depth: "asc" }, { orderIndex: "asc" }],
    });

    const enriched = nodes.map((n) => {
      const total = n.attempts.length;
      const correct = n.attempts.filter((a) => a.isCorrect).length;
      const accuracy = total > 0 ? correct / total : null;
      const lastPracticed =
        total > 0
          ? n.attempts.reduce(
              (d, a) => (a.createdAt > d ? a.createdAt : d),
              n.attempts[0].createdAt
            )
          : null;

      return {
        id: n.id,
        parentId: n.parentId,
        san: n.san,
        uci: n.uci,
        fenAfter: n.fenAfter,
        fenBefore: n.fenBefore,
        moveNumber: n.moveNumber,
        ply: n.ply,
        eco: n.eco,
        lineName: n.lineName,
        path: n.path,
        depth: n.depth,
        isMainLine: n.isMainLine,
        orderIndex: n.orderIndex,
        stats: { total, correct, accuracy, lastPracticed },
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[openings/repertoires/[id]/tree GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
