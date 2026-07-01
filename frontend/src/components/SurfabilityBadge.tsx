import type { BuoyDataState } from '../hooks/useBuoyData'
import { qualityLabel, surfabilityLabel } from '../lib/surfability'
import type { SurfabilityFlag } from '../types/conditions'

type SurfabilityBadgeProps = {
  surfability: BuoyDataState['surfability']
  compact?: boolean
}

const FLAG_CLASS: Record<SurfabilityFlag, string> = {
  good: 'surfability-badge surfability-badge--good',
  marginal: 'surfability-badge surfability-badge--marginal',
  tooSmall: 'surfability-badge surfability-badge--poor',
  tooWindy: 'surfability-badge surfability-badge--poor',
  staleData: 'surfability-badge surfability-badge--warn',
  windOnly: 'surfability-badge surfability-badge--warn',
  missingData: 'surfability-badge surfability-badge--neutral',
}

function SurfabilityBadge({ surfability, compact = false }: SurfabilityBadgeProps) {
  const badgeClass = FLAG_CLASS[surfability.overall] ?? FLAG_CLASS.missingData

  return (
    <div className={compact ? 'surfability-block surfability-block--compact' : 'surfability-block'}>
      <span className={badgeClass}>{surfabilityLabel(surfability.overall)}</span>
      <span className={`confidence-badge confidence-badge--${surfability.confidence}`}>
        {qualityLabel(surfability.confidence)}
      </span>
      {!compact && <p className="surfability-block__summary">{surfability.summary}</p>}
    </div>
  )
}

export default SurfabilityBadge
