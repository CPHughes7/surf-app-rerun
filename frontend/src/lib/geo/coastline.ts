/**
 * Simplified Lake Michigan shoreline outline for a coastline-proximity gate
 * on private-spot creation — not survey-grade GIS data, just enough vertices
 * to trace the lake's real shape (including stretches with no catalog spot
 * or NOAA station, e.g. the northern end) so private spots can't be dropped
 * mid-lake or far inland. Clockwise from the south end near Gary, IN.
 *
 * Mirrored in backend/coastline.py for the real server-side gate — keep
 * both in sync if these vertices ever get refined.
 */
export const LAKE_MICHIGAN_OUTLINE: [number, number][] = [
  [41.63, -87.2],
  [41.88, -87.62],
  [42.5, -87.8],
  [43.04, -87.9],
  [43.75, -87.71],
  [44.15, -87.6],
  [45.25, -86.95],
  [45.95, -86.25],
  [45.78, -85.05],
  [45.32, -85.26],
  [44.85, -85.9],
  [44.63, -86.25],
  [44.25, -86.35],
  [43.95, -86.45],
  [43.23, -86.35],
  [43.06, -86.23],
  [42.77, -86.2],
  [42.4, -86.27],
  [42.11, -86.49],
  [41.79, -86.74],
  [41.71, -86.91],
  [41.63, -87.2],
]

export const DEFAULT_MAX_COASTLINE_DISTANCE_KM = 15

const KM_PER_DEG_LAT = 111.32

/** Equirectangular-flat point-to-segment distance — accurate enough at this scale. */
function distanceToSegmentKm(
  lat: number,
  lng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const refLat = (lat1 + lat2) / 2
  const kmPerDegLng = KM_PER_DEG_LAT * Math.cos((refLat * Math.PI) / 180)

  const bx = (lng2 - lng1) * kmPerDegLng
  const by = (lat2 - lat1) * KM_PER_DEG_LAT
  const px = (lng - lng1) * kmPerDegLng
  const py = (lat - lat1) * KM_PER_DEG_LAT

  const abLenSq = bx * bx + by * by
  const t = abLenSq === 0 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / abLenSq))
  const dx = px - t * bx
  const dy = py - t * by
  return Math.sqrt(dx * dx + dy * dy)
}

export function distanceToCoastlineKm(lat: number, lng: number): number {
  let min = Infinity
  for (let i = 0; i < LAKE_MICHIGAN_OUTLINE.length - 1; i++) {
    const [lat1, lng1] = LAKE_MICHIGAN_OUTLINE[i]
    const [lat2, lng2] = LAKE_MICHIGAN_OUTLINE[i + 1]
    const d = distanceToSegmentKm(lat, lng, lat1, lng1, lat2, lng2)
    if (d < min) min = d
  }
  return min
}

export function isNearCoastline(
  lat: number,
  lng: number,
  maxKm: number = DEFAULT_MAX_COASTLINE_DISTANCE_KM,
): boolean {
  return distanceToCoastlineKm(lat, lng) <= maxKm
}
