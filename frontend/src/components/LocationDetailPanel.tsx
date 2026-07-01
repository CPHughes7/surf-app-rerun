import { useBuoyData } from '../hooks/useBuoyData'
import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'
import NoaaReadings from './NoaaReadings'
import SurfabilityBadge from './SurfabilityBadge'

type LocationDetailPanelProps = {
  pin: LocationPin
  justOpened?: boolean
  onClose: () => void
}

function LocationDetailPanel({ pin, justOpened = false, onClose }: LocationDetailPanelProps) {
  const buoyData = useBuoyData(pin.spotId)

  return (
    <section
      className={justOpened ? 'bottom-detail is-opened' : 'bottom-detail'}
      aria-label={`Details for ${pin.name}`}
    >
      <p className="bottom-detail__success" role="status">
        Live NOAA + Windy for {pin.name}.
      </p>

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

      <SurfabilityBadge surfability={buoyData.surfability} />

      <div className="bottom-detail__body">
        <section className="bottom-detail__section">
          <h3>NOAA</h3>
          <NoaaReadings buoyData={buoyData} variant="detail" />
        </section>

        <section className="bottom-detail__section bottom-detail__section--windy">
          <h3>Windy</h3>
          <iframe
            className="bottom-detail__windy"
            title={`Windy detail for ${pin.name}`}
            src={windyEmbedUrl(pin.lat, pin.lng)}
            loading="lazy"
          />
        </section>
      </div>

      <p className="bottom-detail__meta">
        Wind ref {pin.windStationId} · wave ref {pin.waveReferenceBuoyId} · opened{' '}
        {new Date(pin.createdAt).toLocaleString()}
      </p>
    </section>
  )
}

export default LocationDetailPanel
