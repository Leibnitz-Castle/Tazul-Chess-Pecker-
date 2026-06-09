'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PuzzlePlayer, type AttemptData } from '@/components/practice/PuzzlePlayer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Icon } from '@/components/ui/Icon'
import { fmtMs, fmtAccuracy } from '@/lib/training/metrics'
import { SOLUTION_SHOWN_MOVE } from '@/lib/training/attempt-types'
import type { TrainingItem } from '@/types/training'
import Link from 'next/link'

interface CycleStats {
  solvedCount: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  averageTimeMs: number
  bestStreak: number
}

interface SeriesPracticeClientProps {
  seriesId: string
  seriesTitle: string
  cycleNumber: number
  initialExercise: TrainingItem
  initialProgress: { current: number; total: number; pct: number }
  initialCycleStats: CycleStats
}

export function SeriesPracticeClient({
  seriesId,
  seriesTitle,
  cycleNumber,
  initialExercise,
  initialProgress,
  initialCycleStats,
}: SeriesPracticeClientProps) {
  const router = useRouter()

  const [exercise, setExercise] = useState<TrainingItem>(initialExercise)
  const [progress, setProgress] = useState(initialProgress)
  const [cycleStats, setCycleStats] = useState<CycleStats>(initialCycleStats)
  const [isLoading, setIsLoading] = useState(false)

  // Stored after a correct attempt — consumed by onNext
  const pendingNextIdRef = useRef<string | null>(null)
  const pendingIsLastRef = useRef(false)

  const handleAttempt = useCallback(
    async (data: AttemptData) => {
      try {
        const res = await fetch(`/api/training-series/${seriesId}/attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainingItemId: data.trainingItemId,
            movePlayed: data.movePlayed,
            expectedMove: data.expectedMove,
            isCorrect: data.isCorrect,
            timeMs: data.timeMs,
            fen: data.fen,
            attemptNumber: data.attemptNumber,
          }),
        })

        if (!res.ok) {
          console.error('[SeriesPracticeClient] attempt API error:', res.status, res.statusText)
          return
        }

        const json = await res.json()

        // Advance to next exercise for correct answers OR solution-shown attempts
        const exerciseCompleted = data.isCorrect || data.movePlayed === SOLUTION_SHOWN_MOVE
        if (exerciseCompleted) {
          pendingNextIdRef.current = json.nextExerciseId ?? null
          pendingIsLastRef.current = json.isLastExercise ?? false
          setProgress(json.progress)
          setCycleStats(json.cycleStats)
        }
      } catch (err) {
        console.error('[SeriesPracticeClient] attempt API failed:', err)
      }
    },
    [seriesId]
  )

  const handleNext = useCallback(async () => {
    if (pendingIsLastRef.current) {
      router.push(`/practice/series/${seriesId}/summary`)
      return
    }

    const nextId = pendingNextIdRef.current
    if (!nextId) {
      // API result not available yet — full reload to re-sync state
      router.refresh()
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/training-items/${nextId}`)
      if (res.ok) {
        const item = await res.json()
        setExercise(item)
        pendingNextIdRef.current = null
        pendingIsLastRef.current = false
      } else {
        router.refresh()
      }
    } catch {
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }, [seriesId, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-text-secondary" style={{ fontSize: 14 }}>Loading next exercise…</div>
      </div>
    )
  }

  return (
    <PuzzlePlayer
      item={exercise}
      totalInSet={progress.total}
      doneInSet={progress.current}
      onAttempt={handleAttempt}
      onNext={handleNext}
      seriesContext={{
        seriesId,
        seriesTitle,
        cycleNumber,
        cycleStats,
      }}
    />
  )
}
