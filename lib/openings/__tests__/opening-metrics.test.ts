import { describe, it, expect } from "vitest";
import {
  determineMastery,
  isDueForReview,
  calculateLineMetrics,
  calculateRepertoireMetrics,
} from "../opening-metrics";

const NOW = new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// ── determineMastery ──────────────────────────────────────────────────────────

describe("determineMastery", () => {
  it("returns not_studied for 0 attempts", () => {
    expect(determineMastery(0, 0)).toBe("not_studied");
  });

  it("returns learning for < 3 attempts", () => {
    expect(determineMastery(1, 1)).toBe("learning");
    expect(determineMastery(2, 0.9)).toBe("learning");
  });

  it("returns mastered when accuracy >= 0.85 with >= 3 attempts", () => {
    expect(determineMastery(3, 0.85)).toBe("mastered");
    expect(determineMastery(5, 1.0)).toBe("mastered");
  });

  it("returns weak when accuracy < 0.60 with >= 3 attempts", () => {
    expect(determineMastery(3, 0.5)).toBe("weak");
    expect(determineMastery(10, 0.0)).toBe("weak");
  });

  it("returns learning for intermediate accuracy with >= 3 attempts", () => {
    expect(determineMastery(4, 0.7)).toBe("learning");
  });
});

// ── isDueForReview ────────────────────────────────────────────────────────────

describe("isDueForReview", () => {
  it("returns false for null date", () => {
    expect(isDueForReview(null)).toBe(false);
  });

  it("returns false if practiced recently (< 7 days)", () => {
    expect(isDueForReview(daysAgo(3))).toBe(false);
    expect(isDueForReview(daysAgo(6))).toBe(false);
  });

  it("returns true if not practiced for > 7 days", () => {
    expect(isDueForReview(daysAgo(8))).toBe(true);
    expect(isDueForReview(daysAgo(30))).toBe(true);
  });
});

// ── calculateLineMetrics ──────────────────────────────────────────────────────

describe("calculateLineMetrics", () => {
  it("returns zero metrics for empty attempts", () => {
    const m = calculateLineMetrics([]);
    expect(m.attempts).toBe(0);
    expect(m.accuracy).toBe(0);
    expect(m.mastery).toBe("not_studied");
    expect(m.isWeak).toBe(false);
    expect(m.isDueForReview).toBe(false);
    expect(m.lastPracticedAt).toBeNull();
  });

  it("calculates accuracy correctly", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000, createdAt: NOW },
      { isCorrect: true, timeMs: 1000, createdAt: NOW },
      { isCorrect: false, timeMs: 1000, createdAt: NOW },
    ];
    const m = calculateLineMetrics(attempts);
    expect(m.attempts).toBe(3);
    expect(m.correct).toBe(2);
    expect(m.incorrect).toBe(1);
    expect(m.accuracy).toBeCloseTo(2 / 3, 5);
  });

  it("marks line as weak when accuracy < 0.6 with >= 3 attempts", () => {
    const attempts = Array.from({ length: 5 }, (_, i) => ({
      isCorrect: i === 0, // 1 correct / 5 = 20%
      timeMs: 500,
      createdAt: NOW,
    }));
    const m = calculateLineMetrics(attempts);
    expect(m.isWeak).toBe(true);
    expect(m.mastery).toBe("weak");
  });

  it("does NOT mark line as weak with < 3 attempts even if accuracy is 0", () => {
    const attempts = [
      { isCorrect: false, timeMs: 500, createdAt: NOW },
      { isCorrect: false, timeMs: 500, createdAt: NOW },
    ];
    const m = calculateLineMetrics(attempts);
    expect(m.isWeak).toBe(false);
  });

  it("marks line as mastered when accuracy >= 0.85 with >= 3 attempts", () => {
    const attempts = Array.from({ length: 4 }, () => ({
      isCorrect: true,
      timeMs: 800,
      createdAt: NOW,
    }));
    const m = calculateLineMetrics(attempts);
    expect(m.mastery).toBe("mastered");
  });

  it("calculates correct avgTimeMs", () => {
    const attempts = [
      { isCorrect: true, timeMs: 1000, createdAt: NOW },
      { isCorrect: true, timeMs: 2000, createdAt: NOW },
    ];
    const m = calculateLineMetrics(attempts);
    expect(m.avgTimeMs).toBe(1500);
  });

  it("marks due for review when last practiced > 7 days ago", () => {
    const oldAttempt = { isCorrect: true, timeMs: 500, createdAt: daysAgo(10) };
    const m = calculateLineMetrics([oldAttempt]);
    expect(m.isDueForReview).toBe(true);
  });

  it("picks latest createdAt as lastPracticedAt", () => {
    const attempts = [
      { isCorrect: true, timeMs: 500, createdAt: daysAgo(5) },
      { isCorrect: false, timeMs: 500, createdAt: daysAgo(1) },
      { isCorrect: true, timeMs: 500, createdAt: daysAgo(10) },
    ];
    const m = calculateLineMetrics(attempts);
    expect(m.lastPracticedAt!.getTime()).toBeCloseTo(daysAgo(1).getTime(), -3);
  });
});

// ── calculateRepertoireMetrics ────────────────────────────────────────────────

describe("calculateRepertoireMetrics", () => {
  it("returns zero metrics for no line metrics", () => {
    const m = calculateRepertoireMetrics(10, 50, []);
    expect(m.memorization).toBe(0);
    expect(m.weakLines).toBe(0);
    expect(m.dueForReview).toBe(0);
    expect(m.totalLines).toBe(10);
    expect(m.totalNodes).toBe(50);
  });

  it("counts weak and due lines", () => {
    const lineMetrics = [
      calculateLineMetrics(
        Array.from({ length: 5 }, () => ({ isCorrect: false, timeMs: 500, createdAt: daysAgo(1) }))
      ),
      calculateLineMetrics(
        Array.from({ length: 4 }, () => ({ isCorrect: true, timeMs: 500, createdAt: daysAgo(10) }))
      ),
      calculateLineMetrics([]),
    ];
    const m = calculateRepertoireMetrics(3, 20, lineMetrics);
    expect(m.weakLines).toBe(1);
    expect(m.dueForReview).toBe(1);
  });
});
