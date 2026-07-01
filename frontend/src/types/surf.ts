export type Verdict = 'go' | 'maybe' | 'skip'

export type Chop = 'clean' | 'moderate' | 'choppy'

export type SpotConditions = {
  waveHeight: number
  wavePeriod: number
  windSpeed: number
  windDirection: string
  chop: Chop
}

export type Recommendation = {
  verdict: Verdict
  reason: string
}

export type Spot = {
  id: string
  name: string
  lat: number
  lng: number
  plainLanguageSummary: string
  conditions: SpotConditions
  recommendation: Recommendation
}
