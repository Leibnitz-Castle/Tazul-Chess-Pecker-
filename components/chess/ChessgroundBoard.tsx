'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import type { Config } from 'chessground/config'
import type { Key } from 'chessground/types'
import { Chess } from 'chess.js'
import type { BoardMove, BoardOrientation } from '@/types/chess'
import './chessground-theme.css'

export type { BoardMove }

interface ChessgroundBoardProps {
  fen: string
  orientation?: BoardOrientation
  viewOnly?: boolean
  disabled?: boolean
  check?: boolean
  lastMove?: string | null   // UCI string e.g. "e2e4" or "e7e8q"
  className?: string
  feedback?: 'correct' | 'wrong' | null
  shake?: boolean
  onMove?: (move: BoardMove) => void
}

function getMovableDests(fen: string): Map<Key, Key[]> {
  try {
    const chess = new Chess(fen)
    const dests = new Map<Key, Key[]>()
    for (const move of chess.moves({ verbose: true })) {
      const src = move.from as Key
      const existing = dests.get(src) ?? []
      existing.push(move.to as Key)
      dests.set(src, existing)
    }
    return dests
  } catch {
    return new Map()
  }
}

function getTurnColor(fen: string): 'white' | 'black' {
  return fen.split(' ')[1] === 'b' ? 'black' : 'white'
}

function parseLastMove(lastMove?: string | null): [Key, Key] | undefined {
  if (!lastMove || lastMove.length < 4) return undefined
  return [lastMove.slice(0, 2) as Key, lastMove.slice(2, 4) as Key]
}

export function ChessgroundBoard({
  fen,
  orientation = 'white',
  viewOnly = false,
  disabled = false,
  check: _check,
  lastMove,
  className,
  feedback,
  shake,
  onMove,
}: ChessgroundBoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cgRef = useRef<Api | null>(null)
  const readonly = viewOnly || disabled

  const handleMove = useCallback(
    (orig: Key, dest: Key) => {
      if (!onMove) return
      try {
        const chess = new Chess(fen)
        const fenBefore = fen
        const piece = chess.get(orig as Parameters<typeof chess.get>[0])
        let promotion: string | undefined
        if (
          piece?.type === 'p' &&
          ((dest[1] === '8' && piece.color === 'w') ||
            (dest[1] === '1' && piece.color === 'b'))
        ) {
          promotion = 'q'
        }
        const result = chess.move({ from: orig, to: dest, promotion })
        if (!result) return
        onMove({
          from: orig as string,
          to: dest as string,
          uci: `${orig}${dest}${promotion ?? ''}`,
          san: result.san,
          fenBefore,
          fenAfter: chess.fen(),
          legal: true,
          promotion,
        })
      } catch {
        // illegal move — chessground resets the piece automatically
      }
    },
    [fen, onMove]
  )

  // Mount chessground once
  useEffect(() => {
    if (!wrapRef.current) return

    const config: Config = {
      fen,
      orientation,
      viewOnly: readonly,
      lastMove: parseLastMove(lastMove),
      turnColor: getTurnColor(fen),
      movable: readonly
        ? { free: false, color: undefined }
        : {
            free: false,
            color: getTurnColor(fen),
            dests: getMovableDests(fen),
            events: { after: handleMove },
          },
      draggable: { enabled: !readonly },
      selectable: { enabled: !readonly },
      highlight: { lastMove: true, check: true },
      animation: { enabled: true, duration: 200 },
      coordinates: true,
    }

    cgRef.current = Chessground(wrapRef.current, config)

    return () => {
      cgRef.current?.destroy()
      cgRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync chessground when props change (no remount)
  useEffect(() => {
    const cg = cgRef.current
    if (!cg) return

    cg.set({
      fen,
      orientation,
      viewOnly: readonly,
      lastMove: parseLastMove(lastMove),
      turnColor: getTurnColor(fen),
      movable: readonly
        ? { free: false, color: undefined }
        : {
            free: false,
            color: getTurnColor(fen),
            dests: getMovableDests(fen),
            events: { after: handleMove },
          },
    })
  }, [fen, orientation, readonly, lastMove, handleMove])

  return (
    <div
      className={[
        'puzzle-board relative select-none touch-none',
        feedback === 'correct' ? 'animate-pulse-correct' : '',
        feedback === 'wrong' ? 'animate-glow-wrong' : '',
        shake ? 'animate-board-shake' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: '100%', maxWidth: 'calc(100dvh - 160px)' }}
    >
      <div ref={wrapRef} className="cg-wrap" />
    </div>
  )
}
