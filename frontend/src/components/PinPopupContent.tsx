import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'

type PinPopupContentProps = {
  pin: LocationPin
  onOpen: (pin: LocationPin) => void
}

function PinPopupContent({ pin, onOpen }: PinPopupContentProps) {
  return (
    <div className="pin-popup">
      <h3 className="pin-popup__title">{pin.name}</h3>
      <p className="pin-popup__coords">{formatCoords(pin.lat, pin.lng)}</p>

      <section className="pin-popup__branch">
        <h4>NOAA</h4>
        <p className="pin-popup__placeholder">
          Buoy data placeholder — live NOAA fetch not wired yet.
        </p>
        <dl className="pin-popup__readings">
          <div>
            <dt>Wave height</dt>
            <dd>— ft</dd>
          </div>
          <div>
            <dt>Wind</dt>
            <dd>— kt</dd>
          </div>
          <div>
            <dt>Period</dt>
            <dd>— s</dd>
          </div>
        </dl>
      </section>

      <section className="pin-popup__branch">
        <h4>Windy</h4>
        <iframe
          className="pin-popup__windy"
          title={`Windy forecast for ${pin.name}`}
          src={windyEmbedUrl(pin.lat, pin.lng)}
          loading="lazy"
        />
      </section>

      <button
        type="button"
        className="btn btn--primary pin-popup__open"
        onClick={() => onOpen(pin)}
      >
        Open
      </button>
    </div>
  )
}

export default PinPopupContent
