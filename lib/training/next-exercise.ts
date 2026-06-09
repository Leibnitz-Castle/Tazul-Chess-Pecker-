/**
 * Logic for finding the next exercise in a Woodpecker series cycle.
 * Operates on plain data — no DB calls.
 */

export interface SeriesItem {
  id: string;
  trainingItemId: string;
  orderIndex: number;
}

export interface NextExerciseResult {
  /** null = series is complete */
  trainingItemId: string | null;
  orderIndex: number | null;
  /** 0-based index into the series items array */
  seriesItemIndex: number | null;
  isComplete: boolean;
  remaining: number;
}

/**
 * Find the next unsolved exercise in the cycle.
 * `solvedTrainingItemIds` = set of item IDs already marked solved in this cycle.
 * Items are iterated in orderIndex order (ascending).
 */
export function findNextExercise(
  items: SeriesItem[],
  solvedTrainingItemIds: Set<string>
): NextExerciseResult {
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  const pending = sorted.filter(
    (item) => !solvedTrainingItemIds.has(item.trainingItemId)
  );

  if (pending.length === 0) {
    return {
      trainingItemId: null,
      orderIndex: null,
      seriesItemIndex: null,
      isComplete: true,
      remaining: 0,
    };
  }

  const next = pending[0];
  const seriesItemIndex = sorted.findIndex((s) => s.id === next.id);

  return {
    trainingItemId: next.trainingItemId,
    orderIndex: next.orderIndex,
    seriesItemIndex,
    isComplete: false,
    remaining: pending.length,
  };
}

/**
 * Find the next exercise by currentIndex (simpler sequential path).
 * Returns null when index >= items.length (cycle complete).
 */
export function findNextByIndex(
  items: SeriesItem[],
  currentIndex: number
): { trainingItemId: string; orderIndex: number } | null {
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  if (currentIndex >= sorted.length) return null;
  const item = sorted[currentIndex];
  return { trainingItemId: item.trainingItemId, orderIndex: item.orderIndex };
}

/** How many exercises remain starting from currentIndex */
export function remainingCount(totalItems: number, currentIndex: number): number {
  return Math.max(0, totalItems - currentIndex);
}
