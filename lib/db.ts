import { PrismaClient } from "@prisma/client";
import type { TrainingFilters } from "@/types/training";
import {
  sortExercises,
  excludeIllustrative,
  seriesTitle,
} from "@/lib/training/series-order";
import {
  computeCycleMetrics,
  computeCurrentStreak,
  aggregateStats,
} from "@/lib/training/metrics";
import { findNextByIndex } from "@/lib/training/next-exercise";
import { SOLUTION_SHOWN_MOVE } from "@/lib/training/attempt-types";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const DEV_USER_ID = "dev-user-001";

// ── Training Items ──────────────────────────────────────────────────────────

export async function getTrainingItems(filters: TrainingFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.chapter) where.chapter = filters.chapter;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.side_to_move) where.sideToMove = filters.side_to_move;
  if (filters.source_name) where.sourceName = filters.source_name;

  where.solutionMoves = { isEmpty: false };

  const [items, total] = await Promise.all([
    prisma.trainingItem.findMany({
      where,
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
      orderBy: [{ chapter: "asc" }, { exerciseNumber: "asc" }],
      select: {
        id: true,
        fen: true,
        sideToMove: true,
        solutionMoves: true,
        solutionSan: true,
        sourceName: true,
        sourceAuthor: true,
        sourceYear: true,
        chapter: true,
        exerciseNumber: true,
        difficulty: true,
        theme: true,
        tags: true,
        itemType: true,
        createdAt: true,
      },
    }),
    prisma.trainingItem.count({ where }),
  ]);

  return { items: items.map(toApiShape), total };
}

export async function getTrainingItemById(id: string) {
  const item = await prisma.trainingItem.findUnique({ where: { id } });
  if (!item) return null;
  return toApiShape(item);
}

export async function getPracticeStats() {
  const [total, wm1, wm2] = await Promise.all([
    prisma.trainingItem.count({ where: { solutionMoves: { isEmpty: false } } }),
    prisma.trainingItem.count({
      where: {
        sourceName: "The Woodpecker Method",
        solutionMoves: { isEmpty: false },
      },
    }),
    prisma.trainingItem.count({
      where: {
        sourceName: "The Woodpecker Method 2",
        solutionMoves: { isEmpty: false },
      },
    }),
  ]);

  // Count distinct items solved in any series cycle for dev user
  const solvedItems = await prisma.exerciseAttempt.findMany({
    where: {
      isCorrect: true,
      cycle: { series: { devUserId: DEV_USER_ID } },
    },
    distinct: ["trainingItemId"],
    select: { trainingItemId: true },
  });

  return { total, wm1, wm2, completed: solvedItems.length };
}

// ── Legacy attempt log ──────────────────────────────────────────────────────

export async function createAttempt(data: {
  trainingItemId: string;
  isCorrect: boolean;
  movePlayed: string;
  expectedMove: string;
  timeMs: number;
}) {
  return prisma.puzzleAttempt.create({ data });
}

// ── Training Series ─────────────────────────────────────────────────────────

export async function createTrainingSeries(params: {
  sourceName: string;
  chapter?: string;
  mode?: string;
  includeIntroduction?: boolean;
  limit?: number;
}) {
  const { sourceName, chapter, mode = "CHAPTER", includeIntroduction = false, limit } = params;

  // Fetch matching TrainingItems
  const where: Record<string, unknown> = {
    sourceName,
    solutionMoves: { isEmpty: false },
  };
  if (chapter) where.chapter = chapter;

  const rawItems = await prisma.trainingItem.findMany({
    where,
    select: {
      id: true,
      sourceName: true,
      chapter: true,
      exerciseNumber: true,
    },
  });

  // Sort and filter
  let items = sortExercises(rawItems);
  items = excludeIllustrative(items, includeIntroduction);
  if (limit) items = items.slice(0, limit);

  if (items.length === 0) {
    throw new Error("No playable exercises found for the given filters");
  }

  const title = seriesTitle(sourceName, chapter ?? null);

  // Create series + items + first cycle in one transaction
  const series = await prisma.$transaction(async (tx) => {
    const s = await tx.trainingSeries.create({
      data: {
        devUserId: DEV_USER_ID,
        title,
        sourceName,
        chapter: chapter ?? null,
        mode,
        totalItems: items.length,
        currentIndex: 0,
      },
    });

    await tx.trainingSeriesItem.createMany({
      data: items.map((item, idx) => ({
        seriesId: s.id,
        trainingItemId: item.id,
        orderIndex: idx,
      })),
    });

    await tx.trainingCycle.create({
      data: {
        seriesId: s.id,
        cycleNumber: 1,
        status: "ACTIVE",
        totalExercises: items.length,
      },
    });

    return s;
  });

  return series;
}

