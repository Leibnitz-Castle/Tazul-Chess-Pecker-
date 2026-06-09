'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChessgroundBoard } from '@/components/chess/ChessgroundBoard'
import type { BoardMove } from '@/types/chess'
import { MoveFeedbackPanel } from './MoveFeedbackPanel'
import type { PuzzlePhase } from './MoveFeedbackPanel'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Icon } from '@/components/ui/Icon'
import { fmtTime } from '@/lib/utils'
import { applyMove, fenToOrientation, isMoveCorrect } from '@/lib/chess/move-validation'
import type { TrainingItem } from '@/types/training'
import { SOLUTION_SHOWN_MOVE } from '@/lib/training/attempt-types'
import Link from 'next/link'

export interface AttemptData {
  trainingItemId: string
  movePlayed: string
  expectedMove: string
  isCorrect: boolean
  timeMs: number
  fen: string
  attemptNumber: number
}

export interface SeriesContext {
  seriesId: string
  seriesTitle: string
  cycleNumber: number
  cycleStats: {
    solvedCount: number
    correctCount: number
    incorrectCount: number
    accuracy: number
    averageTimeMs: number
    bestStreak: number
  }
}

interface PuzzlePlayerProps {
  item: TrainingItem
  totalInSet?: number
  doneInSet?: number
  onNext?: () => void
  onPrev?: () => void
  /** If provided, called instead of the default /api/attempts fetch */
  onAttempt?: (data: AttemptData) => Promise<void>
  /** If provided, shows series/cycle context panel */
  seriesContext?: SeriesContext
}

