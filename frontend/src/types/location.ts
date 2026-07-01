import type { SurfSpot } from '../data/surfSpots'

export type LocationPin = {
  id: string
  spotId: string
  name: string
  lat: number
  lng: number
  region: string
  windStationId: string
  waveReferenceBuoyId: string
  createdAt: string
}

export function spotToPin(spot: SurfSpot): LocationPin {
  return {
    id: spot.id,
    spotId: spot.id,
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    region: spot.region,
    windStationId: spot.windStationId,
    waveReferenceBuoyId: spot.waveReferenceBuoyId,
    createdAt: new Date().toISOString(),
  }
}

export function formatCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`
}

export function windyEmbedUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    detailLat: String(lat),
    detailLon: String(lng),
    width: '650',
    height: '450',
    zoom: '10',
    level: 'surface',
    overlay: 'wind',
    product: 'ecmwf',
    menu: '',
    message: '',
    marker: '',
    calendar: 'now',
    pressure: '',
    type: 'map',
    location: 'coordinates',
    detail: '',
    metricWind: 'default',
    metricTemp: 'default',
    radarRange: '-1',
  })
  return `https://embed.windy.com/embed2.html?${params.toString()}`
}

function formatValue(value: number | null, unit: string, decimals = 1): string {
  if (value === null) return '—'
  return `${value.toFixed(decimals)} ${unit}`
}

export function formatObservedAt(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export { formatValue }
