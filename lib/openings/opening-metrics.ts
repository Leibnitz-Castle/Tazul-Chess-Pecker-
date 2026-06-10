import type {
  LineMetrics,
  NodeMetrics,
  RepertoireMetrics,
  MasteryStatus,
} from "./opening-types";

const WEAK_THRESHOLD = 0.6;
const MASTERED_THRESHOLD = 0.85;
const MIN_ATTEMPTS_FOR_STATUS = 3;
const DUE_DAYS = 7; // days without practice → due for review

interface AttemptRecord {
  isCorrect: boolean;
  timeMs: number;
  createdAt: Date;
}

export function determineMastery(
  attempts: number,
  accuracy: number
): MasteryStatus {
  if (attempts === 0) return "not_studied";
  if (attempts < MIN_ATTEMPTS_FOR_STATUS) return "learning";
  if (accuracy >= MASTERED_THRESHOLD) return "mastered";
  if (accuracy < WEAK_THRESHOLD) return "weak";
  return "learning";
}

export function isDueForReview(lastPracticedAt: Date | null): boolean {
  if (!lastPracticedAt) return false;
  const daysSince =
    (Date.now() - lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > DUE_DAYS;
}

export function calculateLineMetrics(attempts: AttemptRecord[]): LineMetrics {
  const n = attempts.length;
  if (n === 0) {
    return {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      avgTimeMs: 0,
      lastPracticedAt: null,
      mastery: "not_studied",
      isWeak: false,
      isDueForReview: false,
    };
  }

  const correct = attempts.filter((a) => a.isCorrect).length;
  const incorrect = n - correct;
  const accuracy = correct / n;
  const avgTimeMs = Math.round(
    attempts.reduce((s, a) => s + a.timeMs, 0) / n
  );
  const lastPracticedAt = attempts.reduce(
    (latest, a) => (a.createdAt > latest ? a.createdAt : latest),
    attempts[0].createdAt
  );

  const mastery = determineMastery(n, accuracy);
  const isWeak = n >= MIN_ATTEMPTS_FOR_STATUS && accuracy < WEAK_THRESHOLD;

  return {
    attempts: n,
    correct,
    incorrect,
    accuracy,
    avgTimeMs,
    lastPracticedAt,
    mastery,
    isWeak,
    isDueForReview: isDueForReview(lastPracticedAt),
  };
}

export function calculateNodeMetrics(attempts: AttemptRecord[]): NodeMetrics {
  const n = attempts.length;
  if (n === 0) {
    return {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      avgTimeMs: 0,
      isCritical: false,
      dueAt: null,
    };
  }

  const correct = attempts.filter((a) => a.isCorrect).length;
  const incorrect = n - correct;
  const accuracy = correct / n;
  const avgTimeMs = Math.round(
    attempts.reduce((s, a) => s + a.timeMs, 0) / n
  );

  const isCritical =
    n >= MIN_ATTEMPTS_FOR_STATUS && accuracy < WEAK_THRESHOLD;

  const lastPracticed = attempts.reduce(
    (latest, a) => (a.createdAt > latest ? a.createdAt : latest),
    attempts[0].createdAt
  );
  const dueAt = new Date(
    lastPracticed.getTime() + DUE_DAYS * 24 * 60 * 60 * 1000
  );

  return {
    attempts: n,
    correct,
    incorrect,
    accuracy,
    avgTimeMs,
    isCritical,
    dueAt,
  };
}

export function calculateRepertoireMetrics(
  totalLines: number,
  totalNodes: number,
  lineMetrics: LineMetrics[]
): RepertoireMetrics {
  if (lineMetrics.length === 0) {
    return { totalLines, totalNodes, memorization: 0, weakLines: 0, dueForReview: 0 };
  }

  const studiedLines = lineMetrics.filter((m) => m.attempts > 0);
  const memorization =
    studiedLines.length === 0
      ? 0
      : studiedLines.reduce((s, m) => s + m.accuracy, 0) / lineMetrics.length;

  const weakLines = lineMetrics.filter((m) => m.isWeak).length;
  const dueForReview = lineMetrics.filter((m) => m.isDueForReview).length;

  return {
    totalLines,
    totalNodes,
    memorization,
    weakLines,
    dueForReview,
  };
}
