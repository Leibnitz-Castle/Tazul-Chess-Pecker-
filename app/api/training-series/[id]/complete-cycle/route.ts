import { NextRequest, NextResponse } from "next/server";
import { completeCycle, getActiveCycle, prisma } from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const seriesId = params.id;

  try {
    const activeCycle = await getActiveCycle(seriesId);
    if (!activeCycle) {
      return NextResponse.json({ error: "No active cycle" }, { status: 400 });
    }

    const updated = await completeCycle(activeCycle.id);

    await prisma.trainingSeries.update({
      where: { id: seriesId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      cycle: {
        id: updated.id,
        cycleNumber: updated.cycleNumber,
        status: updated.status,
        completedAt: updated.completedAt?.toISOString() ?? null,
        solvedCount: updated.solvedCount,
        correctCount: updated.correctCount,
        incorrectCount: updated.incorrectCount,
        accuracy: updated.accuracy,
        averageTimeMs: updated.averageTimeMs,
        bestStreak: updated.bestStreak,
        totalTimeMs: updated.totalTimeMs,
        totalExercises: updated.totalExercises,
      },
    });
  } catch (err) {
    console.error("[complete-cycle POST]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
