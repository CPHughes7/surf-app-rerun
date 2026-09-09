import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { CatalogConditionsState } from '../hooks/useCatalogConditions'
import { buoyDataForSpot } from '../hooks/useCatalogConditions'
import { verdictCopyFor } from '../lib/verdictCopy'
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
  catalog: CatalogConditionsState
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (pin: LocationPin) => void
}

function LakeMap({ pins, selectedSpotId, catalog, onMapClick, onMarkerClick }: LakeMapProps) {
  // Hover shows a quick glance (name + verdict) via Leaflet's own Tooltip —
  // that's hover-only by construction, so it can never linger or stack with
  // the full-screen detail the way a click-triggered Popup did. Click always
  // goes straight to that full-screen view, one way, one thing at a time.
  const markers = useMemo(
    () =>
      pins.map((pin) => {
        const isSelected = pin.id === selectedSpotId
        const buoyData = buoyDataForSpot(catalog, pin.spotId)
        const verdict = catalog.loading ? null : verdictCopyFor(buoyData.surfability.overall)
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
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="spot-tooltip">
              <strong>{pin.name}</strong>
              {verdict && (
                <span className={`spot-tooltip__verdict spot-tooltip__verdict--${verdict.tone}`}>
                  {verdict.headline}
                </span>
              )}
            </Tooltip>
          </Marker>
        )
      }),
    [pins, selectedSpotId, catalog, onMarkerClick],
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
