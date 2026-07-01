import { SNAP_RADIUS_M, SURF_SPOTS, type SurfSpot } from '../../data/surfSpots'
import { haversineDistanceM } from './haversine'

export type SnapResult =
  | { ok: true; spot: SurfSpot; distanceM: number }
  | { ok: false; nearestSpot: SurfSpot | null; nearestDistanceM: number | null }

export function snapToNearestSpot(lat: number, lng: number): SnapResult {
  let nearest: SurfSpot | null = null
  let nearestDistance = Infinity

  for (const spot of SURF_SPOTS) {
    const distanceM = haversineDistanceM(lat, lng, spot.lat, spot.lng)
    if (distanceM < nearestDistance) {
      nearestDistance = distanceM
      nearest = spot
    }
  }

  if (nearest && nearestDistance <= SNAP_RADIUS_M) {
    return { ok: true, spot: nearest, distanceM: nearestDistance }
  }

  return {
    ok: false,
    nearestSpot: nearest,
    nearestDistanceM: nearest ? nearestDistance : null,
  }
}
