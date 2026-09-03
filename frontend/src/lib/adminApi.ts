const API_BASE_URL = import.meta.env?.VITE_API_URL ?? ''

export type PrivateSpot = {
  id: string
  name: string
  lat: number
  lng: number
  facingDeg: number
  createdAt: string
}

async function adminFetch(path: string, secret: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'X-Admin-Secret': secret,
    },
  })
}

export async function listPrivateSpots(secret: string): Promise<PrivateSpot[]> {
  const response = await adminFetch('/api/private-spots', secret)
  if (response.status === 401) throw new Error('unauthorized')
  if (!response.ok) throw new Error('Could not load private spots')
  return response.json()
}

export type CreatePrivateSpotInput = {
  name: string
  lat: number
  lng: number
  facingDeg: number
}

export async function createPrivateSpot(
  secret: string,
  input: CreatePrivateSpotInput,
): Promise<PrivateSpot> {
  const response = await adminFetch('/api/private-spots', secret, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (response.status === 401) throw new Error('unauthorized')
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? 'Could not create spot')
  }
  return response.json()
}
