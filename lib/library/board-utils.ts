import { Chess } from "chess.js";

export const FALLBACK_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function canNavigateMoves(fenInitial: string): boolean {
  if (!fenInitial || !fenInitial.trim()) return false;
  try {
    new Chess(fenInitial.trim());
    return true;
  } catch {
    return false;
  }
}

export interface PositionResult {
  fen: string;
  lastMove: string | undefined;
}

export function computePosition(
  fenInitial: string,
  moves: string[],
  moveIdx: number
): PositionResult {
  const baseFen = fenInitial?.trim() || FALLBACK_FEN;
  if (moveIdx < 0) return { fen: baseFen, lastMove: undefined };

  try {
    const chess = new Chess(baseFen);
    let lastUci: string | undefined;
    for (let i = 0; i <= moveIdx; i++) {
      const result = chess.move(moves[i]);
      if (i === moveIdx && result) {
        lastUci = result.from + result.to + (result.promotion ?? "");
      }
    }
    return { fen: chess.fen(), lastMove: lastUci };
  } catch {
    return { fen: baseFen, lastMove: undefined };
  }
}

export function getBoardOrientation(fen: string): "white" | "black" {
  const parts = fen.split(" ");
  return parts[1] === "b" ? "black" : "white";
}
