import { describe, it, expect } from "vitest";
import {
  computeCycleMetrics,
  computeCurrentStreak,
  buildCycleComparisons,
  aggregateStats,
  fmtMs,
  fmtAccuracy,
} from "../metrics";

describe("computeCycleMetrics", () => {
  it("returns zeroed metrics for empty attempts", () => {
    const m = computeCycleMetrics([], 10);
    expect(m.solvedCount).toBe(0);
    expect(m.accuracy).toBe(0);
    expect(m.bestStreak).toBe(0);
    expect(m.completionPct).toBe(0);
  });

  it("computes accuracy correctly", () => {
    const attempts = [
      { isCorrect: true, timeMs: 5000 },
      { isCorrect: false, timeMs: 3000 },
      { isCorrect: true, timeMs: 4000 },
      { isCorrect: true, timeMs: 6000 },
    ];
    const m = computeCycleMetrics(attempts, 10);
    expect(m.correctCount).toBe(3);
    expect(m.incorrectCount).toBe(1);
    expect(m.accuracy).toBeCloseTo(0.75);
  });

  it("computes best streak correctly", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: false, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
    ];
    const m = computeCycleMetrics(attempts, 10);
    expect(m.bestStreak).toBe(3);
  });

  it("computes average time correctly", () => {
    const attempts = [
      { isCorrect: true, timeMs: 2000 },
      { isCorrect: true, timeMs: 4000 },
    ];
    const m = computeCycleMetrics(attempts, 5);
    expect(m.averageTimeMs).toBe(3000);
    expect(m.totalTimeMs).toBe(6000);
  });

  it("computes completion percentage", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
    ];
    const m = computeCycleMetrics(attempts, 4);
    expect(m.completionPct).toBe(0.5);
  });

  it("handles all correct streak", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
    ];
    const m = computeCycleMetrics(attempts, 5);
    expect(m.bestStreak).toBe(3);
    expect(m.accuracy).toBe(1);
  });
});

describe("computeCurrentStreak", () => {
  it("returns 0 for empty list", () => {
    expect(computeCurrentStreak([])).toBe(0);
  });

  it("returns streak from end of list", () => {
    const attempts = [
      { isCorrect: false, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
    ];
    expect(computeCurrentStreak(attempts)).toBe(3);
  });

  it("resets on first incorrect at end", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: false, timeMs: 1000 },
    ];
    expect(computeCurrentStreak(attempts)).toBe(0);
  });
});

describe("buildCycleComparisons", () => {
  it("first cycle has null deltas", () => {
    const cycles = [
      { cycleNumber: 1, accuracy: 0.7, averageTimeMs: 10000, solvedCount: 50, bestStreak: 5 },
    ];
    const result = buildCycleComparisons(cycles);
    expect(result[0].accuracyDelta).toBeNull();
    expect(result[0].timeDelta).toBeNull();
  });

  it("computes accuracy improvement between cycles", () => {
    const cycles = [
      { cycleNumber: 1, accuracy: 0.6, averageTimeMs: 12000, solvedCount: 50, bestStreak: 5 },
      { cycleNumber: 2, accuracy: 0.8, averageTimeMs: 10000, solvedCount: 50, bestStreak: 7 },
    ];
    const result = buildCycleComparisons(cycles);
    expect(result[1].accuracyDelta).toBeCloseTo(0.2);
    expect(result[1].timeDelta).toBe(-2000); // faster = negative = better
  });
});

describe("aggregateStats", () => {
  it("returns zeros for empty cycles", () => {
    const s = aggregateStats([]);
    expect(s.totalSolved).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.bestStreak).toBe(0);
  });

  it("aggregates correctly across cycles", () => {
    const cycles = [
      { solvedCount: 30, correctCount: 24, incorrectCount: 6, totalTimeMs: 60000, bestStreak: 8 },
      { solvedCount: 20, correctCount: 18, incorrectCount: 2, totalTimeMs: 30000, bestStreak: 12 },
    ];
    const s = aggregateStats(cycles);
    expect(s.totalSolved).toBe(50);
    expect(s.totalCorrect).toBe(42);
    expect(s.bestStreak).toBe(12);
    expect(s.averageTimeMs).toBe(1800);
  });
});

describe("computeCycleMetrics — solution shown (isCorrect: false)", () => {
  it("solution shown entry counts as solved but incorrect", () => {
    // When a user reveals the solution, the attempt is recorded as isCorrect:false
    const attempts = [
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: false, timeMs: 2000 }, // solution shown
    ]
    const m = computeCycleMetrics(attempts, 5)
    expect(m.solvedCount).toBe(2)
    expect(m.correctCount).toBe(1)
    expect(m.incorrectCount).toBe(1)
    expect(m.accuracy).toBeCloseTo(0.5)
  })

  it("solution shown breaks the current streak", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: true, timeMs: 1000 },
      { isCorrect: false, timeMs: 3000 }, // solution shown — streak reset
      { isCorrect: true, timeMs: 1000 },
    ]
    const m = computeCycleMetrics(attempts, 5)
    expect(m.bestStreak).toBe(2)
  })

  it("solution shown does not increase correctCount", () => {
    const attempts = [{ isCorrect: false, timeMs: 3000 }]
    const m = computeCycleMetrics(attempts, 5)
    expect(m.correctCount).toBe(0)
    expect(m.solvedCount).toBe(1)
  })

  it("all solution shown gives 0 accuracy", () => {
    const attempts = [
      { isCorrect: false, timeMs: 2000 },
      { isCorrect: false, timeMs: 3000 },
    ]
    const m = computeCycleMetrics(attempts, 5)
    expect(m.accuracy).toBe(0)
    expect(m.bestStreak).toBe(0)
  })
})

describe("formatters", () => {
  it("fmtMs formats 0 as 0:00", () => {
    expect(fmtMs(0)).toBe("0:00");
  });

  it("fmtMs formats 90000ms as 1:30", () => {
    expect(fmtMs(90000)).toBe("1:30");
  });

  it("fmtMs formats 5000ms as 0:05", () => {
    expect(fmtMs(5000)).toBe("0:05");
  });

  it("fmtAccuracy formats 0.75 as 75%", () => {
    expect(fmtAccuracy(0.75)).toBe("75%");
  });

  it("fmtAccuracy rounds correctly", () => {
    expect(fmtAccuracy(0.866)).toBe("87%");
  });
});
