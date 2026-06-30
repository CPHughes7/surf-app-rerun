import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'

type LocationDetailPanelProps = {
  pin: LocationPin
  onClose: () => void
}

function LocationDetailPanel({ pin, onClose }: LocationDetailPanelProps) {
  return (
    <>
      <div className="detail-panel-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="detail-panel" aria-label={`Details for ${pin.name}`}>
        <header className="detail-panel__header">
          <div>
            <p className="detail-panel__label">Location detail</p>
            <h2>{pin.name}</h2>
            <p className="detail-panel__coords">{formatCoords(pin.lat, pin.lng)}</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <section className="detail-panel__section">
          <h3>NOAA</h3>
          <p className="detail-panel__placeholder">
            Placeholder buoy readings for this session. NOAA live fetch will plug in here.
          </p>
          <dl className="detail-panel__grid">
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

        <section className="detail-panel__section">
          <h3>Windy</h3>
          <iframe
            className="detail-panel__windy"
            title={`Windy detail for ${pin.name}`}
            src={windyEmbedUrl(pin.lat, pin.lng)}
            loading="lazy"
          />
        </section>

        <p className="detail-panel__meta">
          Pin dropped {new Date(pin.createdAt).toLocaleString()} · session only
        </p>
      </aside>
    </>
  )
}

export default LocationDetailPanel
