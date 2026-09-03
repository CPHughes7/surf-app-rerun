const API_BASE_URL = import.meta.env?.VITE_API_URL ?? ''

export async function notifyMe(email: string, spotId?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notify-me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, spotId: spotId ?? null }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? 'Could not save that email — try again')
  }
}
