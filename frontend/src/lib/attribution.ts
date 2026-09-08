export type Attribution = {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  referrer: string | null
}

const EMPTY_ATTRIBUTION: Attribution = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  referrer: null,
}

const STORAGE_KEY = 'lakesurf.attribution'

/**
 * First-touch attribution for this browser session: if this page load has
 * utm_* params, that wins and overwrites whatever was stored. Otherwise,
 * only fill in the referrer, and only if nothing is stored yet — so a
 * visitor who arrived via a campaign link and later browses around
 * (no utm params on those loads) keeps their original channel credit.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')

  if (utmSource || utmMedium || utmCampaign) {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ utmSource, utmMedium, utmCampaign, referrer: document.referrer || null }),
      )
    } catch {
      // sessionStorage unavailable — attribution just won't be captured this visit
    }
    return
  }

  try {
    if (!window.sessionStorage.getItem(STORAGE_KEY) && document.referrer) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...EMPTY_ATTRIBUTION, referrer: document.referrer }))
    }
  } catch {
    // ignore
  }
}

export function getAttribution(): Attribution {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (raw) return { ...EMPTY_ATTRIBUTION, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return EMPTY_ATTRIBUTION
}
