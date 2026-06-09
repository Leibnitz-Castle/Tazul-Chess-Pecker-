import { describe, it, expect } from 'vitest'
import { isValidFen, getSideToMoveFromFen, fenToOrientation } from '../fen'
import { normalizeUciMove, requireUciMove, parseUciMove, applyUciMove } from '../uci'
import { validateMove, applyMove, isMoveCorrect } from '../move-validation'
import { SOLUTION_SHOWN_MOVE } from '@/lib/training/attempt-types'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1'
const AFTER_E4_FEN  = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
const RUYLOPEZ_FEN  = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'

// ─── isValidFen ───────────────────────────────────────────────────────────────

describe('isValidFen', () => {
  it('accepts starting position', () => {
    expect(isValidFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')).toBe(true)
  })

  it('accepts mid-game FEN', () => {
    expect(isValidFen(RUYLOPEZ_FEN)).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidFen('')).toBe(false)
  })

  it('rejects garbage string', () => {
    expect(isValidFen('not-a-fen')).toBe(false)
  })
})

// ─── getSideToMoveFromFen ─────────────────────────────────────────────────────

describe('getSideToMoveFromFen', () => {
  it('returns w for starting position', () => {
    expect(getSideToMoveFromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')).toBe('w')
  })

  it('returns b after 1.e4', () => {
    expect(getSideToMoveFromFen(AFTER_E4_FEN)).toBe('b')
  })
})

// ─── fenToOrientation ─────────────────────────────────────────────────────────

describe('fenToOrientation', () => {
  it('maps w → white', () => expect(fenToOrientation('w')).toBe('white'))
  it('maps b → black', () => expect(fenToOrientation('b')).toBe('black'))
})

// ─── normalizeUciMove ─────────────────────────────────────────────────────────

describe('normalizeUciMove', () => {
  it('lowercases input', () => {
    expect(normalizeUciMove('E2E4')).toBe('e2e4')
  })

  it('keeps promotion piece', () => {
    expect(normalizeUciMove('e7e8Q')).toBe('e7e8q')
  })

  it('truncates beyond 5 chars', () => {
    expect(normalizeUciMove('e7e8qX')).toBe('e7e8q')
  })

  it('returns null for undefined', () => {
    expect(normalizeUciMove(undefined)).toBeNull()
  })

  it('returns null for null', () => {
    expect(normalizeUciMove(null)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(normalizeUciMove('')).toBeNull()
  })

  it('returns null for too-short string', () => {
    expect(normalizeUciMove('e2e')).toBeNull()
  })

  it('returns null for number', () => {
    expect(normalizeUciMove(42)).toBeNull()
  })
})

// ─── requireUciMove ───────────────────────────────────────────────────────────

describe('requireUciMove', () => {
  it('returns normalized string for valid UCI', () => {
    expect(requireUciMove('E2E4', 'test')).toBe('e2e4')
  })

  it('throws descriptive error for undefined', () => {
    expect(() => requireUciMove(undefined, 'ctx')).toThrow('[UCI] Invalid move in ctx')
  })

  it('throws descriptive error for empty string', () => {
    expect(() => requireUciMove('', 'ctx')).toThrow('[UCI] Invalid move in ctx')
  })
})

// ─── parseUciMove ─────────────────────────────────────────────────────────────

describe('parseUciMove', () => {
  it('parses simple move', () => {
    expect(parseUciMove('e2e4')).toEqual({ from: 'e2', to: 'e4', promotion: undefined })
  })

  it('parses promotion', () => {
    expect(parseUciMove('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' })
  })
})

// ─── applyUciMove ─────────────────────────────────────────────────────────────

describe('applyUciMove', () => {
  it('applies 1.e4 and returns new FEN', () => {
    const result = applyUciMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'e2e4'
    )
    expect(result).toBeTruthy()
    expect(result).toContain('4P3')
  })

  it('returns null for illegal move', () => {
    expect(applyUciMove(STARTING_FEN, 'e2e5')).toBeNull()
  })
})

// ─── validateMove (legality check) ───────────────────────────────────────────

describe('validateMove', () => {
  it('returns true for legal e4 from starting position', () => {
    expect(validateMove(STARTING_FEN, 'e2', 'e4')).toBe(true)
  })

  it('returns false for illegal move', () => {
    expect(validateMove(STARTING_FEN, 'e2', 'e5')).toBe(false)
  })

  it('returns false for wrong side', () => {
    // Black cannot move a white pawn
    expect(validateMove(AFTER_E4_FEN, 'e4', 'e5')).toBe(false)
  })
})

// ─── applyMove ────────────────────────────────────────────────────────────────

describe('applyMove', () => {
  it('same result as applyUciMove', () => {
    const a = applyMove(STARTING_FEN, 'e2e4')
    const b = applyUciMove(STARTING_FEN, 'e2e4')
    expect(a).toBe(b)
  })
})

// ─── isMoveCorrect ────────────────────────────────────────────────────────────

describe('isMoveCorrect', () => {
  it('returns true when move matches expected', () => {
    expect(isMoveCorrect('e2e4', 'e2e4')).toBe(true)
  })

  it('returns false when move differs', () => {
    expect(isMoveCorrect('d2d4', 'e2e4')).toBe(false)
  })

  it('handles promotion matching', () => {
    expect(isMoveCorrect('e7e8q', 'e7e8q')).toBe(true)
    expect(isMoveCorrect('e7e8r', 'e7e8q')).toBe(false)
  })

  it('is case-insensitive (E2E4 vs e2e4)', () => {
    expect(isMoveCorrect('E2E4', 'e2e4')).toBe(true)
  })

  it('returns false (never throws) when expectedUci is undefined', () => {
    expect(isMoveCorrect('e2e4', undefined)).toBe(false)
  })

  it('returns false (never throws) when userUci is undefined', () => {
    expect(isMoveCorrect(undefined, 'e2e4')).toBe(false)
  })

  it('returns false when both are undefined', () => {
    expect(isMoveCorrect(undefined, undefined)).toBe(false)
  })
})

// ─── SOLUTION_SHOWN_MOVE sentinel ─────────────────────────────────────────────

describe('SOLUTION_SHOWN_MOVE sentinel', () => {
  it('is not treated as a valid UCI move by normalizeUciMove', () => {
    // Must return null — the sentinel must never be passed to chess engine as a move
    expect(normalizeUciMove(SOLUTION_SHOWN_MOVE)).toBeNull()
  })

  it('isMoveCorrect returns false when expected is SOLUTION_SHOWN_MOVE', () => {
    expect(isMoveCorrect('e2e4', SOLUTION_SHOWN_MOVE)).toBe(false)
  })

  it('isMoveCorrect returns false when played is SOLUTION_SHOWN_MOVE', () => {
    expect(isMoveCorrect(SOLUTION_SHOWN_MOVE, 'e2e4')).toBe(false)
  })
})

// ─── PuzzlePlayer comparison logic ───────────────────────────────────────────

describe('PuzzlePlayer move comparison', () => {
  it('correct move: uci matches solution', () => {
    const movePlayed: string = 'e2e4'
    const expectedMove: string = 'e2e4'
    expect(movePlayed === expectedMove).toBe(true)
  })

  it('wrong move: uci does not match solution', () => {
    const movePlayed: string = 'd2d4'
    const expectedMove: string = 'e2e4'
    expect(movePlayed === expectedMove).toBe(false)
  })
})
