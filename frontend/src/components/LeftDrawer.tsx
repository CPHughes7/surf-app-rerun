import type { LocationPin } from '../types/location'
import { formatCoords } from '../types/location'

type LeftDrawerProps = {
  pins: LocationPin[]
  selectedPinId: string | null
  isOpen: boolean
  onSelectPin: (pinId: string) => void
  onClose: () => void
}

function LeftDrawer({ pins, selectedPinId, isOpen, onSelectPin, onClose }: LeftDrawerProps) {
  const selectedPin = pins.find((pin) => pin.id === selectedPinId) ?? null

  return (
    <aside
      id="pins-drawer"
      className={isOpen ? 'left-drawer' : 'left-drawer is-closed'}
      aria-label="Session pins"
      aria-hidden={!isOpen}
    >
      <div className="left-drawer__toolbar">
        <p className="left-drawer__label">Session pins</p>
        <button
          type="button"
          className="btn btn--ghost left-drawer__close"
          onClick={onClose}
          aria-label="Close pins drawer"
        >
          Close
        </button>
      </div>
      <div className="left-drawer__meta">
        <p className="left-drawer__count">{pins.length}</p>
        <span className="placeholder-badge">Ephemeral · refresh clears</span>
      </div>

      {selectedPin ? (
        <section className="left-drawer__summary" aria-label="Selected pin">
          <p className="left-drawer__label">Selected</p>
          <h2>{selectedPin.name}</h2>
          <p className="left-drawer__coords">{formatCoords(selectedPin.lat, selectedPin.lng)}</p>
        </section>
      ) : (
        <section className="left-drawer__summary left-drawer__summary--empty">
          <p className="left-drawer__label">Selected</p>
          <p>No pin selected yet. Drop one on the map or pick from the list.</p>
        </section>
      )}

      <nav className="left-drawer__list" aria-label="All session pins">
        <p className="left-drawer__label">All pins</p>
        {pins.length === 0 ? (
          <p className="left-drawer__empty">No pins this session.</p>
        ) : (
          <ul>
            {pins.map((pin) => (
              <li key={pin.id}>
                <button
                  type="button"
                  className={
                    pin.id === selectedPinId ? 'pin-list-btn is-active' : 'pin-list-btn'
                  }
                  onClick={() => onSelectPin(pin.id)}
                  aria-pressed={pin.id === selectedPinId}
                >
                  <span className="pin-list-btn__name">{pin.name}</span>
                  <span className="pin-list-btn__coords">
                    {formatCoords(pin.lat, pin.lng)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  )
}

export default LeftDrawer
