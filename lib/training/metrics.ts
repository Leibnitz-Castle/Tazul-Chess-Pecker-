/**
 * Pure functions for computing Woodpecker training metrics.
 * All functions take plain data — no DB calls, no side effects.
 */

export interface AttemptRecord {
  isCorrect: boolean;
  timeMs: number;
}

export interface CycleMetrics {
  totalExercises: number;
  solvedCount: number;
  correctCount: number;
  incorrectCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  accuracy: number;       // 0–1
  bestStreak: number;
  completionPct: number;  // 0–1
}

/** Compute full cycle metrics from a flat list of first-attempt results per exercise. */
export function computeCycleMetrics(
  attempts: AttemptRecord[],
  totalExercises: number
): CycleMetrics {
  if (attempts.length === 0) {
    return {
      totalExercises,
      solvedCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      totalTimeMs: 0,
      averageTimeMs: 0,
      accuracy: 0,
      bestStreak: 0,
      completionPct: 0,
    };
  }

  const solvedCount = attempts.length;
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const incorrectCount = solvedCount - correctCount;
  const totalTimeMs = attempts.reduce((s, a) => s + a.timeMs, 0);
  const averageTimeMs = Math.round(totalTimeMs / solvedCount);
  const accuracy = solvedCount > 0 ? correctCount / solvedCount : 0;
  const completionPct = totalExercises > 0 ? solvedCount / totalExercises : 0;

  let bestStreak = 0;
  let currentStreak = 0;
  for (const a of attempts) {
    if (a.isCorrect) {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return {
    totalExercises,
    solvedCount,
    correctCount,
    incorrectCount,
    totalTimeMs,
    averageTimeMs,
    accuracy,
    bestStreak,
    completionPct,
  };
}

/** Current streak at the end of the attempt list */
export function computeCurrentStreak(attempts: AttemptRecord[]): number {
  let streak = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].isCorrect) streak++;
    else break;
  }
  return streak;
}

export interface CycleComparison {
  cycleNumber: number;
  accuracy: number;
  averageTimeMs: number;
  solvedCount: number;
  bestStreak: number;
  accuracyDelta: number | null;   // vs previous cycle
  timeDelta: number | null;       // vs previous cycle (negative = faster = better)
}

/** Build comparison rows from cycle metrics history (oldest first). */
export function buildCycleComparisons(
  cycles: Array<{
    cycleNumber: number;
    accuracy: number;
    averageTimeMs: number;
    solvedCount: number;
    bestStreak: number;
  }>
): CycleComparison[] {
  return cycles.map((c, i) => ({
    cycleNumber: c.cycleNumber,
    accuracy: c.accuracy,
    averageTimeMs: c.averageTimeMs,
    solvedCount: c.solvedCount,
    bestStreak: c.bestStreak,
    accuracyDelta: i === 0 ? null : c.accuracy - cycles[i - 1].accuracy,
    timeDelta:
      i === 0 ? null : c.averageTimeMs - cycles[i - 1].averageTimeMs,
  }));
}

/** Format milliseconds as "1:24" or "0:05" */
export function fmtMs(ms: number): string {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/** Format accuracy as "86%" */
export function fmtAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/** Aggregate stats across multiple cycles for profile display */
export interface AggregateStats {
  totalSolved: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;
  averageTimeMs: number;
  bestStreak: number;
}

export function aggregateStats(
  cycles: Array<{
    solvedCount: number;
    correctCount: number;
    incorrectCount: number;
    totalTimeMs: number;
    bestStreak: number;
  }>
): AggregateStats {
  if (cycles.length === 0) {
    return {
      totalSolved: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      accuracy: 0,
      averageTimeMs: 0,
      bestStreak: 0,
    };
  }

  const totalSolved = cycles.reduce((s, c) => s + c.solvedCount, 0);
  const totalCorrect = cycles.reduce((s, c) => s + c.correctCount, 0);
  const totalIncorrect = cycles.reduce((s, c) => s + c.incorrectCount, 0);
  const totalTimeMs = cycles.reduce((s, c) => s + c.totalTimeMs, 0);
  const bestStreak = Math.max(...cycles.map((c) => c.bestStreak));

  return {
    totalSolved,
    totalCorrect,
    totalIncorrect,
    accuracy: totalSolved > 0 ? totalCorrect / totalSolved : 0,
    averageTimeMs: totalSolved > 0 ? Math.round(totalTimeMs / totalSolved) : 0,
    bestStreak,
  };
}
