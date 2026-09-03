import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { CatalogConditionsState } from '../hooks/useCatalogConditions'
import { buoyDataForSpot } from '../hooks/useCatalogConditions'
import type { LocationPin } from '../types/location'
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

function ClosePopupsOnSignal({ signal }: { signal: number }) {
  const map = useMap()

  useEffect(() => {
    if (signal > 0) map.closePopup()
  }, [signal, map])

  return null
}

type LakeMapProps = {
  pins: LocationPin[]
  selectedSpotId: string | null
  popupDismissSignal: number
  catalog: CatalogConditionsState
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (pin: LocationPin) => void
  onOpenDetail: (pin: LocationPin) => void
}

function LakeMap({
  pins,
  selectedSpotId,
  popupDismissSignal,
  catalog,
  onMapClick,
  onMarkerClick,
  onOpenDetail,
}: LakeMapProps) {
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
          >
            <Popup
              minWidth={260}
              maxWidth={320}
              maxHeight={360}
              className="pin-popup-wrapper"
              autoPan
              autoPanPadding={[16, 16]}
            >
              <PinPopupContent
                pin={pin}
                buoyData={buoyDataForSpot(catalog, pin.spotId)}
                onOpen={() => onOpenDetail(pin)}
              />
            </Popup>
          </Marker>
        )
      }),
    [pins, selectedSpotId, catalog, onMarkerClick, onOpenDetail],
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
      <ClosePopupsOnSignal signal={popupDismissSignal} />
      {markers}
    </MapContainer>
  )
}

export default LakeMap