export function PuzzlePlayer({ item, totalInSet, doneInSet, onNext, onPrev, onAttempt, seriesContext }: PuzzlePlayerProps) {
  // ── Board state ──────────────────────────────────────────────
  // boardFen: position currently shown on the board
  // resetFen: position to revert to on a wrong move (advances after each opponent response)
  const [boardFen, setBoardFen] = useState(item.fen)
  const [resetFen, setResetFen] = useState(item.fen)
  const [lastMove, setLastMove] = useState<string | null>(null)

  // ── Puzzle state ─────────────────────────────────────────────
  // moveIndex: index into solution_moves of the NEXT expected move
  // Even indices (0,2,4…) = user's move — board is interactive
  // Odd indices (1,3,5…) = opponent's response — played automatically
  const [moveIndex, setMoveIndex] = useState(0)
  const [phase, setPhase] = useState<PuzzlePhase>('idle')
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // ── Timer ────────────────────────────────────────────────────
  const [seconds, setSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(true)

  // ── UI ───────────────────────────────────────────────────────
  const [flip, setFlip] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  // ── Cleanup refs ─────────────────────────────────────────────
  const revertRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const opponentRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  // ── Attempt submission ───────────────────────────────────────
  const submitAttempt = useCallback(async (data: AttemptData) => {
    if (onAttempt) {
      await onAttempt(data).catch(() => {})
    } else {
      await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          training_item_id: data.trainingItemId,
          is_correct: data.isCorrect,
          move_played: data.movePlayed,
          expected_move: data.expectedMove,
          time_ms: data.timeMs,
        }),
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAttempt])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Reset when item changes ──────────────────────────────────
  useEffect(() => {
    if (revertRef.current) clearTimeout(revertRef.current)
    if (opponentRef.current) clearTimeout(opponentRef.current)
    setBoardFen(item.fen)
    setResetFen(item.fen)
    setLastMove(null)
    setMoveIndex(0)
    setPhase('idle')
    setShake(false)
    setAttempts(0)
    setRevealed(false)
    setSeconds(0)
    setTimerActive(true)
    setInfoOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive || phase === 'solved') return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [timerActive, phase])

  // ── Derived values ───────────────────────────────────────────
  const baseOrientation = fenToOrientation(item.side_to_move)
  const orientation = flip
    ? baseOrientation === 'white' ? 'black' : 'white'
    : baseOrientation

  const totalMoves = item.solution_moves.length
  const totalUserMoves = Math.ceil(totalMoves / 2)
  const userMovesFound = Math.floor(moveIndex / 2)
  const moveProgress = totalUserMoves > 1
    ? { current: userMovesFound, total: totalUserMoves }
    : undefined

  const total = totalInSet ?? 0
  const done = doneInSet ?? 0

  // ── Move handler ─────────────────────────────────────────────
  const handleMove = useCallback(
    async (move: BoardMove) => {
      if (phase !== 'idle') return

      const expected = item.solution_moves[moveIndex]
      const correct = isMoveCorrect(move.uci, expected)

      if (correct) {
        const afterUserFen = move.fenAfter
        const nextIdx = moveIndex + 1
        const isLastMove = nextIdx >= item.solution_moves.length

        setBoardFen(afterUserFen)
        setLastMove(move.uci)

        if (isLastMove) {
          // ── Puzzle solved — hold in 'thinking' during API call to prevent race ──
          setTimerActive(false)
          setMoveIndex(nextIdx)
          setPhase('thinking')

          await submitAttempt({
            trainingItemId: item.id,
            isCorrect: true,
            movePlayed: move.uci,
            expectedMove: expected,
            timeMs: seconds * 1000,
            fen: move.fenAfter,
            attemptNumber: attempts + 1,
          })

          if (mountedRef.current) setPhase('solved')
        } else {
          // ── More moves to play — opponent responds ─────────────
          setPhase('thinking')

          opponentRef.current = setTimeout(async () => {
            if (!mountedRef.current) return

            const opponentUci = item.solution_moves[nextIdx]
            const opponentFen = opponentUci ? applyMove(afterUserFen, opponentUci) : null

            if (opponentFen) {
              const afterOpponentIdx = nextIdx + 1
              const isPuzzleDone = afterOpponentIdx >= item.solution_moves.length

              setBoardFen(opponentFen)
              setLastMove(opponentUci!)

              if (isPuzzleDone) {
                // Opponent played the last move — puzzle complete
                setTimerActive(false)
                setMoveIndex(afterOpponentIdx)

                await submitAttempt({
                  trainingItemId: item.id,
                  isCorrect: true,
                  movePlayed: move.uci,
                  expectedMove: expected,
                  timeMs: seconds * 1000,
                  fen: move.fenAfter,
                  attemptNumber: attempts + 1,
                })

                if (mountedRef.current) setPhase('solved')
              } else {
                setResetFen(opponentFen)
                setMoveIndex(afterOpponentIdx)
                setPhase('idle')
              }
            } else {
              // Opponent move couldn't be applied (bad data) — unblock user by marking solved
              setTimerActive(false)

              await submitAttempt({
                trainingItemId: item.id,
                isCorrect: true,
                movePlayed: move.uci,
                expectedMove: expected,
                timeMs: seconds * 1000,
                fen: move.fenAfter,
                attemptNumber: attempts + 1,
              })

              if (mountedRef.current) setPhase('solved')
            }
          }, 700)
        }
      } else {
        // ── Wrong move ────────────────────────────────────────────
        setAttempts((a) => a + 1)
        setLastMove(move.uci)
        setPhase('wrong')
        setShake(true)

        await submitAttempt({
          trainingItemId: item.id,
          isCorrect: false,
          movePlayed: move.uci,
          expectedMove: expected,
          timeMs: seconds * 1000,
          fen: boardFen,
          attemptNumber: attempts + 1,
        })

        revertRef.current = setTimeout(() => {
          if (!mountedRef.current) return
          setBoardFen(resetFen)  // revert to last checkpoint, not item.fen
          setLastMove(null)
          setPhase('idle')
          setShake(false)
        }, 720)
      }
    },
    [phase, moveIndex, item, seconds, boardFen, resetFen, attempts, submitAttempt]
  )

  // ── Show solution ─────────────────────────────────────────────
  const showSolution = useCallback(() => {
    if (revertRef.current) clearTimeout(revertRef.current)
    if (opponentRef.current) clearTimeout(opponentRef.current)

    // Compute all remaining FENs from the current board position
    const remaining: Array<{ uci: string; fen: string }> = []
    let currentFen = boardFen

    for (let i = moveIndex; i < item.solution_moves.length; i++) {
      const uci = item.solution_moves[i]
      const newFen = applyMove(currentFen, uci)
      if (!newFen) break
      remaining.push({ uci, fen: newFen })
      currentFen = newFen
    }

    if (remaining.length === 0) return

    // First expected move — used as context for the attempt record
    const expectedMove = item.solution_moves[moveIndex] ?? ''

    setTimerActive(false)
    setPhase('thinking')

    remaining.forEach(({ uci, fen }, idx) => {
      setTimeout(async () => {
        if (!mountedRef.current) return
        setBoardFen(fen)
        setLastMove(uci)
        if (idx === remaining.length - 1) {
          setMoveIndex(item.solution_moves.length)

          // Record the solution-shown attempt BEFORE showing the "Next puzzle" button.
          // This ensures pendingNextIdRef is populated before the user can click Next.
          await submitAttempt({
            trainingItemId: item.id,
            isCorrect: false,
            movePlayed: SOLUTION_SHOWN_MOVE,
            expectedMove,
            timeMs: seconds * 1000,
            fen,
            attemptNumber: attempts + 1,
          })

          if (mountedRef.current) {
            setPhase('solved')
            setRevealed(true)
          }
        }
      }, idx * 700)
    })
  }, [item, boardFen, moveIndex, seconds, attempts, submitAttempt])

  // ── Board interactivity ───────────────────────────────────────
  const boardViewOnly = phase !== 'idle'
  const boardFeedback =
    phase === 'solved' ? 'correct' : phase === 'wrong' ? 'wrong' : null

  return (
    <div className="page-wide animate-fade-in" style={{ padding: '28px', paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-[18px]">
        <Link
          href="/practice"
          className="flex items-center gap-2 text-text-secondary text-[13px] font-semibold hover:text-text-main transition-colors"
        >
          <Icon name="arrowLeft" size={15} /> Woodpecker Training
        </Link>
        <div className="flex items-center gap-3">
          {item.difficulty && (
            <Badge variant="amber">
              <Icon name="bolt" size={12} fill />
              {item.difficulty}
            </Badge>
          )}
          <span className="mono text-text-muted text-[12px]">#{item.exercise_number}</span>
        </div>
      </div>

      <div
        className="play-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.3fr) minmax(330px,1fr)',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* ── Board column ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <ChessgroundBoard
            fen={boardFen}
            orientation={orientation}
            onMove={boardViewOnly ? undefined : handleMove}
            lastMove={lastMove}
            viewOnly={boardViewOnly}
            feedback={boardFeedback}
            shake={shake}
          />

          {/* Board controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onPrev && (
                <Button size="sm" variant="outline" icon="prev" onClick={onPrev} aria-label="Previous" />
              )}
              {onNext && (
                <Button size="sm" variant="outline" icon="next" onClick={onNext} aria-label="Next" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" icon="flip" onClick={() => setFlip((f) => !f)}>
                Flip
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setTimerActive((t) => !t)}>
                <Icon name="clock" size={14} />
                <span className="mono tnum">{fmtTime(seconds)}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Panel column ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Series / set progress */}
          {(total > 0 || seriesContext) && (
            <Card>
              <div className="flex items-center justify-between mb-[14px]">
                <div>
                  <div className="eyebrow">
                    {seriesContext ? `Cycle ${seriesContext.cycleNumber}` : 'Woodpecker Set'}
                  </div>
                  <div className="text-[15px] font-bold tracking-[-0.02em] mt-1 leading-tight">
                    {seriesContext
                      ? seriesContext.seriesTitle
                      : `${item.source_name === 'The Woodpecker Method' ? 'WM1' : 'WM2'}${item.chapter ? ` — ${item.chapter}` : ''}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono tnum text-amber font-bold text-[18px]">
                    {done}<span className="text-text-muted">/{total}</span>
                  </div>
                  <div className="eyebrow mt-[2px]">solved</div>
                </div>
              </div>
              <Progress value={total > 0 ? done / total : 0} />
              {/* Cycle live stats */}
              {seriesContext && seriesContext.cycleStats.solvedCount > 0 && (
                <div className="flex items-center justify-between mt-[12px] pt-[12px]" style={{ borderTop: '1px solid var(--line-soft)' }}>
                  {[
                    { label: 'Accuracy', value: `${Math.round(seriesContext.cycleStats.accuracy * 100)}%` },
                    { label: 'Avg time', value: seriesContext.cycleStats.averageTimeMs > 0
                        ? (() => { const s = Math.round(seriesContext.cycleStats.averageTimeMs / 1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` })()
                        : '—' },
                    { label: 'Streak', value: `${seriesContext.cycleStats.bestStreak}` },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-text-muted" style={{ fontSize: 10.5, marginBottom: 2 }}>{stat.label}</div>
                      <div className="mono tnum font-bold" style={{ fontSize: 13, color: 'var(--text)' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Feedback panel */}
          <MoveFeedbackPanel
            phase={phase}
            sideToMove={item.side_to_move}
            attempts={attempts}
            revealed={revealed}
            timeSeconds={seconds}
            moveProgress={moveProgress}
            onShowSolution={phase === 'idle' ? showSolution : undefined}
            onNext={phase === 'solved' ? onNext : undefined}
          />

          {/* Puzzle info (collapsible) */}
          <Card pad={false}>
            <button
              className="flex items-center justify-between w-full p-5"
              onClick={() => setInfoOpen((o) => !o)}
            >
              <span className="text-text-secondary text-[13.5px] font-semibold">Puzzle info</span>
              <span
                className="text-text-muted transition-transform duration-200"
                style={{ transform: infoOpen ? 'rotate(180deg)' : 'none' }}
              >
                <Icon name="chevDown" size={16} />
              </span>
            </button>
            {infoOpen && (
              <div className="animate-fade-in px-5 pb-[18px]">
                <hr style={{ height: 1, background: 'var(--line-soft)', border: 'none', marginBottom: 14 }} />
                {[
                  ['Source', item.source_name],
                  ['Chapter', item.chapter ?? '—'],
                  ['Difficulty', item.difficulty ?? '—'],
                  ['Side to move', item.side_to_move === 'w' ? 'White' : 'Black'],
                  ['Exercise', `#${item.exercise_number ?? '?'}`],
                  ['Moves', `${totalUserMoves} move${totalUserMoves !== 1 ? 's' : ''}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                    <span className="text-text-muted text-[13px]">{k}</span>
                    <span className="text-[13.5px] font-semibold">{v}</span>
                  </div>
                ))}
                {item.solution_san && phase === 'solved' && (
                  <div>
                    <div className="text-text-muted text-[12px] mb-[6px]">Solution</div>
                    <div
                      className="mono text-[11px] p-[8px_10px] rounded-[8px] break-all"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-3)' }}
                    >
                      {item.solution_san}
                    </div>
                  </div>
                )}
                <div
                  className="mono text-[11px] mt-3 p-[8px_10px] rounded-[8px] break-all"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-3)' }}
                >
                  {item.fen}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
