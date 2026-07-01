import {
  MAX_WAVE_REFERENCE_KM,
  NEARSHORE_STATIONS,
  WAVE_CAPABLE_OFFSHORE_BUOYS,
  getStationById,
  type Station,
} from '../data/stationCatalog'
import { haversineDistanceKm } from '../lib/geo/haversine'
import type {
  DataQuality,
  SpotConditions,
  WaveObservation,
  WindObservation,
} from '../types/conditions'
import type { SurfSpot } from '../data/surfSpots'

const NDBC_LATEST_URL =
  import.meta.env?.VITE_NDBC_URL ?? '/api/ndbc/latest_obs.txt'
const MS_PER_HOUR = 3_600_000
const STALE_HOURS = 2

const MS_TO_KT = 1.94384
const M_TO_FT = 3.28084
const HPA_TO_INHG = 0.02953
const C_TO_F = (c: number) => (c * 9) / 5 + 32

export type RawNdbcObservation = {
  stationId: string
  lat: number
  lng: number
  observedAt: Date | null
  windDirDeg: number | null
  windSpeedKt: number | null
  gustKt: number | null
  waveHeightFt: number | null
  dominantPeriodS: number | null
  avgPeriodS: number | null
  waveDirDeg: number | null
  presHpa: number | null
  airTempF: number | null
  waterTempF: number | null
}

function parseNumeric(value: string): number | null {
  if (!value || value === 'MM') return null
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : null
}

/** Parse a single line from NDBC latest_obs.txt */
export function parseNdbcLine(line: string): RawNdbcObservation | null {
  if (line.startsWith('#') || !line.trim()) return null

  const parts = line.trim().split(/\s+/)
  if (parts.length < 12) return null

  const [stationId, latStr, lngStr, year, month, day, hour, minute] = parts
  const windDirDeg = parseNumeric(parts[8])
  const windSpeedMs = parseNumeric(parts[9])
  const gustMs = parseNumeric(parts[10])
  const waveHeightM = parseNumeric(parts[11])
  const dominantPeriodS = parseNumeric(parts[12])
  const avgPeriodS = parseNumeric(parts[13])
  const waveDirDeg = parseNumeric(parts[14])
  const presHpa = parseNumeric(parts[15])
  const airTempC = parseNumeric(parts[17])
  const waterTempC = parseNumeric(parts[18])

  let observedAt: Date | null = null
  const y = Number.parseInt(year, 10)
  const mo = Number.parseInt(month, 10)
  const d = Number.parseInt(day, 10)
  const h = Number.parseInt(hour, 10)
  const mi = Number.parseInt(minute, 10)
  if ([y, mo, d, h, mi].every(Number.isFinite)) {
    observedAt = new Date(Date.UTC(y, mo - 1, d, h, mi))
  }

  return {
    stationId,
    lat: Number.parseFloat(latStr),
    lng: Number.parseFloat(lngStr),
    observedAt,
    windDirDeg,
    windSpeedKt: windSpeedMs !== null ? windSpeedMs * MS_TO_KT : null,
    gustKt: gustMs !== null ? gustMs * MS_TO_KT : null,
    waveHeightFt: waveHeightM !== null ? waveHeightM * M_TO_FT : null,
    dominantPeriodS,
    avgPeriodS,
    waveDirDeg,
    presHpa,
    airTempF: airTempC !== null ? C_TO_F(airTempC) : null,
    waterTempF: waterTempC !== null ? C_TO_F(waterTempC) : null,
  }
}

export function parseNdbcLatestObs(text: string): Map<string, RawNdbcObservation> {
  const map = new Map<string, RawNdbcObservation>()
  for (const line of text.split('\n')) {
    const obs = parseNdbcLine(line)
    if (obs) map.set(obs.stationId, obs)
  }
  return map
}

function isObservationStale(observedAt: Date | null): boolean {
  if (!observedAt) return true
  return Date.now() - observedAt.getTime() > STALE_HOURS * MS_PER_HOUR
}

function windQuality(distanceKm: number, isStale: boolean): DataQuality {
  if (isStale) return 'low'
  if (distanceKm < 5) return 'high'
  if (distanceKm < 15) return 'medium'
  return 'low'
}

function waveQuality(distanceKm: number, isStale: boolean): DataQuality {
  if (isStale) return 'low'
  if (distanceKm < 10) return 'medium'
  return 'low'
}

function overallQuality(windQ: DataQuality | null, waveQ: DataQuality | null): DataQuality {
  const ranks: DataQuality[] = ['high', 'medium', 'low']
  const values = [windQ, waveQ].filter((q): q is DataQuality => q !== null)
  if (values.length === 0) return 'low'
  return values.reduce((worst, q) => (ranks.indexOf(q) > ranks.indexOf(worst) ? q : worst))
}

function hasWindData(obs: RawNdbcObservation): boolean {
  return obs.windSpeedKt !== null || obs.windDirDeg !== null
}

function hasWaveData(obs: RawNdbcObservation): boolean {
  return obs.waveHeightFt !== null
}

