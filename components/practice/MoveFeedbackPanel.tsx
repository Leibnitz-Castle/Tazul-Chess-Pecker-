'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { fmtTime } from '@/lib/utils'

export type PuzzlePhase = 'idle' | 'thinking' | 'solved' | 'wrong'

interface MoveFeedbackPanelProps {
  phase: PuzzlePhase
  sideToMove: 'w' | 'b'
  attempts: number
  revealed: boolean
  timeSeconds: number
  /** Multi-move progress: current = user moves found so far, total = total user moves */
  moveProgress?: { current: number; total: number }
  onShowSolution?: () => void
  onNext?: () => void
}

export function MoveFeedbackPanel({
  phase,
  sideToMove,
  attempts,
  revealed,
  timeSeconds,
  moveProgress,
  onShowSolution,
  onNext,
}: MoveFeedbackPanelProps) {
  const isMultiMove = moveProgress && moveProgress.total > 1
  const borderColor =
    phase === 'solved'
      ? 'rgba(78,138,98,.35)'
      : phase === 'wrong'
      ? 'rgba(164,77,69,.35)'
      : phase === 'thinking'
      ? 'rgba(200,169,107,.25)'
      : undefined

  return (
    <Card style={{ borderColor }}>
      {/* ── Idle: waiting for user move ── */}
      {phase === 'idle' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-[6px]">
            <span
              className="w-3 h-3 rounded-[3px] border"
              style={{
                background: sideToMove === 'w' ? '#f8f5ee' : '#26201a',
                borderColor: 'var(--line)',
              }}
            />
            <span className="text-[17px] font-bold tracking-[-0.02em]">
              {isMultiMove && moveProgress.current > 0
                ? 'Keep going — find the next move'
                : `Your turn as ${sideToMove === 'w' ? 'White' : 'Black'}`}
            </span>
          </div>

          {isMultiMove && (
            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: moveProgress.total }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: 28,
                    background:
                      i < moveProgress.current
                        ? 'var(--green)'
                        : i === moveProgress.current
                        ? 'var(--amber)'
                        : 'var(--line)',
                  }}
                />
              ))}
              <span className="text-text-muted text-[12px] mono ml-1">
                {moveProgress.current}/{moveProgress.total}
              </span>
            </div>
          )}

          <p className="text-text-secondary text-[14px]">Find the best move.</p>

          {attempts > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="red">
                <Icon name="x" size={11} /> {attempts} wrong
              </Badge>
              {attempts >= 2 && onShowSolution && (
                <Button size="sm" variant="ghost" onClick={onShowSolution}>
                  Show solution
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Thinking: app is playing opponent's response ── */}
      {phase === 'thinking' && (
        <div className="animate-fade-in flex items-center gap-3">
          <span
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--amber-ghost)', color: 'var(--amber)' }}
          >
            <Icon name="bolt" size={18} fill />
          </span>
          <div>
            <div
              className="text-[17px] font-bold tracking-[-0.02em]"
              style={{ color: 'var(--amber)' }}
            >
              Good move!
            </div>
            <div className="text-text-muted text-[12.5px]">
              Playing the response…
            </div>
          </div>
        </div>
      )}

      {/* ── Solved: all moves played correctly ── */}
      {phase === 'solved' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-[10px]">
            <span
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--green-ghost)', color: 'var(--green)' }}
            >
              <Icon name="check" size={20} strokeWidth={2.6} />
            </span>
            <div>
              <div
                className="text-[17px] font-bold tracking-[-0.02em]"
                style={{ color: 'var(--green)' }}
              >
                {revealed ? 'Solution shown' : 'Correct!'}
              </div>
              <div className="text-text-muted text-[12.5px]">
                {revealed
                  ? 'Try the next one without help.'
                  : `Solved in ${fmtTime(timeSeconds)} · ${attempts === 0 ? 'first try' : `${attempts + 1} tries`}`}
              </div>
            </div>
          </div>
          {onNext && (
            <Button variant="green" block iconRight="arrowRight" onClick={onNext}>
              Next puzzle
            </Button>
          )}
        </div>
      )}

      {/* ── Wrong: incorrect move ── */}
      {phase === 'wrong' && (
        <div className="animate-fade-in flex items-center gap-3">
          <span
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--red-ghost)', color: 'var(--red)' }}
          >
            <Icon name="x" size={20} strokeWidth={2.6} />
          </span>
          <div>
            <div
              className="text-[17px] font-bold tracking-[-0.02em]"
              style={{ color: 'var(--red)' }}
            >
              Incorrect
            </div>
            <div className="text-text-muted text-[12.5px]">
              That&apos;s not the best move — try again.
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
