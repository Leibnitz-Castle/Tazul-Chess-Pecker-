'use client'

import { useState } from 'react'
import { ChessgroundBoard } from './ChessgroundBoard'
import type { BoardMove } from '@/types/chess'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1'
// Sicilian Najdorf with last move Ng1-f3
const NAJDORF_FEN = 'rnbqkb1r/1p2pppp/p2p1n2/2pP4/4P3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 6'
// Position after 1.e4 e5 2.Nf3 Nc6 3.Bb5
const RUYLOPEZ_FEN = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'

function ShowcaseLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-3)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

function InteractiveDemo() {
  const [fen, setFen] = useState(STARTING_FEN)
  const [lastMove, setLastMove] = useState<string | null>(null)
  const [moveLog, setMoveLog] = useState<string[]>([])

  function handleMove(move: BoardMove) {
    setFen(move.fenAfter)
    setLastMove(move.uci)
    setMoveLog((prev) => [...prev.slice(-3), `${move.san ?? move.uci}`])
  }

  return (
    <div>
      <ShowcaseLabel>Interactive — play moves</ShowcaseLabel>
      <ChessgroundBoard fen={fen} onMove={handleMove} lastMove={lastMove} />
      {moveLog.length > 0 && (
        <div
          className="mono"
          style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, minHeight: 16 }}
        >
          {moveLog.join('  ')}
        </div>
      )}
    </div>
  )
}

export function ChessBoardShowcase() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
      {/* View-only */}
      <div>
        <ShowcaseLabel>View-only (starting position)</ShowcaseLabel>
        <ChessgroundBoard
          fen={STARTING_FEN}
          viewOnly
        />
      </div>

      {/* Interactive */}
      <InteractiveDemo />

      {/* Black orientation with last move */}
      <div>
        <ShowcaseLabel>Black orientation · last move e4→d5</ShowcaseLabel>
        <ChessgroundBoard
          fen={NAJDORF_FEN}
          orientation="black"
          viewOnly
          lastMove="d5e4"
        />
      </div>

      {/* Correct state */}
      <div>
        <ShowcaseLabel>State: correct</ShowcaseLabel>
        <ChessgroundBoard
          fen={RUYLOPEZ_FEN}
          viewOnly
          lastMove="f1b5"
          feedback="correct"
        />
      </div>

      {/* Wrong state */}
      <div>
        <ShowcaseLabel>State: wrong</ShowcaseLabel>
        <ChessgroundBoard
          fen={RUYLOPEZ_FEN}
          viewOnly
          feedback="wrong"
        />
      </div>

      {/* Disabled */}
      <div>
        <ShowcaseLabel>Disabled (no interaction)</ShowcaseLabel>
        <ChessgroundBoard
          fen={STARTING_FEN}
          disabled
        />
      </div>
    </div>
  )
}