export async function getTrainingSeries(status?: string) {
  const where: Record<string, unknown> = { devUserId: DEV_USER_ID };
  if (status) where.status = status;

  return prisma.trainingSeries.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      cycles: {
        orderBy: { cycleNumber: "desc" },
        take: 1,
      },
      _count: { select: { items: true } },
    },
  });
}

export async function getSeriesById(id: string) {
  const series = await prisma.trainingSeries.findUnique({
    where: { id },
    include: {
      cycles: { orderBy: { cycleNumber: "asc" } },
      items: {
        orderBy: { orderIndex: "asc" },
        include: {
          trainingItem: {
            select: {
              id: true,
              fen: true,
              sideToMove: true,
              solutionMoves: true,
              solutionSan: true,
              sourceName: true,
              sourceAuthor: true,
              sourceYear: true,
              chapter: true,
              exerciseNumber: true,
              difficulty: true,
              theme: true,
              tags: true,
              itemType: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!series) return null;

  const activeCycle =
    series.cycles.find((c) => c.status === "ACTIVE") ??
    series.cycles[series.cycles.length - 1] ??
    null;

  // Count solved in active cycle
  let solvedInCycle = 0;
  let solvedItemIds = new Set<string>();
  if (activeCycle) {
    const solved = await prisma.exerciseAttempt.findMany({
      where: { cycleId: activeCycle.id, isCorrect: true },
      distinct: ["trainingItemId"],
      select: { trainingItemId: true },
    });
    solvedInCycle = solved.length;
    solvedItemIds = new Set(solved.map((s) => s.trainingItemId));
  }

  // Current exercise by currentIndex
  const currentSeriesItem = series.items[series.currentIndex] ?? null;
  const currentExercise = currentSeriesItem
    ? toApiShape(currentSeriesItem.trainingItem)
    : null;

  return {
    series,
    activeCycle,
    currentExercise,
    solvedInCycle,
    solvedItemIds,
    progress: {
      current: series.currentIndex,
      total: series.totalItems,
      pct: series.totalItems > 0 ? series.currentIndex / series.totalItems : 0,
    },
  };
}

export async function recordExerciseAttempt(params: {
  trainingItemId: string;
  seriesId: string;
  cycleId: string;
  movePlayed: string;
  expectedMove: string;
  isCorrect: boolean;
  timeMs: number;
  attemptNumber: number;
  fen: string;
}) {
  const attempt = await prisma.exerciseAttempt.create({ data: params });

  // Advance series progress on first correct attempt OR first solution-shown attempt
  const isSolutionShown = params.movePlayed === SOLUTION_SHOWN_MOVE;
  if (params.isCorrect || isSolutionShown) {
    // Check if this item was already completed in this cycle (correct or solution shown)
    const prevCompleted = await prisma.exerciseAttempt.count({
      where: {
        cycleId: params.cycleId,
        trainingItemId: params.trainingItemId,
        id: { not: attempt.id },
        OR: [{ isCorrect: true }, { movePlayed: SOLUTION_SHOWN_MOVE }],
      },
    });

    if (prevCompleted === 0) {
      // First completion — advance series index and update cycle stats
      const series = await prisma.trainingSeries.findUnique({
        where: { id: params.seriesId },
        select: { currentIndex: true, totalItems: true },
      });

      if (series) {
        await prisma.trainingSeries.update({
          where: { id: params.seriesId },
          data: { currentIndex: series.currentIndex + 1 },
        });
      }

      // Recompute cycle stats from scratch
      await recomputeCycleStats(params.cycleId);
    }
  }

  return attempt;
}

async function recomputeCycleStats(cycleId: string) {
  const cycle = await prisma.trainingCycle.findUnique({
    where: { id: cycleId },
    select: { totalExercises: true },
  });
  if (!cycle) return;

  const allAttempts = await prisma.exerciseAttempt.findMany({
    where: { cycleId },
    orderBy: { createdAt: "asc" },
    select: { trainingItemId: true, isCorrect: true, timeMs: true, movePlayed: true },
  });

  const firstAttemptByItem: Record<string, { isCorrect: boolean; timeMs: number }> = {};
  const firstCorrectByItem: Record<string, { timeMs: number }> = {};
  // Time at which solution was first shown (solution-shown items that were never solved correctly)
  const solutionShownTimeByItem: Record<string, number> = {};

  for (const a of allAttempts) {
    if (!(a.trainingItemId in firstAttemptByItem)) {
      firstAttemptByItem[a.trainingItemId] = { isCorrect: a.isCorrect, timeMs: a.timeMs };
    }
    if (a.isCorrect && !(a.trainingItemId in firstCorrectByItem)) {
      firstCorrectByItem[a.trainingItemId] = { timeMs: a.timeMs };
    }
    if (a.movePlayed === SOLUTION_SHOWN_MOVE && !(a.trainingItemId in solutionShownTimeByItem)) {
      solutionShownTimeByItem[a.trainingItemId] = a.timeMs;
    }
  }

  // "Solved" = answered correctly at some point, OR solution was shown (and not later solved)
  // Using plain object to avoid Set iteration (downlevelIteration restriction)
  const solvedItemsMap: Record<string, true> = {};
  for (const id of Object.keys(firstCorrectByItem)) {
    solvedItemsMap[id] = true;
  }
  for (const id of Object.keys(solutionShownTimeByItem)) {
    if (!(id in firstCorrectByItem)) solvedItemsMap[id] = true;
  }
  const solvedItemIds = Object.keys(solvedItemsMap);
  const solvedCount = solvedItemIds.length;

  // correctOnFirst: items where the very first attempt in this cycle was correct
  let correctOnFirst = 0;
  for (const itemId of solvedItemIds) {
    if (firstAttemptByItem[itemId]?.isCorrect) correctOnFirst++;
  }

  // Build attempt records preserving actual isCorrect for streak computation
  const solvedAttempts = solvedItemIds.map((id) => {
    const isSolutionShownItem =
      id in solutionShownTimeByItem && !(id in firstCorrectByItem);
    if (isSolutionShownItem) {
      return { isCorrect: false, timeMs: solutionShownTimeByItem[id] };
    }
    return {
      isCorrect: firstAttemptByItem[id]?.isCorrect ?? false,
      timeMs: firstCorrectByItem[id]?.timeMs ?? 0,
    };
  });

  const metrics = computeCycleMetrics(solvedAttempts, cycle.totalExercises);
  const accuracy = solvedCount > 0 ? correctOnFirst / solvedCount : 0;

  await prisma.trainingCycle.update({
    where: { id: cycleId },
    data: {
      solvedCount,
      correctCount: correctOnFirst,
      incorrectCount: solvedCount - correctOnFirst,
      totalTimeMs: metrics.totalTimeMs,
      averageTimeMs: metrics.averageTimeMs,
      accuracy,
      bestStreak: metrics.bestStreak,
    },
  });
}

export async function getActiveCycle(seriesId: string) {
  return prisma.trainingCycle.findFirst({
    where: { seriesId, status: "ACTIVE" },
    orderBy: { cycleNumber: "desc" },
  });
}

export async function completeCycle(cycleId: string) {
  return prisma.trainingCycle.update({
    where: { id: cycleId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

export async function startNextCycle(seriesId: string) {
  const series = await prisma.trainingSeries.findUnique({
    where: { id: seriesId },
    include: {
      cycles: { orderBy: { cycleNumber: "desc" }, take: 1 },
      _count: { select: { items: true } },
    },
  });

  if (!series) throw new Error("Series not found");

  const lastCycle = series.cycles[0];
  const nextCycleNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1;

  const [newCycle] = await prisma.$transaction([
    prisma.trainingCycle.create({
      data: {
        seriesId,
        cycleNumber: nextCycleNumber,
        status: "ACTIVE",
        totalExercises: series._count.items,
      },
    }),
    prisma.trainingSeries.update({
      where: { id: seriesId },
      data: { currentIndex: 0, status: "ACTIVE" },
    }),
  ]);

  return newCycle;
}

export async function getNextExerciseInSeries(seriesId: string) {
  const series = await prisma.trainingSeries.findUnique({
    where: { id: seriesId },
    select: { currentIndex: true, totalItems: true },
  });
  if (!series) return null;

  const items = await prisma.trainingSeriesItem.findMany({
    where: { seriesId },
    orderBy: { orderIndex: "asc" },
    select: { trainingItemId: true, orderIndex: true },
  });

  const result = findNextByIndex(
    items.map((i) => ({ id: i.trainingItemId, trainingItemId: i.trainingItemId, orderIndex: i.orderIndex })),
    series.currentIndex
  );

  if (!result) return null;
  return getTrainingItemById(result.trainingItemId);
}

// ── Woodpecker stats for profile ───────────────────────────────────────────

export async function getWoodpeckerStats() {
  // All completed cycles for this dev user
  const cycles = await prisma.trainingCycle.findMany({
    where: {
      series: { devUserId: DEV_USER_ID },
      status: "COMPLETED",
    },
    include: {
      series: { select: { title: true, sourceName: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const stats = aggregateStats(cycles);

  // WM1 progress: distinct items solved / total WM1 playable
  const [wm1Total, wm2Total, wm1Solved, wm2Solved] = await Promise.all([
    prisma.trainingItem.count({
      where: { sourceName: "The Woodpecker Method", solutionMoves: { isEmpty: false } },
    }),
    prisma.trainingItem.count({
      where: { sourceName: "The Woodpecker Method 2", solutionMoves: { isEmpty: false } },
    }),
    prisma.exerciseAttempt.findMany({
      where: {
        isCorrect: true,
        trainingItem: { sourceName: "The Woodpecker Method" },
        cycle: { series: { devUserId: DEV_USER_ID } },
      },
      distinct: ["trainingItemId"],
      select: { trainingItemId: true },
    }),
    prisma.exerciseAttempt.findMany({
      where: {
        isCorrect: true,
        trainingItem: { sourceName: "The Woodpecker Method 2" },
        cycle: { series: { devUserId: DEV_USER_ID } },
      },
      distinct: ["trainingItemId"],
      select: { trainingItemId: true },
    }),
  ]);

  const recentCycles = await prisma.trainingCycle.findMany({
    where: { series: { devUserId: DEV_USER_ID } },
    include: { series: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const activeSeries = await prisma.trainingSeries.findMany({
    where: { devUserId: DEV_USER_ID, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return {
    ...stats,
    wm1Progress: wm1Total > 0 ? wm1Solved.length / wm1Total : 0,
    wm2Progress: wm2Total > 0 ? wm2Solved.length / wm2Total : 0,
    activeSeries,
    recentCycles: recentCycles.map((c) => ({
      ...c,
      seriesTitle: c.series.title,
    })),
  };
}

// ── Shape conversion ────────────────────────────────────────────────────────

function toApiShape(item: {
  id: string;
  fen: string;
  sideToMove: string;
  solutionMoves: string[];
  solutionSan: string | null;
  sourceName: string;
  sourceAuthor: string;
  sourceYear: number;
  chapter: string | null;
  exerciseNumber: number | null;
  difficulty: string | null;
  theme: string | null;
  tags: string[];
  itemType: string;
  createdAt: Date;
}) {
  return {
    id: item.id,
    fen: item.fen,
    side_to_move: item.sideToMove as "w" | "b",
    solution_moves: item.solutionMoves,
    solution_san: item.solutionSan,
    source_name: item.sourceName,
    source_author: item.sourceAuthor,
    source_year: item.sourceYear,
    chapter: item.chapter,
    exercise_number: item.exerciseNumber,
    difficulty: item.difficulty as "easy" | "intermediate" | "advanced" | null,
    theme: item.theme,
    tags: item.tags,
    item_type: item.itemType as "calculation",
    created_at: item.createdAt.toISOString(),
  };
}
