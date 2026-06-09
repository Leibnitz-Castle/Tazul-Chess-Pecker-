import { Chess } from 'chess.js'

const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/

// Safe: returns null for any non-string, too-short, or non-UCI-formatted input
export function normalizeUciMove(uci: unknown): string | null {
  if (typeof uci !== 'string') return null
  const n = uci.toLowerCase().slice(0, 5).trimEnd()
  if (n.length < 4) return null
  return UCI_PATTERN.test(n) ? n : null
}

// Strict: throws a descriptive error — use where invalid input is a programmer bug
export function requireUciMove(uci: unknown, context: string): string {
  const n = normalizeUciMove(uci)
  if (!n) throw new Error(`[UCI] Invalid move in ${context}: ${JSON.stringify(uci)}`)
  return n
}

export function parseUciMove(uci: string): {
  from: string
  to: string
  promotion?: string
} {
  const n = requireUciMove(uci, 'parseUciMove')
  return {
    from: n.slice(0, 2),
    to: n.slice(2, 4),
    promotion: n.length === 5 ? n[4] : undefined,
  }
}

export function applyUciMove(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen)
    const { from, to, promotion } = parseUciMove(uci)
    const result = chess.move({ from, to, promotion })
    if (!result) return null
    return chess.fen()
  } catch {
    return null
  }
}
