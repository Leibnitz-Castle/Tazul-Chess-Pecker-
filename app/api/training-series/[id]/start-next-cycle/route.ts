import { NextRequest, NextResponse } from "next/server";
import { startNextCycle, getSeriesById } from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const seriesId = params.id;

  try {
    const newCycle = await startNextCycle(seriesId);
    const seriesData = await getSeriesById(seriesId);

    return NextResponse.json({
      cycle: {
        id: newCycle.id,
        cycleNumber: newCycle.cycleNumber,
        status: newCycle.status,
        startedAt: newCycle.startedAt.toISOString(),
        totalExercises: newCycle.totalExercises,
      },
      firstExercise: seriesData?.currentExercise ?? null,
    });
  } catch (err) {
    console.error("[start-next-cycle POST]", err);
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
