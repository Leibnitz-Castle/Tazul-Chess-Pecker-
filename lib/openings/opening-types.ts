// Types for the Opening Repertoire module

export type OpeningColor = "WHITE" | "BLACK";
export type OpeningSourceType = "PGN" | "CHESSBASE_EXPORT" | "MANUAL";
export type OpeningAttemptType = "PRACTICE" | "QUIZ" | "REVIEW";
export type MasteryStatus = "not_studied" | "learning" | "mastered" | "weak" | "due_for_review";

// ── PGN parsing ──────────────────────────────────────────────────────────────

export interface PgnHeaders {
  Event?: string;
  White?: string;
  Black?: string;
  ECO?: string;
  Result?: string;
  PlyCount?: string;
  [key: string]: string | undefined;
}

export interface ParsedMove {
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  moveNumber: number;
  ply: number; // 1-based half-moves from start
}

export interface PgnVariationNode {
  move: ParsedMove;
  children: PgnVariationNode[];
}

export interface ParsedPgnGame {
  headers: PgnHeaders;
  lineName: string;
  eco: string | null;
  side: "white" | "black";
  mainLine: ParsedMove[];
  // All unique paths (main + variations flattened into lines)
  allLines: ParsedMove[][];
}

// ── Import result ────────────────────────────────────────────────────────────

export interface ImportedNode {
  id: string;
  parentId: string | null;
  path: string;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  moveNumber: number;
  ply: number;
  depth: number;
  eco: string | null;
  lineName: string | null;
  isMainLine: boolean;
  orderIndex: number;
}

export interface ImportedLine {
  id: string;
  name: string;
  eco: string | null;
  pgn: string;
  startFen: string;
  finalFen: string;
  moveCount: number;
  isMainLine: boolean;
  orderIndex: number;
  nodeIds: string[];
}

export interface ImportReport {
  repertoireId: string;
  repertoireName: string;
  color: OpeningColor;
  totalGamesInPgn: number;
  linesCreated: number;
  linesSkipped: number;
  nodesCreated: number;
  nodesReused: number;
  parseErrors: ParseError[];
  ecoDistribution: Record<string, number>;
  createdAt: string;
}

export interface ParseError {
  gameIndex: number;
  lineName: string;
  message: string;
}

// ── Metrics ──────────────────────────────────────────────────────────────────

export interface LineMetrics {
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number; // 0-1
  avgTimeMs: number;
  lastPracticedAt: Date | null;
  mastery: MasteryStatus;
  isWeak: boolean;
  isDueForReview: boolean;
}

export interface NodeMetrics {
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTimeMs: number;
  isCritical: boolean;
  dueAt: Date | null;
}

export interface RepertoireMetrics {
  totalLines: number;
  totalNodes: number;
  memorization: number; // 0-1 average mastery
  weakLines: number;
  dueForReview: number;
}
