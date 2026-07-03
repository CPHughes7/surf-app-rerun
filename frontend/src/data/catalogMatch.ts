import { SURF_SPOTS } from './surfSpots'
import type { LocationPin } from '../types/location'

export type LocationDtoLike = {
  id: number
  name: string
  latitude: number
  longitude: number
}

/**
 * Match a backend location to instructional surf catalog metadata when possible.
 * surfSpots.ts is reference/seed metadata only — not the runtime source of truth.
 */
function matchCatalogSpot(dto: LocationDtoLike) {
  return SURF_SPOTS.find(
    (spot) =>
      spot.name === dto.name ||
      (Math.abs(spot.lat - dto.latitude) < 0.02 &&
        Math.abs(spot.lng - dto.longitude) < 0.02),
  )
}

/** Derive a LocationPin from API data plus optional catalog station hints. */
export function enrichLocationPin(dto: LocationDtoLike): LocationPin {
  const catalog = matchCatalogSpot(dto)
  const id = String(dto.id)

  if (catalog) {
    return {
      id,
      spotId: id,
      name: dto.name,
      lat: dto.latitude,
      lng: dto.longitude,
      region: catalog.region,
      windStationId: catalog.windStationId,
      waveReferenceBuoyId: catalog.waveReferenceBuoyId,
      createdAt: new Date().toISOString(),
    }
  }

  return {
    id,
    spotId: id,
    name: dto.name,
    lat: dto.latitude,
    lng: dto.longitude,
    region: 'Custom',
    windStationId: '',
    waveReferenceBuoyId: '',
    createdAt: new Date().toISOString(),
  }
}
