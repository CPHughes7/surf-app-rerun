import { useEffect, useState } from 'react'
import { getSpotById } from '../data/surfSpots'
import { fetchSpotConditions } from '../services/noaa'
import { computeSurfability } from '../lib/surfability'
import type { SpotConditions, SurfabilityScore } from '../types/conditions'

export type BuoyDataState = {
  conditions: SpotConditions | null
  surfability: SurfabilityScore
  loading: boolean
  error: string | null
}

const EMPTY_SURFABILITY = computeSurfability(null)

export function useBuoyData(spotId: string | null): BuoyDataState {
  const [conditions, setConditions] = useState<SpotConditions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!spotId) {
      setConditions(null)
      setError(null)
      setLoading(false)
      return
    }

    const spot = getSpotById(spotId)
    if (!spot) {
      setConditions(null)
      setError('Unknown surf spot')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchSpotConditions(spot)
      .then((result) => {
        if (cancelled) return
        setConditions(result)
        if (!result) {
          setError('No nearshore wind or offshore wave data available')
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setConditions(null)
        setError(err instanceof Error ? err.message : 'Failed to load NOAA data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [spotId])

  const surfability = computeSurfability(conditions)

  return { conditions, surfability, loading, error }
}

export { EMPTY_SURFABILITY }
