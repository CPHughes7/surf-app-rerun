import { SURF_SPOTS } from '../data/surfSpots'
import type { LocationPin } from '../types/location'
import { formatCoords } from '../types/location'

type LeftDrawerProps = {
  spots: typeof SURF_SPOTS
  selectedSpotId: string | null
  selectedPin: LocationPin | null
  isOpen: boolean
  onSelectSpot: (spotId: string) => void
  onClose: () => void
}

function LeftDrawer({
  spots,
  selectedSpotId,
  selectedPin,
  isOpen,
  onSelectSpot,
  onClose,
}: LeftDrawerProps) {
  const regions = [...new Set(spots.map((s) => s.region))]

  return (
    <aside
      id="pins-drawer"
      className={isOpen ? 'left-drawer' : 'left-drawer is-closed'}
      aria-label="Surf spots"
      aria-hidden={!isOpen}
    >
      <div className="left-drawer__toolbar">
        <p className="left-drawer__label">Surf spots</p>
        <button
          type="button"
          className="btn btn--ghost left-drawer__close"
          onClick={onClose}
          aria-label="Close spots drawer"
        >
          Close
        </button>
      </div>
      <div className="left-drawer__meta">
        <p className="left-drawer__count">{spots.length}</p>
        <span className="placeholder-badge">Lake Michigan catalog</span>
      </div>

      {selectedPin ? (
        <section className="left-drawer__summary" aria-label="Selected spot">
          <p className="left-drawer__label">Selected</p>
          <h2>{selectedPin.name}</h2>
          <p className="left-drawer__coords">{formatCoords(selectedPin.lat, selectedPin.lng)}</p>
          <p className="left-drawer__region">{selectedPin.region}</p>
        </section>
      ) : (
        <section className="left-drawer__summary left-drawer__summary--empty">
          <p className="left-drawer__label">Selected</p>
          <p>Pick a catalog spot from the map or list below.</p>
        </section>
      )}

      <nav className="left-drawer__list" aria-label="Lake Michigan surf spots">
        {regions.map((region) => (
          <div key={region} className="left-drawer__region-group">
            <p className="left-drawer__label">{region}</p>
            <ul>
              {spots
                .filter((s) => s.region === region)
                .map((spot) => (
                  <li key={spot.id}>
                    <button
                      type="button"
                      className={
                        spot.id === selectedSpotId ? 'pin-list-btn is-active' : 'pin-list-btn'
                      }
                      onClick={() => onSelectSpot(spot.id)}
                      aria-pressed={spot.id === selectedSpotId}
                    >
                      <span className="pin-list-btn__name">{spot.name}</span>
                      <span className="pin-list-btn__coords">
                        {formatCoords(spot.lat, spot.lng)}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default LeftDrawer
