import { useBuoyData } from '../hooks/useBuoyData'
import type { LocationPin } from '../types/location'
import { formatCoords, windyEmbedUrl } from '../types/location'
import NoaaReadings from './NoaaReadings'

type PinPopupContentProps = {
  pin: LocationPin
  onOpen: () => void
}

function PinPopupContent({ pin, onOpen }: PinPopupContentProps) {
  const buoyData = useBuoyData(pin.spotId)

  return (
    <div className="pin-popup">
      <h3 className="pin-popup__title">{pin.name}</h3>
      <p className="pin-popup__coords">{formatCoords(pin.lat, pin.lng)}</p>
      <p className="pin-popup__region">{pin.region}</p>

      <section className="pin-popup__branch">
        <h4>NOAA</h4>
        <NoaaReadings buoyData={buoyData} variant="popup" />
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

      <p className="pin-popup__cta-hint">
        Need more detail? Expand this spot in the panel below the map.
      </p>
      <button
        type="button"
        className="btn btn--primary pin-popup__open"
        onClick={onOpen}
      >
        View full spot detail below
      </button>
    </div>
  )
}

export default PinPopupContent
