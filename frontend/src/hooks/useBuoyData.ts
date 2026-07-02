import { useEffect, useState } from 'react'
import { fetchSpotConditions } from '../services/noaa'
import { computeSurfability } from '../lib/surfability'
import type { LocationPin } from '../types/location'
import { pinToSurfSpot } from '../types/location'
import type { SpotConditions, SurfabilityScore } from '../types/conditions'

export type BuoyDataState = {
  conditions: SpotConditions | null
  surfability: SurfabilityScore
  loading: boolean
  error: string | null
}

const EMPTY_SURFABILITY = computeSurfability(null)

export function useBuoyData(pin: LocationPin | null): BuoyDataState {
  const [conditions, setConditions] = useState<SpotConditions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pin) {
      setConditions(null)
      setError(null)
      setLoading(false)
      return
    }

    const spot = pinToSurfSpot(pin)
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchSpotConditions(spot)
      .then((result) => {
        if (cancelled) return
        setConditions(result)
        if (!result) {
          setError('No nearby NOAA readings within range')
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
  }, [pin?.id, pin?.lat, pin?.lng, pin?.windStationId, pin?.waveReferenceBuoyId])

  const surfability = computeSurfability(conditions)

  return { conditions, surfability, loading, error }
}

export { EMPTY_SURFABILITY }
