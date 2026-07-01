import { SURF_SPOTS } from './surfSpots'
import type { Spot, Verdict } from '../types/surf'

export type { Spot, Verdict } from '../types/surf'

const verdicts: Verdict[] = ['go', 'maybe', 'skip']

const reasons: Record<Verdict, string> = {
  go: 'Small but clean — worth checking.',
  maybe: 'Marginal wind and period — session dependent.',
  skip: 'Too windy or flat for most riders.',
}

const summaries: Record<Verdict, string> = {
  go: 'Clean 2–3 ft with light offshore wind.',
  maybe: 'Rideable but choppy; check in person.',
  skip: 'Blown out or flat — save the paddle.',
}

export const spots: Spot[] = SURF_SPOTS.map((spot, index) => {
  const verdict = verdicts[index % verdicts.length]
  return {
    id: spot.id,
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    plainLanguageSummary: summaries[verdict],
    conditions: {
      waveHeight: 2 + (index % 3),
      wavePeriod: 6 + (index % 4),
      windSpeed: 10 + (index % 5),
      windDirection: 'NW',
      chop: index % 2 === 0 ? 'clean' : 'moderate',
    },
    recommendation: {
      verdict,
      reason: reasons[verdict],
    },
  }
})
