import { Chess } from 'chess.js'
import { isValidFen, fenToOrientation } from './fen'
import { normalizeUciMove, applyUciMove } from './uci'

export { isValidFen, fenToOrientation, applyUciMove }

// Check if a move (from→to) is legal in the given position
export function validateMove(fen: string, from: string, to: string): boolean {
  try {
    const chess = new Chess(fen)
    const moves = chess.moves({ verbose: true })
    return moves.some((m) => m.from === from && m.to === to)
  } catch {
    return false
  }
}

// Apply a UCI move to a FEN — kept as alias for backward compat
export function applyMove(fen: string, uci: string): string | null {
  return applyUciMove(fen, uci)
}

// Returns false (never throws) when either UCI is null/undefined/invalid
export function isMoveCorrect(userUci: unknown, expectedUci: unknown): boolean {
  const u = normalizeUciMove(userUci)
  const e = normalizeUciMove(expectedUci)
  if (!u || !e) return false
  return u.slice(0, 4) === e.slice(0, 4) && (u[4] ?? '') === (e[4] ?? '')
}
