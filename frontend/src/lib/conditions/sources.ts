import type { SurfSpot } from '../../data/surfSpots'
import {
  fetchNdbcLatestObs,
  spotConditionsFromObservations,
} from '../../services/noaa'
import type { SpotConditions } from '../../types/conditions'

/**
 * A source of ground-truth conditions for a batch of spots (e.g. a NOAA
 * bulletin fetch, eventually a camera feed). Batch-shaped because NOAA
 * already fetches one bulletin and scores every spot against it, rather
 * than fetching per spot.
 */
export type ConditionsSource = {
  id: string
  fetchConditions(spots: SurfSpot[]): Promise<Map<string, SpotConditions | null>>
}

export const NoaaSource: ConditionsSource = {
  id: 'noaa',
  async fetchConditions(spots) {
    const observations = await fetchNdbcLatestObs()
    const bySpotId = new Map<string, SpotConditions | null>()
    for (const spot of spots) {
      bySpotId.set(spot.id, spotConditionsFromObservations(spot, observations))
    }
    return bySpotId
  },
}
