import { SURF_SPOTS } from '../data/surfSpots'
import type { LocationPin } from '../types/location'
import type { SurfSpot } from '../data/surfSpots'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export type LocationDto = {
  id: number
  name: string
  latitude: number
  longitude: number
}

export type LocationInput = {
  name: string
  latitude: number
  longitude: number
}

function matchCatalogSpot(dto: LocationDto) {
  return SURF_SPOTS.find(
    (spot) =>
      spot.name === dto.name ||
      (Math.abs(spot.lat - dto.latitude) < 0.02 &&
        Math.abs(spot.lng - dto.longitude) < 0.02),
  )
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`)
  }
  return response.json() as Promise<T>
}

export function locationDtoToPin(dto: LocationDto): LocationPin {
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

export function locationDtoToSurfSpot(dto: LocationDto): SurfSpot {
  const pin = locationDtoToPin(dto)
  return {
    id: pin.spotId,
    name: pin.name,
    lat: pin.lat,
    lng: pin.lng,
    region: pin.region,
    windStationId: pin.windStationId,
    waveReferenceBuoyId: pin.waveReferenceBuoyId,
  }
}

export async function getLocations(): Promise<LocationDto[]> {
  return requestJson<LocationDto[]>('/api/locations')
}

export async function createLocation(input: LocationInput): Promise<LocationDto> {
  return requestJson<LocationDto>('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function updateLocation(id: number, input: LocationInput): Promise<LocationDto> {
  return requestJson<LocationDto>(`/api/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function deleteLocation(id: number): Promise<{ deleted: boolean }> {
  return requestJson<{ deleted: boolean }>(`/api/locations/${id}`, {
    method: 'DELETE',
  })
}