function resolveWind(
  spot: SurfSpot,
  observations: Map<string, RawNdbcObservation>,
): WindObservation | null {
  const primary = getStationById(spot.windStationId)
  if (primary) {
    const primaryObs = observations.get(primary.id)
    if (primaryObs && hasWindData(primaryObs)) {
      const distanceKm = haversineDistanceKm(spot.lat, spot.lng, primary.lat, primary.lng)
      const isStale = isObservationStale(primaryObs.observedAt)
      return {
        stationId: primary.id,
        stationName: primary.name,
        stationKind: primary.kind,
        distanceKm,
        observedAt: primaryObs.observedAt?.toISOString() ?? null,
        isStale,
        speedKt: primaryObs.windSpeedKt,
        dirDeg: primaryObs.windDirDeg,
        gustKt: primaryObs.gustKt,
      }
    }
  }

  const candidates: Station[] = [...NEARSHORE_STATIONS]
  if (primary && !candidates.some((c) => c.id === primary.id)) {
    candidates.unshift(primary)
  }

  let best: { station: Station; obs: RawNdbcObservation; distanceKm: number } | null = null

  for (const station of candidates) {
    const obs = observations.get(station.id)
    if (!obs || !hasWindData(obs)) continue
    const distanceKm = haversineDistanceKm(spot.lat, spot.lng, station.lat, station.lng)
    if (!best || distanceKm < best.distanceKm) {
      best = { station, obs, distanceKm }
    }
  }

  if (!best) return null

  const { station, obs, distanceKm } = best
  const isStale = isObservationStale(obs.observedAt)

  return {
    stationId: station.id,
    stationName: station.name,
    stationKind: station.kind,
    distanceKm,
    observedAt: obs.observedAt?.toISOString() ?? null,
    isStale,
    speedKt: obs.windSpeedKt,
    dirDeg: obs.windDirDeg,
    gustKt: obs.gustKt,
  }
}

function resolveWave(
  spot: SurfSpot,
  observations: Map<string, RawNdbcObservation>,
): WaveObservation | null {
  const primary = getStationById(spot.waveReferenceBuoyId)
  if (
    primary &&
    WAVE_CAPABLE_OFFSHORE_BUOYS.some((b) => b.id === primary.id)
  ) {
    const primaryObs = observations.get(primary.id)
    if (primaryObs && hasWaveData(primaryObs)) {
      const distanceKm = haversineDistanceKm(spot.lat, spot.lng, primary.lat, primary.lng)
      if (distanceKm <= MAX_WAVE_REFERENCE_KM) {
        const isStale = isObservationStale(primaryObs.observedAt)
        return {
          stationId: primary.id,
          stationName: primary.name,
          stationKind: primary.kind,
          distanceKm,
          observedAt: primaryObs.observedAt?.toISOString() ?? null,
          isStale,
          heightFt: primaryObs.waveHeightFt,
          dominantPeriodS: primaryObs.dominantPeriodS,
          avgPeriodS: primaryObs.avgPeriodS,
          meanDirDeg: primaryObs.waveDirDeg,
          gustKt: primaryObs.gustKt,
          presInHg: primaryObs.presHpa !== null ? primaryObs.presHpa * HPA_TO_INHG : null,
          airTempF: primaryObs.airTempF,
          waterTempF: primaryObs.waterTempF,
        }
      }
    }
  }

  let best: { station: Station; obs: RawNdbcObservation; distanceKm: number } | null = null

  for (const station of WAVE_CAPABLE_OFFSHORE_BUOYS) {
    const obs = observations.get(station.id)
    if (!obs || !hasWaveData(obs)) continue
    const distanceKm = haversineDistanceKm(spot.lat, spot.lng, station.lat, station.lng)
    if (distanceKm > MAX_WAVE_REFERENCE_KM) continue
    if (!best || distanceKm < best.distanceKm) {
      best = { station, obs, distanceKm }
    }
  }

  if (!best) return null

  const { station, obs, distanceKm } = best
  const isStale = isObservationStale(obs.observedAt)

  return {
    stationId: station.id,
    stationName: station.name,
    stationKind: station.kind,
    distanceKm,
    observedAt: obs.observedAt?.toISOString() ?? null,
    isStale,
    heightFt: obs.waveHeightFt,
    dominantPeriodS: obs.dominantPeriodS,
    avgPeriodS: obs.avgPeriodS,
    meanDirDeg: obs.waveDirDeg,
    gustKt: obs.gustKt,
    presInHg: obs.presHpa !== null ? obs.presHpa * HPA_TO_INHG : null,
    airTempF: obs.airTempF,
    waterTempF: obs.waterTempF,
  }
}

function buildInferenceNote(wind: WindObservation | null, wave: WaveObservation | null): string {
  const parts: string[] = []

  if (wind) {
    parts.push(
      `Wind from ${wind.stationName} (${wind.stationId}), ${wind.distanceKm.toFixed(1)} km from break`,
    )
  }

  if (wave) {
    parts.push(
      `Waves from offshore buoy ${wave.stationName} (${wave.stationId}), ${wave.distanceKm.toFixed(1)} km away — open-lake reference, not at surf line`,
    )
  } else if (wind) {
    parts.push('No offshore wave buoy in range — wave height unavailable at this break')
  }

  return parts.join('. ') + (parts.length ? '.' : '')
}

export async function fetchNdbcLatestObs(): Promise<Map<string, RawNdbcObservation>> {
  const response = await fetch(NDBC_LATEST_URL)
  if (!response.ok) {
    throw new Error(`NDBC fetch failed: ${response.status}`)
  }
  const text = await response.text()
  return parseNdbcLatestObs(text)
}

export function spotConditionsFromObservations(
  spot: SurfSpot,
  observations: Map<string, RawNdbcObservation>,
): SpotConditions | null {
  const wind = resolveWind(spot, observations)
  const wave = resolveWave(spot, observations)

  if (!wind && !wave) return null

  const windQ = wind ? windQuality(wind.distanceKm, wind.isStale) : null
  const waveQ = wave ? waveQuality(wave.distanceKm, wave.isStale) : null

  return {
    spotId: spot.id,
    wind,
    wave,
    quality: overallQuality(windQ, waveQ),
    inferenceNote: buildInferenceNote(wind, wave),
  }
}

export async function fetchSpotConditions(spot: SurfSpot): Promise<SpotConditions | null> {
  const observations = await fetchNdbcLatestObs()
  return spotConditionsFromObservations(spot, observations)
}
