import type { SurfabilityFlag } from '../types/conditions'

export type VerdictTone = 'go' | 'marginal' | 'no' | 'unknown'

const VERDICT_BY_FLAG: Record<SurfabilityFlag, { headline: string; tone: VerdictTone }> = {
  good: { headline: 'Go', tone: 'go' },
  marginal: { headline: 'Marginal', tone: 'marginal' },
  windOnly: { headline: 'Marginal', tone: 'marginal' },
  staleData: { headline: 'Marginal', tone: 'marginal' },
  tooSmall: { headline: 'Not today', tone: 'no' },
  tooWindy: { headline: 'Not today', tone: 'no' },
  missingData: { headline: 'No verdict yet', tone: 'unknown' },
}

export function verdictCopyFor(overall: SurfabilityFlag): { headline: string; tone: VerdictTone } {
  return VERDICT_BY_FLAG[overall]
}
