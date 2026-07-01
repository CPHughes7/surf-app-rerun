import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import type { Spot } from '../../types/surf'

const LAKE_MICHIGAN_CENTER: [number, number] = [44.0, -86.5]
const LAKE_MICHIGAN_ZOOM = 6

const spotIcon = L.divIcon({
  className: 'lake-pin-icon',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

type LakeViewProps = {
  spots: Spot[]
}

export function LakeView({ spots }: LakeViewProps) {
  const markers = useMemo(
    () =>
      spots.map((spot) => (
        <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={spotIcon} />
      )),
    [spots],
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
      {markers}
    </MapContainer>
  )
}
