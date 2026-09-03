import { computeSurfability } from '../surfability'
import type { SpotConditions, SurfabilityFlag, SurfabilityScore } from '../../types/conditions'

export type WindExposure = 'onshore' | 'offshore' | 'crossshore' | 'unknown'

export type PrivateSpotVerdict = SurfabilityScore & {
  isProjected: true
  windExposure: WindExposure
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

  const downgradeTo = windExposure === 'onshore' ? ONSHORE_DOWNGRADE[base.overall] : undefined
  const overall = downgradeTo ?? base.overall

  const exposureNote =
    windExposure === 'onshore'
      ? " Wind looks onshore for this spot's facing — expect it choppier than the raw numbers suggest."
      : windExposure === 'offshore'
        ? " Wind looks offshore for this spot's facing — favorable if the rest lines up."
        : ''

  return {
    overall,
    flags: downgradeTo ? [...new Set([...base.flags, overall])] : base.flags,
    summary: `Projected verdict — no buoy at this exact spot, fused from nearby stations.${exposureNote} ${base.summary}`,
    confidence: 'low',
    isProjected: true,
    windExposure,
  }
}
