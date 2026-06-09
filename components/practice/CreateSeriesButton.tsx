'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Props {
  sourceName: string
  chapter?: string
  mode?: 'CHAPTER' | 'FULL_BOOK'
  label?: string
  variant?: 'amber' | 'outline'
  size?: 'lg' | 'sm'
}

export function CreateSeriesButton({
  sourceName,
  chapter,
  mode = 'CHAPTER',
  label = 'Start Series',
  variant = 'amber',
  size = 'sm',
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/training-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceName, chapter, mode }),
      })

      if (res.ok) {
        const series = await res.json()
        router.push(`/practice/series/${series.id}`)
      }
    } catch {
      // ignore — let user retry
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      icon={loading ? undefined : 'bolt'}
      loading={loading}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Creating…' : label}
    </Button>
  )
}
