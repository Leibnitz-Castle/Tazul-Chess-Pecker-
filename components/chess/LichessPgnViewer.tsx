'use client'

import { useEffect, useRef } from 'react'
import './lichess-pgn-viewer-wrapper.css'

export interface LichessPgnViewerProps {
  pgn: string
  fen?: string
  orientation?: 'white' | 'black'
  initialPly?: number | 'last'
  showMoves?: false | 'right' | 'bottom' | 'auto'
  showControls?: boolean
  className?: string
}

export function LichessPgnViewer({
  pgn,
  fen,
  orientation,
  initialPly,
  showMoves = 'right',
  showControls = true,
  className,
}: LichessPgnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let cancelled = false

    // Dynamic import avoids SSR crash — viewer requires DOM APIs (no SSR)
    import('@lichess-org/pgn-viewer').then(({ default: start }) => {
      if (cancelled || !el) return

      el.innerHTML = '' // clear any stale render from prop changes

      start(el, {
        pgn,
        ...(fen !== undefined ? { fen } : {}),
        ...(orientation !== undefined ? { orientation } : {}),
        ...(initialPly !== undefined ? { initialPly } : {}),
        showMoves,
        showControls,
        drawArrows: true,
        keyboardToMove: true,
        scrollToMove: true,
        lichess: false,
        menu: {
          getPgn: { enabled: false },
          practiceWithComputer: { enabled: false },
          analysisBoard: { enabled: false },
        },
      })
    }).catch((err) => {
      console.error('[LichessPgnViewer] failed to load @lichess-org/pgn-viewer:', err)
    })

    return () => {
      cancelled = true
      if (el) el.innerHTML = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgn, fen, orientation, initialPly, showMoves, showControls])

  return (
    <div
      ref={containerRef}
      className={['lpv-container', className].filter(Boolean).join(' ')}
    />
  )
}
