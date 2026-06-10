// Pure functions for the Opening Practice Engine.
// No React imports — these run in tests, server, and client contexts.

export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// ── Core types ────────────────────────────────────────────────────────────────

export interface PracticeNode {
  id: string;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  moveNumber: number;
  ply: number;
}

export type PracticeStatus =
  | "WAITING_USER_MOVE"
  | "AUTO_PLAYING"
  | "CORRECT"
  | "INCORRECT"
  | "LINE_COMPLETE";

// ── Side helpers ──────────────────────────────────────────────────────────────

/** Convert line.side ("white" | "black") to the canonical user side. */
export function getUserSide(lineSide: string): "white" | "black" {
  return lineSide === "black" ? "black" : "white";
}

/** Extract side-to-move from a FEN string. */
export function getSideToMoveFromFen(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

/**
 * Returns true if it's the user's turn to play at this node.
 * Uses fenBefore so it works regardless of ply parity.
 */
export function isUserTurn(
  node: PracticeNode,
  userSide: "white" | "black"
): boolean {
  const stm = getSideToMoveFromFen(node.fenBefore);
  return userSide === "white" ? stm === "w" : stm === "b";
}

// ── Position helpers ──────────────────────────────────────────────────────────

/**
 * Returns the FEN after `index` moves have been played.
 * index=0 → starting position; index=N → nodes[N-1].fenAfter.
 */
export function getFenAtIndex(
  nodes: PracticeNode[],
  index: number
): string {
  if (index <= 0 || nodes.length === 0) return STARTING_FEN;
  const node = nodes[index - 1];
  return node?.fenAfter ?? STARTING_FEN;
}

/** Returns the UCI of the move that led to position at `index`. */
export function getLastMoveUci(
  nodes: PracticeNode[],
  index: number
): string | undefined {
  if (index <= 0 || index > nodes.length) return undefined;
  return nodes[index - 1]?.uci;
}

// ── Auto-play helpers ─────────────────────────────────────────────────────────

/**
 * Collects consecutive opponent moves starting at `startIndex`.
 * Stops as soon as a node belongs to the user.
 */
export function getAutoMovesFromIndex(
  nodes: PracticeNode[],
  startIndex: number,
  userSide: "white" | "black"
): PracticeNode[] {
  const auto: PracticeNode[] = [];
  for (let i = startIndex; i < nodes.length; i++) {
    if (isUserTurn(nodes[i], userSide)) break;
    auto.push(nodes[i]);
  }
  return auto;
}

// ── Progress helpers ──────────────────────────────────────────────────────────

/** True when all nodes in the line have been played. */
export function isLineComplete(currentIndex: number, totalNodes: number): boolean {
  return currentIndex >= totalNodes;
}

/**
 * Counts how many nodes are the user's moves (not auto-played).
 * Used to show "X/Y moves" where Y is user-move count.
 */
export function countUserMoveNodes(
  nodes: PracticeNode[],
  userSide: "white" | "black"
): number {
  return nodes.filter((n) => isUserTurn(n, userSide)).length;
}

/**
 * Counts how many user moves have been completed up to (not including) currentIndex.
 */
export function countCompletedUserMoves(
  nodes: PracticeNode[],
  currentIndex: number,
  userSide: "white" | "black"
): number {
  return nodes
    .slice(0, currentIndex)
    .filter((n) => isUserTurn(n, userSide)).length;
}

// ── Metrics helpers ───────────────────────────────────────────────────────────

/** Returns accuracy as an integer 0-100. */
export function calculateAccuracyPercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/** Formats elapsed milliseconds as "Xs" or "Xm Ys". */
export function formatElapsedMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${totalSeconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

/**
 * Derives mastery status from attempt history.
 * Matches the thresholds defined in opening-metrics.ts / memory.
 */
export function getMasteryFromStats(
  attempts: number,
  accuracy: number
): "not_studied" | "learning" | "weak" | "mastered" {
  if (attempts === 0) return "not_studied";
  if (attempts < 3) return "learning";
  if (accuracy >= 0.85) return "mastered";
  if (accuracy < 0.6) return "weak";
  return "learning";
}
