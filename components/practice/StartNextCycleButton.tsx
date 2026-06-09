'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Props {
  seriesId: string
  cycleNumber: number
}

export function StartNextCycleButton({ seriesId, cycleNumber }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/training-series/${seriesId}/start-next-cycle`, {
        method: 'POST',
      })
      if (res.ok) {
        router.push(`/practice/series/${seriesId}`)
      }
    } catch {
      // ignore — let user retry
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="amber" icon="bolt" size="lg" onClick={handleClick} disabled={loading}>
      {loading ? 'Starting…' : `Start Cycle ${cycleNumber}`}
    </Button>
  )
}
