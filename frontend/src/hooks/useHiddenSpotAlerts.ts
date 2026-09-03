import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchHiddenSpots, type HiddenSpot } from '../lib/hiddenSpots'

const TOKEN_KEY = 'lakesurf.subscriberToken'
const POLL_MS = 15_000

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function useHiddenSpotAlerts() {
  const [token, setTokenState] = useState<string | null>(readStoredToken)
  const [spots, setSpots] = useState<HiddenSpot[]>([])
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const setToken = useCallback((next: string | null) => {
    setTokenState(next)
    try {
      if (next) window.localStorage.setItem(TOKEN_KEY, next)
      else window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      // localStorage unavailable — token still lives in state for this session
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setSpots([])
      setError(null)
      return
    }

    let cancelled = false

    const poll = () => {
      fetchHiddenSpots(token)
        .then((next) => {
          if (cancelled) return
          setSpots(next)
          setError(null)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          if (err instanceof Error && err.message === 'unauthorized') {
            setToken(null)
            return
          }
          setError(err instanceof Error ? err.message : 'Failed to check hidden spots')
        })
    }

    poll()
    timerRef.current = window.setInterval(poll, POLL_MS)

    return () => {
      cancelled = true
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [token, setToken])

  return { token, setToken, spots, error }
}
