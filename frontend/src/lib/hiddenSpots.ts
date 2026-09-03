const API_BASE_URL = import.meta.env?.VITE_API_URL ?? ''

export type HiddenSpot = {
  id: string
  name: string
  lat: number
  lng: number
  region: string
  isFiring: boolean
  firingAt: string | null
}

export async function subscribe(email: string): Promise<{ token: string; email: string }> {
  const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? 'Could not subscribe — try again')
  }

  return response.json()
}

export async function fetchHiddenSpots(token: string): Promise<HiddenSpot[]> {
  const response = await fetch(`${API_BASE_URL}/api/hidden-spots`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    throw new Error('unauthorized')
  }
  if (!response.ok) {
    throw new Error('Could not load hidden spots')
  }

  return response.json()
}
