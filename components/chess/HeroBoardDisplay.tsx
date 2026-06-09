'use client'

import { ChessgroundBoard } from './ChessgroundBoard'

// Ruy López position after 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 — a recognizable GM-level position
const HERO_FEN = 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4'

export function HeroBoardDisplay() {
  return (
    <ChessgroundBoard
      fen={HERO_FEN}
      orientation="white"
      viewOnly
      lastMove="f1b5"
    />
  )
}
