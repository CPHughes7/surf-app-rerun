import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { PrivateSpot } from '../lib/adminApi'

const LAKE_MICHIGAN_CENTER: [number, number] = [44.0, -86.5]
const LAKE_MICHIGAN_ZOOM = 6

const existingSpotIcon = L.divIcon({
  className: 'lake-pin-icon admin-pin-icon--existing',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const draftLocationIcon = L.divIcon({
  className: 'lake-pin-icon lake-pin-icon--selected admin-pin-icon--draft',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const facingPointIcon = L.divIcon({
  className: 'admin-pin-icon--facing',
  html: '<span class="admin-pin-icon--facing__dot"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

type LatLng = { lat: number; lng: number }

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

type AdminSpotMapProps = {
  existingSpots: PrivateSpot[]
  draftLocation: LatLng | null
  draftFacingPoint: LatLng | null
  onMapClick: (lat: number, lng: number) => void
}

function AdminSpotMap({ existingSpots, draftLocation, draftFacingPoint, onMapClick }: AdminSpotMapProps) {
  const existingMarkers = useMemo(
    () =>
      existingSpots.map((spot) => (
        <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={existingSpotIcon} />
      )),
    [existingSpots],
  )

  return (
    <MapContainer
      className="admin-map"
      center={LAKE_MICHIGAN_CENTER}
      zoom={LAKE_MICHIGAN_ZOOM}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {existingMarkers}
      {draftLocation && (
        <Marker position={[draftLocation.lat, draftLocation.lng]} icon={draftLocationIcon} />
      )}
      {draftFacingPoint && (
        <Marker position={[draftFacingPoint.lat, draftFacingPoint.lng]} icon={facingPointIcon} />
      )}
      {draftLocation && draftFacingPoint && (
        <Polyline
          positions={[
            [draftLocation.lat, draftLocation.lng],
            [draftFacingPoint.lat, draftFacingPoint.lng],
          ]}
          pathOptions={{ color: '#0e7490', weight: 2, dashArray: '4 4' }}
        />
      )}
    </MapContainer>
  )
}

export default AdminSpotMap
