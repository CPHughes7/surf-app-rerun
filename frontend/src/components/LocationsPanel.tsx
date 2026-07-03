import { useBuoyData } from '../hooks/useBuoyData'
import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'
import NoaaReadings from './NoaaReadings'
import SurfabilityBadge from './SurfabilityBadge'

export type LocationsPanelView = 'list' | 'detail'

type LocationsPanelProps = {
  pins: LocationPin[]
  selectedSpotId: string | null
  selectedPin: LocationPin | null
  view: LocationsPanelView
  isOpen: boolean
  onSelectSpot: (spotId: string) => void
  onBackToList: () => void
  onClose: () => void
}

function LocationDetailSection({ pin }: { pin: LocationPin }) {
  const buoyData = useBuoyData(pin)

  return (
    <section className="locations-panel__detail" aria-label={`Details for ${pin.name}`}>
      <header className="locations-panel__detail-header">
        <div>
          <p className="locations-panel__label">Selected</p>
          <h2>{pin.name}</h2>
          <p className="locations-panel__coords">{formatCoords(pin.lat, pin.lng)}</p>
          <p className="locations-panel__region">{pin.region}</p>
        </div>
      </header>

      <SurfabilityBadge surfability={buoyData.surfability} />

      <section className="locations-panel__detail-section">
        <h3>NOAA</h3>
        <NoaaReadings buoyData={buoyData} variant="detail" />
      </section>

      <section className="locations-panel__detail-section locations-panel__detail-section--windy">
        <h3>Windy</h3>
        <iframe
          className="locations-panel__windy"
          title={`Windy forecast for ${pin.name}`}
          src={windyEmbedUrl(pin.lat, pin.lng)}
          loading="lazy"
        />
      </section>
    </section>
  )
}

function LocationsPanel({
  pins,
  selectedSpotId,
  selectedPin,
  view,
  isOpen,
  onSelectSpot,
  onBackToList,
  onClose,
}: LocationsPanelProps) {
  const regions = [...new Set(pins.map((pin) => pin.region))].sort()
  const showDetail = view === 'detail' && selectedPin !== null

  return (
    <aside
      id="locations-panel"
      className={
        isOpen
          ? showDetail
            ? 'locations-panel locations-panel--detail'
            : 'locations-panel'
          : 'locations-panel is-closed'
      }
      aria-label="Locations"
      aria-hidden={!isOpen}
    >
      {showDetail ? (
        <>
          <div className="locations-panel__toolbar">
            <button
              type="button"
              className="btn btn--ghost locations-panel__back"
              onClick={onBackToList}
            >
              ← All locations
            </button>
            <button
              type="button"
              className="btn btn--ghost locations-panel__close"
              onClick={onClose}
              aria-label="Hide locations panel"
            >
              Hide
            </button>
          </div>
          <LocationDetailSection pin={selectedPin} />
        </>
      ) : (
        <>
          <div className="locations-panel__toolbar">
            <div>
              <p className="locations-panel__label">Locations</p>
              <p className="locations-panel__count">{pins.length} saved</p>
            </div>
            <button
              type="button"
              className="btn btn--ghost locations-panel__close"
              onClick={onClose}
              aria-label="Hide locations panel"
            >
              Hide
            </button>
          </div>

          <nav className="locations-panel__list" aria-label="Saved locations">
            {pins.length === 0 ? (
              <section className="locations-panel__empty">
                <p>No locations yet. Click the map to add one.</p>
              </section>
            ) : (
              regions.map((region) => (
                <div key={region} className="locations-panel__region-group">
                  <p className="locations-panel__label">{region}</p>
                  <ul>
                    {pins
                      .filter((pin) => pin.region === region)
                      .map((pin) => (
                        <li key={pin.id}>
                          <button
                            type="button"
                            className={
                              pin.id === selectedSpotId ? 'pin-list-btn is-active' : 'pin-list-btn'
                            }
                            onClick={() => onSelectSpot(pin.id)}
                            aria-pressed={pin.id === selectedSpotId}
                          >
                            <span className="pin-list-btn__name">{pin.name}</span>
                            <span className="pin-list-btn__coords">
                              {formatCoords(pin.lat, pin.lng)}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))
            )}
          </nav>

          <section className="locations-panel__empty locations-panel__empty--hint">
            <p>Select a location to view NOAA readings and Windy forecast.</p>
          </section>
        </>
      )}
    </aside>
  )
}

export default LocationsPanel
