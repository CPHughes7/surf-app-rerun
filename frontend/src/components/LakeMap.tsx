import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LocationPin } from '../types/location'

const LAKE_MICHIGAN_CENTER: [number, number] = [44.0, -86.5]
const LAKE_MICHIGAN_ZOOM = 6

const spotIcon = L.divIcon({
  className: 'lake-pin-icon',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

const selectedSpotIcon = L.divIcon({
  className: 'lake-pin-icon lake-pin-icon--selected',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
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
  selectedSpotId: string | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (pin: LocationPin) => void
}

function LakeMap({ pins, selectedSpotId, onMapClick, onMarkerClick }: LakeMapProps) {
  // Marker click goes straight to the full-screen detail view — no
  // intermediate popup. Only one thing is ever "open" at a time.
  const markers = useMemo(
    () =>
      pins.map((pin) => {
        const isSelected = pin.id === selectedSpotId
        return (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={isSelected ? selectedSpotIcon : spotIcon}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent)
                onMarkerClick(pin)
              },
            }}
          />
        )
      }),
    [pins, selectedSpotId, onMarkerClick],
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
