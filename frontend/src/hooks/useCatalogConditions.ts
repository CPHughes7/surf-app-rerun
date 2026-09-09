import { useEffect, useMemo, useState } from 'react'
import { SURF_SPOTS } from '../data/surfSpots'
import { resolveAllConditions } from '../lib/conditions/resolveConditions'
import { computeSurfability } from '../lib/surfability'
import type { SpotConditions, SurfabilityScore } from '../types/conditions'
import type { BuoyDataState } from './useBuoyData'
import { EMPTY_SURFABILITY } from './useBuoyData'

export type SpotBuoyEntry = {
  conditions: SpotConditions | null
  surfability: SurfabilityScore
}

export type CatalogConditionsState = {
  bySpotId: Record<string, SpotBuoyEntry>
  loading: boolean
  error: string | null
}

export function useCatalogConditions(): CatalogConditionsState {
  const [bySpotId, setBySpotId] = useState<Record<string, SpotBuoyEntry>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    resolveAllConditions(SURF_SPOTS)
      .then((conditionsBySpotId) => {
        if (cancelled) return
        const next: Record<string, SpotBuoyEntry> = {}
        for (const spot of SURF_SPOTS) {
          const conditions = conditionsBySpotId.get(spot.id) ?? null
          next[spot.id] = {
            conditions,
            surfability: computeSurfability(conditions),
          }
        }
        setBySpotId(next)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setBySpotId({})
        setError(err instanceof Error ? err.message : 'Failed to load NOAA data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(
    () => ({ bySpotId, loading, error }),
    [bySpotId, loading, error],
  )
}

export function buoyDataForSpot(
  catalog: CatalogConditionsState,
  spotId: string | null,
): BuoyDataState {
  if (!spotId) {
    return {
      conditions: null,
      surfability: EMPTY_SURFABILITY,
      loading: catalog.loading,
      error: catalog.error,
    }
  }

  const entry = catalog.bySpotId[spotId]
  if (!entry) {
    return {
      conditions: null,
      surfability: EMPTY_SURFABILITY,
      loading: catalog.loading,
      error: catalog.error ?? (catalog.loading ? null : 'Unknown surf spot'),
    }
  }

  return {
    conditions: entry.conditions,
    surfability: entry.surfability,
    loading: catalog.loading,
    error:
      catalog.error ??
      (entry.conditions ? null : 'No nearshore wind or offshore wave data available'),
  }
}
