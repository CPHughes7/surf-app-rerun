/** Compass bearing (0-360, clockwise from true north) from point A to point B. */
export function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLambda = toRad(lng2 - lng1)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  const theta = Math.atan2(y, x)
  return (toDeg(theta) + 360) % 360
}

const EARTH_RADIUS_KM = 6371

/** Destination point given a start, a bearing (deg), and a distance (km) — great-circle. */
export function destinationPoint(
  lat: number,
  lng: number,
  bearing: number,
  distanceKm: number,
): { lat: number; lng: number } {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const delta = distanceKm / EARTH_RADIUS_KM
  const theta = toRad(bearing)
  const phi1 = toRad(lat)
  const lambda1 = toRad(lng)

  const phi2 = Math.asin(Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta))
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2),
    )

  return { lat: toDeg(phi2), lng: toDeg(lambda2) }
}

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
]

/** Human-readable 16-point compass label for a bearing in degrees. */
export function compassLabel(deg: number): string {
  const index = Math.round(((deg % 360) / 360) * 16) % 16
  return COMPASS_POINTS[index]
}
