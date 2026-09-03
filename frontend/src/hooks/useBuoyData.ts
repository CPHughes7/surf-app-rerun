import { computeSurfability } from '../lib/surfability'
import type { SpotConditions, SurfabilityScore } from '../types/conditions'

export type BuoyDataState = {
  conditions: SpotConditions | null
  surfability: SurfabilityScore
  loading: boolean
  error: string | null
}

export const EMPTY_SURFABILITY = computeSurfability(null)
