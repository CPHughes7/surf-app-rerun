import type { BuoyDataState } from '../hooks/useBuoyData'
import type { SurfabilityFlag } from '../types/conditions'
import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'
import EmailCapture from './EmailCapture'
import NoaaReadings from './NoaaReadings'

type LocationDetailPanelProps = {
  pin: LocationPin
  buoyData: BuoyDataState
  onClose: () => void
}

type VerdictTone = 'go' | 'marginal' | 'no' | 'unknown'

const VERDICT_BY_FLAG: Record<SurfabilityFlag, { headline: string; tone: VerdictTone }> = {
  good: { headline: 'Go', tone: 'go' },
  marginal: { headline: 'Marginal', tone: 'marginal' },
  windOnly: { headline: 'Marginal', tone: 'marginal' },
  staleData: { headline: 'Marginal', tone: 'marginal' },
  tooSmall: { headline: 'Not today', tone: 'no' },
  tooWindy: { headline: 'Not today', tone: 'no' },
  missingData: { headline: 'No verdict yet', tone: 'unknown' },
}

function LocationDetailPanel({ pin, buoyData, onClose }: LocationDetailPanelProps) {
  const { surfability, loading } = buoyData
  const verdict = loading
    ? { headline: 'Checking conditions…', tone: 'unknown' as VerdictTone }
    : VERDICT_BY_FLAG[surfability.overall]

  return (
    <section className="detail-sheet" aria-label={`Details for ${pin.name}`}>
      <header className="bottom-detail__header">
        <div>
          <p className="bottom-detail__label">Surf spot</p>
          <h2>{pin.name}</h2>
          <p className="bottom-detail__coords">{formatCoords(pin.lat, pin.lng)}</p>
          <p className="bottom-detail__region">{pin.region}</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Close
        </button>
      </header>

      <div className={`verdict-banner verdict-banner--${verdict.tone}`}>
        <p className="verdict-banner__eyebrow">Verdict</p>
        <h3 className="verdict-banner__headline">{verdict.headline}</h3>
        {!loading && <p className="verdict-banner__summary">{surfability.summary}</p>}
      </div>

      <EmailCapture spotId={pin.spotId} spotName={pin.name} />

      <p className="bottom-detail__detail-label">The detail, if you want it</p>

      <div className="bottom-detail__body">
        <section className="bottom-detail__section">
          <h3>NOAA</h3>
          <NoaaReadings buoyData={buoyData} variant="detail" showVerdict={false} />
        </section>

        <section className="bottom-detail__section bottom-detail__section--windy">
          <h3>Windy</h3>
          <iframe
            className="bottom-detail__windy"
            title={`Windy forecast for ${pin.name}`}
            src={windyEmbedUrl(pin.lat, pin.lng)}
            loading="lazy"
          />
        </section>
      </div>
    </section>
  )
}

export default LocationDetailPanel
