import { bearingDeg } from './bearing'

/**
 * Simplified Lake Michigan shoreline outline for a coastline-proximity gate
 * on private-spot creation — not survey-grade GIS data, just enough vertices
 * to trace the lake's real shape. Densified with the 13 catalog spots' exact
 * coordinates (see data/surfSpots.ts) everywhere one falls near the shore, so
 * the outline is genuinely accurate right where usage will concentrate;
 * stretches with no catalog spot or NOAA station (the northern end, roughly
 * vertices 6-12 below) are still a coarse hand-authored approximation.
 * Clockwise from the south end near Gary, IN — the clockwise winding matters
 * for estimateFacingDeg below, not just distance.
 *
 * Mirrored in backend/coastline.py for the real server-side gate — keep
 * both in sync if these vertices ever get refined.
 */
export const LAKE_MICHIGAN_OUTLINE: [number, number][] = [
  [41.63, -87.2], // Gary, IN (generic anchor, no catalog spot here)
  [41.6747, -87.4947], // Whihala Beach
  [41.9619, -87.6389], // Montrose Beach
  [42.4167, -87.8333], // Waukegan
  [43.0536, -87.8756], // Milwaukee
  [43.7536, -87.6956], // Sheboygan
  [44.15, -87.6], // Manitowoc (generic anchor)
  [45.25, -86.95], // Door peninsula tip (generic anchor)
  [45.95, -86.25], // far north shore (generic anchor)
  [45.78, -85.05], // Mackinac area (generic anchor)
  [45.32, -85.26], // Charlevoix (generic anchor)
  [44.85, -85.9], // Traverse City area (generic anchor)
  [44.63, -86.25], // Frankfort (generic anchor)
  [44.25, -86.35], // Manistee (generic anchor)
  [44.0267, -86.4578], // Ludington
  [43.2342, -86.3478], // Muskegon
  [43.0631, -86.2289], // Grand Haven
  [42.87, -86.202], // Holland
  [42.4017, -86.265], // South Haven
  [42.115, -86.487], // St. Joseph
  [41.7939, -86.7442], // New Buffalo
  [41.7106, -86.9014], // Michigan City
  [41.63, -87.2], // back to Gary, closing the loop
]

export const DEFAULT_MAX_COASTLINE_DISTANCE_KM = 2

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

function nearestSegment(lat: number, lng: number): { index: number; distanceKm: number } {
  let bestIndex = 0
  let bestDistance = Infinity
  for (let i = 0; i < LAKE_MICHIGAN_OUTLINE.length - 1; i++) {
    const [lat1, lng1] = LAKE_MICHIGAN_OUTLINE[i]
    const [lat2, lng2] = LAKE_MICHIGAN_OUTLINE[i + 1]
    const d = distanceToSegmentKm(lat, lng, lat1, lng1, lat2, lng2)
    if (d < bestDistance) {
      bestDistance = d
      bestIndex = i
    }
  }
  return { index: bestIndex, distanceKm: bestDistance }
}

export function distanceToCoastlineKm(lat: number, lng: number): number {
  return nearestSegment(lat, lng).distanceKm
}

export function isNearCoastline(
  lat: number,
  lng: number,
  maxKm: number = DEFAULT_MAX_COASTLINE_DISTANCE_KM,
): boolean {
  return distanceToCoastlineKm(lat, lng) <= maxKm
}

/**
 * Auto-generates a "facing" bearing (the direction from shore out toward
 * open water) for a point near the coast, by finding the nearest outline
 * segment and rotating its walking direction 90° clockwise. This works
 * because the outline is wound clockwise: walking each segment in its
 * defined order, the lake's interior is consistently on the right-hand
 * side — verified against known spots (e.g. Michigan's west shore, walking
 * north, has the lake to the east/right; Michigan's east shore, walking
 * south on the way back down, has the lake to the west/right).
 *
 * This is a first-order approximation (the local shoreline tangent), not a
 * true survey of how each specific break's beach is oriented — coves,
 * points, and jetties can face meaningfully differently from the smoothed
 * regional shoreline. Good enough as a default; admins can still override
 * it with a manual facing click, and it's exactly the kind of thing worth
 * spot-checking against a map before trusting for a specific real break.
 */
export function estimateFacingDeg(lat: number, lng: number): number {
  const { index } = nearestSegment(lat, lng)
  const [lat1, lng1] = LAKE_MICHIGAN_OUTLINE[index]
  const [lat2, lng2] = LAKE_MICHIGAN_OUTLINE[index + 1]
  const segmentBearing = bearingDeg(lat1, lng1, lat2, lng2)
  return (segmentBearing + 90) % 360
}
