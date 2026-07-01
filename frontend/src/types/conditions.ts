import type { StationKind } from '../data/stationCatalog'

export type DataQuality = 'high' | 'medium' | 'low'

export type ObservationSource = {
  stationId: string
  stationName: string
  stationKind: StationKind
  distanceKm: number
  observedAt: string | null
  isStale: boolean
}

export type WindObservation = ObservationSource & {
  speedKt: number | null
  dirDeg: number | null
  gustKt: number | null
}

export type WaveObservation = ObservationSource & {
  heightFt: number | null
  dominantPeriodS: number | null
  avgPeriodS: number | null
  meanDirDeg: number | null
  gustKt: number | null
  presInHg: number | null
  airTempF: number | null
  waterTempF: number | null
}

export type SpotConditions = {
  spotId: string
  wind: WindObservation | null
  wave: WaveObservation | null
  quality: DataQuality
  inferenceNote: string
}

export type SurfabilityFlag =
  | 'good'
  | 'marginal'
  | 'tooSmall'
  | 'tooWindy'
  | 'staleData'
  | 'missingData'
  | 'windOnly'

export type SurfabilityScore = {
  overall: SurfabilityFlag
  flags: SurfabilityFlag[]
  summary: string
  confidence: DataQuality
}
