import type { SpotConditions, SurfabilityFlag, SurfabilityScore } from '../types/conditions'

const MIN_WAVE_FT = 1.5
const GOOD_WAVE_FT = 2.5
const HIGH_WIND_KT = 22
const MARGINAL_WIND_KT = 18

function formatWave(heightFt: number | null): string {
  if (heightFt === null) return 'unknown wave height'
  return `${heightFt.toFixed(1)} ft waves (offshore reference)`
}

function formatWind(speedKt: number | null): string {
  if (speedKt === null) return 'unknown wind'
  return `${speedKt.toFixed(0)} kt wind at pier`
}

export function computeSurfability(conditions: SpotConditions | null): SurfabilityScore {
  if (!conditions) {
    return {
      overall: 'missingData',
      flags: ['missingData'],
      summary: 'No nearshore wind or offshore wave data available.',
      confidence: 'low',
    }
  }

  const { wind, wave } = conditions
  const windSpeedKt = wind?.speedKt ?? null
  const waveHeightFt = wave?.heightFt ?? null
  const isStale = (wind?.isStale ?? false) || (wave?.isStale ?? false)

  const flags: SurfabilityFlag[] = []

  if (isStale) flags.push('staleData')

  if (windSpeedKt === null && waveHeightFt === null) {
    flags.push('missingData')
    return {
      overall: 'missingData',
      flags,
      summary: 'Stations are online but wind and wave readings are missing.',
      confidence: conditions.quality,
    }
  }

  const windOnly = waveHeightFt === null && windSpeedKt !== null
  if (windOnly) flags.push('windOnly')

  const tooWindy = windSpeedKt !== null && windSpeedKt > HIGH_WIND_KT
  if (tooWindy) flags.push('tooWindy')

  let tooSmall = false
  if (waveHeightFt !== null) {
    tooSmall = waveHeightFt < MIN_WAVE_FT
    if (tooSmall) flags.push('tooSmall')
  }

  let overall: SurfabilityFlag

  if (windOnly) {
    if (tooWindy) {
      overall = 'tooWindy'
    } else if (windSpeedKt !== null && windSpeedKt > MARGINAL_WIND_KT) {
      overall = 'marginal'
      flags.push('marginal')
    } else {
      overall = 'windOnly'
    }
  } else if (flags.includes('staleData') && !tooSmall && !tooWindy) {
    overall = 'staleData'
  } else if (tooSmall && tooWindy) {
    overall = 'tooSmall'
  } else if (tooSmall) {
    overall = 'tooSmall'
  } else if (tooWindy) {
    overall = 'tooWindy'
  } else if (
    (waveHeightFt !== null && waveHeightFt < GOOD_WAVE_FT) ||
    (windSpeedKt !== null && windSpeedKt > MARGINAL_WIND_KT)
  ) {
    overall = 'marginal'
    if (!flags.includes('marginal')) flags.push('marginal')
  } else {
    overall = 'good'
    flags.push('good')
  }

  return {
    overall,
    flags: [...new Set(flags)],
    summary: buildSummary(overall, conditions, windOnly),
    confidence: conditions.quality,
  }
}

function buildSummary(
  overall: SurfabilityFlag,
  conditions: SpotConditions,
  windOnly: boolean,
): string {
  const windSpeedKt = conditions.wind?.speedKt ?? null
  const waveHeightFt = conditions.wave?.heightFt ?? null
  const waveDist = conditions.wave?.distanceKm
  const waveDistNote =
    waveDist !== undefined && waveDist > 15
      ? ` Offshore buoy is ${waveDist.toFixed(0)} km away — treat wave height as approximate.`
      : ''

  if (windOnly) {
    const wind = formatWind(windSpeedKt)
    switch (overall) {
      case 'tooWindy':
        return `Likely blown out: ${wind} exceeds ~${HIGH_WIND_KT} kt. No nearshore wave sensor — check Windy or go look.`
      case 'marginal':
        return `Marginal wind: ${wind}. No offshore wave buoy in range — check Windy for swell.`
      default:
        return `Wind looks workable: ${wind}. No offshore wave sensor nearby — check Windy or go look.`
    }
  }

  const wave = formatWave(waveHeightFt)
  const wind = formatWind(windSpeedKt)

  switch (overall) {
    case 'good':
      return `Looks surfable: ${wave}, ${wind}.${waveDistNote}`
    case 'marginal':
      return `Marginal session: ${wave}, ${wind}. Worth checking in person.${waveDistNote}`
    case 'tooSmall':
      return `Likely flat: ${wave} — below ~${MIN_WAVE_FT} ft threshold.${waveDistNote}`
    case 'tooWindy':
      return `Likely blown out: ${wind} exceeds ~${HIGH_WIND_KT} kt.${waveDistNote}`
    case 'staleData':
      return `Data is stale (>2 h). ${wave}, ${wind}. Treat as uncertain.${waveDistNote}`
    default:
      return conditions.inferenceNote || 'Insufficient data from nearest stations.'
  }
}

export function surfabilityLabel(flag: SurfabilityFlag): string {
  switch (flag) {
    case 'good':
      return 'Surfable'
    case 'marginal':
      return 'Marginal'
    case 'tooSmall':
      return 'Too flat'
    case 'tooWindy':
      return 'Too windy'
    case 'staleData':
      return 'Stale data'
    case 'windOnly':
      return 'Wind only'
    case 'missingData':
      return 'No data'
    default:
      return flag
  }
}

export function qualityLabel(quality: SpotConditions['quality']): string {
  switch (quality) {
    case 'high':
      return 'High confidence'
    case 'medium':
      return 'Medium confidence'
    case 'low':
      return 'Low confidence'
  }
}
