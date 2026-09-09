import { useEffect } from 'react'
import type { BuoyDataState } from '../hooks/useBuoyData'
import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'
import { verdictCopyFor } from '../lib/verdictCopy'
import EmailCapture from './EmailCapture'
import NoaaReadings from './NoaaReadings'

type LocationDetailPanelProps = {
  pin: LocationPin
  buoyData: BuoyDataState
  onClose: () => void
}

function LocationDetailPanel({ pin, buoyData, onClose }: LocationDetailPanelProps) {
  const { surfability, loading } = buoyData
  const verdict = loading
    ? { headline: 'Checking conditions…', tone: 'unknown' as const }
    : verdictCopyFor(surfability.overall)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <section className="detail-sheet" aria-label={`Details for ${pin.name}`}>
      <div className="detail-sheet__inner">
        <header className="bottom-detail__header">
          <button type="button" className="btn btn--ghost bottom-detail__back" onClick={onClose}>
            ← Back to map
          </button>
          <div>
            <p className="bottom-detail__label">Surf spot</p>
            <h2>{pin.name}</h2>
            <p className="bottom-detail__coords">{formatCoords(pin.lat, pin.lng)}</p>
            <p className="bottom-detail__region">{pin.region}</p>
          </div>
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
      </div>
    </section>
  )
}

export default LocationDetailPanel
