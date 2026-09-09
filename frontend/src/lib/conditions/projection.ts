import { computeSurfability } from '../surfability'
import type { SpotConditions, SurfabilityFlag, SurfabilityScore } from '../../types/conditions'

export type WindExposure = 'onshore' | 'offshore' | 'crossshore' | 'unknown'

export type PrivateSpotVerdict = SurfabilityScore & {
  isProjected: true
  windExposure: WindExposure
  /** 0-100. How much the source stations' distance has eaten into trust in this read — see decayFactor. */
  confidencePercent: number
}

function angularDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

/**
 * Classifies wind relative to a spot's facing direction (the compass
 * bearing from shore out to open water). Wind blowing FROM roughly that
 * same direction is blowing onshore (off the water, onto the beach —
 * mushes up the wave face); wind FROM the opposite direction is offshore
 * (off the land — grooms it clean).
 */
export function classifyWindExposure(facingDeg: number, windDirDeg: number | null): WindExposure {
  if (windDirDeg === null) return 'unknown'
  const diff = angularDiff(facingDeg, windDirDeg)
  if (diff <= 45) return 'onshore'
  if (diff >= 135) return 'offshore'
  return 'crossshore'
}

// Simple, transparent one-notch penalty for onshore wind — not a shoaling/
// refraction model. Flags already at the worst-case or missing-data floor
// are left alone; there's nowhere lower to push them with this heuristic.
const ONSHORE_DOWNGRADE: Partial<Record<SurfabilityFlag, SurfabilityFlag>> = {
  good: 'marginal',
  marginal: 'tooWindy',
  windOnly: 'marginal',
}

// Exponential decay, not a cliff: confidence halves every N km. Waves carry
// lake-wide swell energy that travels reasonably well, so a longer half-life;
// nearshore wind is hyper-local and decays faster. Not a physical model of
// how surf energy actually attenuates with distance — just an honest,
// transparent way to say "farther away = trust this less" with a number
// instead of a flat, always-the-same "low confidence" label.
const WAVE_HALF_LIFE_KM = 25
const WIND_HALF_LIFE_KM = 15

function decayFactor(distanceKm: number, halfLifeKm: number): number {
  return Math.pow(0.5, distanceKm / halfLifeKm)
}

/**
 * 0-100. Wave decay dominates (surf height is the primary call); wind decay
 * is a secondary modifier. Wind-only reads (no wave buoy in range at all)
 * carry an extra penalty on top of their own decay — missing the primary
 * signal entirely is worse than just having it far away.
 */
function computeConfidencePercent(conditions: SpotConditions | null): number {
  const waveDistanceKm = conditions?.wave?.distanceKm ?? null
  const windDistanceKm = conditions?.wind?.distanceKm ?? null

  const waveDecay = waveDistanceKm !== null ? decayFactor(waveDistanceKm, WAVE_HALF_LIFE_KM) : null
  const windDecay = windDistanceKm !== null ? decayFactor(windDistanceKm, WIND_HALF_LIFE_KM) : null

  if (waveDecay !== null && windDecay !== null) {
    return Math.round((waveDecay * 0.7 + windDecay * 0.3) * 100)
  }
  if (waveDecay !== null) return Math.round(waveDecay * 100)
  if (windDecay !== null) return Math.round(windDecay * 0.6 * 100)
  return 0
}

/**
 * Produces a verdict for a spot with no buoy of its own, by fusing the
 * same nearest-in-range NOAA data catalog spots use (via the Step 4 seam)
 * with a simple onshore/offshore adjustment for the spot's facing. Always
 * reports 'low' confidence — a projection to a point is never as
 * trustworthy as a known break with real history — and says so plainly.
 */
export function projectPrivateSpotVerdict(
  conditions: SpotConditions | null,
  facingDeg: number,
): PrivateSpotVerdict {
  const base = computeSurfability(conditions)
  const windExposure = classifyWindExposure(facingDeg, conditions?.wind?.dirDeg ?? null)
  const confidencePercent = computeConfidencePercent(conditions)

  const downgradeTo = windExposure === 'onshore' ? ONSHORE_DOWNGRADE[base.overall] : undefined
  const overall = downgradeTo ?? base.overall

  const exposureNote =
    windExposure === 'onshore'
      ? " Wind looks onshore for this spot's facing — expect it choppier than the raw numbers suggest."
      : windExposure === 'offshore'
        ? " Wind looks offshore for this spot's facing — favorable if the rest lines up."
        : ''

  const waveDistanceKm = conditions?.wave?.distanceKm
  const decayNote =
    waveDistanceKm !== undefined
      ? confidencePercent >= 60
        ? ` Wave buoy is ${waveDistanceKm.toFixed(0)} km away — close enough that this should hold up reasonably well.`
        : confidencePercent >= 25
          ? ` Wave buoy is ${waveDistanceKm.toFixed(0)} km away, so confidence has decayed to roughly ${confidencePercent}% — treat this as a regional estimate, not a precise local read.`
          : ` Wave buoy is ${waveDistanceKm.toFixed(0)} km away — at that range confidence has decayed to only ~${confidencePercent}%. Treat this as a rough regional signal, little more.`
      : ''

  return {
    overall,
    flags: downgradeTo ? [...new Set([...base.flags, overall])] : base.flags,
    summary: `Projected verdict — no buoy at this exact spot, fused from nearby stations.${decayNote}${exposureNote} ${base.summary}`,
    confidence: 'low',
    isProjected: true,
    windExposure,
    confidencePercent,
  }
}
