import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { SURF_SPOTS } from '../data/surfSpots'
import type { LocationPin } from '../types/location'
import { spotToPin } from '../types/location'
import PinPopupContent from './PinPopupContent'

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

type PinPopupWithOpenProps = {
  pin: LocationPin
  onOpenDetail: (pin: LocationPin) => void
}

function PinPopupWithOpen({ pin, onOpenDetail }: PinPopupWithOpenProps) {
  const map = useMap()

  const handleOpen = () => {
    onOpenDetail(pin)
    map.closePopup()
  }

  return <PinPopupContent pin={pin} onOpen={handleOpen} />
}

type LakeMapProps = {
  selectedSpotId: string | null
  onMapClick: (lat: number, lng: number) => void
  onSelectSpot: (pin: LocationPin) => void
  onOpenDetail: (pin: LocationPin) => void
}

function LakeMap({ selectedSpotId, onMapClick, onSelectSpot, onOpenDetail }: LakeMapProps) {
  const markers = useMemo(
    () =>
      SURF_SPOTS.map((spot) => {
        const pin = spotToPin(spot)
        const isSelected = spot.id === selectedSpotId
        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={isSelected ? selectedSpotIcon : spotIcon}
            eventHandlers={{
              click: () => onSelectSpot(pin),
            }}
          >
            <Popup
              minWidth={260}
              maxWidth={320}
              maxHeight={320}
              className="pin-popup-wrapper"
              autoPan
              autoPanPadding={[16, 16]}
            >
              <PinPopupWithOpen pin={pin} onOpenDetail={onOpenDetail} />
            </Popup>
          </Marker>
        )
      }),
    [selectedSpotId, onSelectSpot, onOpenDetail],
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
