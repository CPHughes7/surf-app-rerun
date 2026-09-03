import type { SurfSpot } from '../../data/surfSpots'
import type { SpotConditions } from '../../types/conditions'
import { NoaaSource, type ConditionsSource } from './sources'

const DEFAULT_SOURCES: ConditionsSource[] = [NoaaSource]

/**
 * Resolves conditions for every spot by combining one or more sources.
 * Today NOAA is the only source; the policy is first-non-null per spot,
 * so a future source (e.g. a camera feed) can be added to the list
 * without changing this signature or its callers.
 */
export async function resolveAllConditions(
  spots: SurfSpot[],
  sources: ConditionsSource[] = DEFAULT_SOURCES,
): Promise<Map<string, SpotConditions | null>> {
  const merged = new Map<string, SpotConditions | null>()
  for (const spot of spots) merged.set(spot.id, null)

  for (const source of sources) {
    const fromSource = await source.fetchConditions(spots)
    for (const spot of spots) {
      if (merged.get(spot.id) == null) {
        merged.set(spot.id, fromSource.get(spot.id) ?? null)
      }
    }
  }

  return merged
}
