import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LocationPin } from '../types/location'
import PinPopupContent from './PinPopupContent'

const LAKE_MICHIGAN_CENTER: [number, number] = [44.0, -86.5]
const LAKE_MICHIGAN_ZOOM = 6

const pinIcon = L.divIcon({
  className: 'lake-pin-icon',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

type MapClickHandlerProps = {
  onMapClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

type LakeMapProps = {
  pins: LocationPin[]
  onMapClick: (lat: number, lng: number) => void
  onOpenDetail: (pin: LocationPin) => void
}

function LakeMap({ pins, onMapClick, onOpenDetail }: LakeMapProps) {
  const markers = useMemo(
    () =>
      pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={pinIcon}>
          <Popup minWidth={260} maxWidth={320}>
            <PinPopupContent pin={pin} onOpen={onOpenDetail} />
          </Popup>
        </Marker>
      )),
    [pins, onOpenDetail],
  )

  return (
    <MapContainer
      className="lake-map"
      center={LAKE_MICHIGAN_CENTER}
      zoom={LAKE_MICHIGAN_ZOOM}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {markers}
    </MapContainer>
  )
}

export default LakeMap
