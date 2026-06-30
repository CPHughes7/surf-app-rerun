import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'

type LocationDetailPanelProps = {
  pin: LocationPin
  justOpened?: boolean
  onClose: () => void
}

function LocationDetailPanel({ pin, justOpened = false, onClose }: LocationDetailPanelProps) {
  return (
    <section
      className={justOpened ? 'bottom-detail is-opened' : 'bottom-detail'}
      aria-label={`Details for ${pin.name}`}
    >
      <p className="bottom-detail__success" role="status">
        Expanded from map pin — full detail loaded below.
      </p>

      <header className="bottom-detail__header">
        <div>
          <p className="bottom-detail__label">Location detail</p>
          <h2>{pin.name}</h2>
          <p className="bottom-detail__coords">{formatCoords(pin.lat, pin.lng)}</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="bottom-detail__body">
        <section className="bottom-detail__section">
          <h3>NOAA</h3>
          <p className="bottom-detail__placeholder">
            Placeholder buoy readings for this session. NOAA live fetch will plug in here.
          </p>
          <dl className="bottom-detail__grid">
            <div>
              <dt>Nearest buoy</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt>Wave height</dt>
              <dd>— ft</dd>
            </div>
            <div>
              <dt>Wind speed</dt>
              <dd>— kt</dd>
            </div>
            <div>
              <dt>Wave period</dt>
              <dd>— s</dd>
            </div>
          </dl>
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
        Pin dropped {new Date(pin.createdAt).toLocaleString()} · session only
      </p>
    </section>
  )
}

export default LocationDetailPanel
