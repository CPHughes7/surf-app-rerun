import type { LocationPin } from '../types/location'
import { formatCoords } from '../types/location'

type LeftDrawerProps = {
  pins: LocationPin[]
  selectedSpotId: string | null
  selectedPin: LocationPin | null
  isOpen: boolean
  onSelectSpot: (spotId: string) => void
  onClose: () => void
}

function LeftDrawer({
  pins,
  selectedSpotId,
  selectedPin,
  isOpen,
  onSelectSpot,
  onClose,
}: LeftDrawerProps) {
  const regions = [...new Set(pins.map((pin) => pin.region))].sort()

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
        <p className="left-drawer__count">{pins.length}</p>
        <span className="placeholder-badge">Saved locations</span>
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
          <p>Pick a spot from the map or list below.</p>
        </section>
      )}

      <nav className="left-drawer__list" aria-label="Lake Michigan surf spots">
        {regions.map((region) => (
          <div key={region} className="left-drawer__region-group">
            <p className="left-drawer__label">{region}</p>
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
        ))}
      </nav>
    </aside>
  )
}

export default LeftDrawer
