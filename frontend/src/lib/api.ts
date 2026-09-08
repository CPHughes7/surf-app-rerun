import { getAttribution } from './attribution'

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? ''

export async function notifyMe(email: string, spotId?: string): Promise<void> {
  const attribution = getAttribution()
  const response = await fetch(`${API_BASE_URL}/api/notify-me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      spotId: spotId ?? null,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer,
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? 'Could not save that email — try again')
  }
}
