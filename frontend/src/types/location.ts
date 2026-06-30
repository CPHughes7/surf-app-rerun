export type LocationPin = {
  id: string
  name: string
  lat: number
  lng: number
  createdAt: string
}

export type PendingPin = {
  lat: number
  lng: number
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
