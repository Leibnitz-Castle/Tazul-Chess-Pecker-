import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getActiveCycle,
  getSeriesById,
  recordExerciseAttempt,
  completeCycle,
  prisma,
} from "@/lib/db";
import { SOLUTION_SHOWN_MOVE } from "@/lib/training/attempt-types";

const AttemptSchema = z.object({
  trainingItemId: z.string().uuid(),
  // movePlayed is a UCI move (4-5 chars) or the solution-shown sentinel
  movePlayed: z.union([z.string().min(4).max(5), z.literal(SOLUTION_SHOWN_MOVE)]),
  expectedMove: z.string().min(4).max(5),
  isCorrect: z.boolean(),
  timeMs: z.number().int().nonnegative(),
  fen: z.string().min(10),
  attemptNumber: z.number().int().positive(),
});

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const seriesId = params.id;
  const data = parsed.data;

  try {
    const activeCycle = await getActiveCycle(seriesId);
    if (!activeCycle) {
      return NextResponse.json({ error: "No active cycle found" }, { status: 400 });
    }

    const attempt = await recordExerciseAttempt({
      trainingItemId: data.trainingItemId,
      seriesId,
      cycleId: activeCycle.id,
      movePlayed: data.movePlayed,
      expectedMove: data.expectedMove,
      isCorrect: data.isCorrect,
      timeMs: data.timeMs,
      attemptNumber: data.attemptNumber,
      fen: data.fen,
    });

    // Reload series and cycle after update
    const seriesData = await getSeriesById(seriesId);
    if (!seriesData) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const updatedCycle = await prisma.trainingCycle.findUnique({
      where: { id: activeCycle.id },
    });

    // Exercise is "completed" for series progress when correct OR solution shown
    const isSolutionShown = data.movePlayed === SOLUTION_SHOWN_MOVE;
    const exerciseCompleted = data.isCorrect || isSolutionShown;

    const isLastExercise =
      exerciseCompleted && seriesData.series.currentIndex >= seriesData.series.totalItems;

    // Auto-complete cycle if all exercises done
    if (isLastExercise && updatedCycle?.status === "ACTIVE") {
      await completeCycle(activeCycle.id);
      await prisma.trainingSeries.update({
        where: { id: seriesId },
        data: { status: "COMPLETED" },
      });
    }

    // Find next exercise ID
    let nextExerciseId: string | null = null;
    if (!isLastExercise && exerciseCompleted) {
      const items = await prisma.trainingSeriesItem.findMany({
        where: { seriesId },
        orderBy: { orderIndex: "asc" },
        select: { trainingItemId: true, orderIndex: true },
      });
      const nextItem = items[seriesData.series.currentIndex] ?? null;
      nextExerciseId = nextItem?.trainingItemId ?? null;
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        trainingItemId: attempt.trainingItemId,
        seriesId: attempt.seriesId,
        cycleId: attempt.cycleId,
        movePlayed: attempt.movePlayed,
        expectedMove: attempt.expectedMove,
        isCorrect: attempt.isCorrect,
        timeMs: attempt.timeMs,
        attemptNumber: attempt.attemptNumber,
        fen: attempt.fen,
        createdAt: attempt.createdAt.toISOString(),
      },
      nextExerciseId,
      isLastExercise,
      progress: seriesData.progress,
      cycleStats: {
        solvedCount: updatedCycle?.solvedCount ?? 0,
        correctCount: updatedCycle?.correctCount ?? 0,
        incorrectCount: updatedCycle?.incorrectCount ?? 0,
        accuracy: updatedCycle?.accuracy ?? 0,
        averageTimeMs: updatedCycle?.averageTimeMs ?? 0,
        bestStreak: updatedCycle?.bestStreak ?? 0,
      },
    });
  } catch (err) {
    console.error("[training-series/attempt POST]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
