import { useCallback, useEffect, useState } from 'react'
import type { SurfSpot } from '../data/surfSpots'
import { resolveAllConditions } from '../lib/conditions/resolveConditions'
import { projectPrivateSpotVerdict, type PrivateSpotVerdict } from '../lib/conditions/projection'
import { verdictCopyFor } from '../lib/verdictCopy'
import { qualityLabel } from '../lib/surfability'
import {
  createPrivateSpot,
  listPrivateSpots,
  type PrivateSpot,
} from '../lib/adminApi'

const SECRET_KEY = 'lakesurf.adminSecret'

function readStoredSecret(): string | null {
  try {
    return window.localStorage.getItem(SECRET_KEY)
  } catch {
    return null
  }
}

function toSurfSpot(spot: PrivateSpot): SurfSpot {
  return {
    id: spot.id,
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    region: 'Private',
    windStationId: '',
    waveReferenceBuoyId: '',
  }
}

type SpotEntry = { spot: PrivateSpot; verdict: PrivateSpotVerdict }

function AdminPage() {
  const [secret, setSecretState] = useState<string | null>(readStoredSecret)
  const [secretInput, setSecretInput] = useState('')
  const [entries, setEntries] = useState<SpotEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setSecret = useCallback((next: string | null) => {
    setSecretState(next)
    try {
      if (next) window.localStorage.setItem(SECRET_KEY, next)
      else window.localStorage.removeItem(SECRET_KEY)
    } catch {
      // localStorage unavailable — secret still lives in state for this session
    }
  }, [])

  const load = useCallback(async () => {
    if (!secret) return
    setLoading(true)
    setError(null)
    try {
      const spots = await listPrivateSpots(secret)
      const conditionsBySpotId = await resolveAllConditions(spots.map(toSurfSpot))
      setEntries(
        spots.map((spot) => ({
          spot,
          verdict: projectPrivateSpotVerdict(conditionsBySpotId.get(spot.id) ?? null, spot.facingDeg),
        })),
      )
    } catch (err) {
      if (err instanceof Error && err.message === 'unauthorized') {
        setSecret(null)
        setError('That admin secret was rejected.')
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to load private spots')
    } finally {
      setLoading(false)
    }
  }, [secret, setSecret])

  useEffect(() => {
    load()
  }, [load])

  if (!secret) {
    return (
      <div className="admin-page">
        <h1>Admin</h1>
        <p className="admin-page__pitch">Enter the admin secret to manage private spots.</p>
        <form
          className="admin-secret-form"
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = secretInput.trim()
            if (!trimmed) return
            setError(null)
            setSecretInput('')
            setSecret(trimmed)
          }}
        >
          <input
            type="password"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value)}
            placeholder="Admin secret"
            className="email-capture__input"
            aria-label="Admin secret"
          />
          <button type="submit" className="btn btn--primary">
            Unlock
          </button>
        </form>
        {error && (
          <p className="email-capture__error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1>Private spots</h1>
        <button type="button" className="btn btn--ghost" onClick={() => setSecret(null)}>
          Lock
        </button>
      </header>

      <CreateSpotForm secret={secret} onCreated={load} />

      {loading && <p className="admin-page__status">Loading…</p>}
      {error && (
        <p className="email-capture__error" role="alert">
          {error}
        </p>
      )}
      {!loading && entries.length === 0 && !error && (
        <p className="admin-page__status">No private spots yet — create one above.</p>
      )}

      <ul className="admin-spot-list">
        {entries.map(({ spot, verdict }) => {
          const copy = verdictCopyFor(verdict.overall)
          return (
            <li key={spot.id} className="admin-spot-card">
              <h3>{spot.name}</h3>
              <p className="admin-spot-card__coords">
                {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)} · facing {spot.facingDeg.toFixed(0)}°
              </p>
              <div className={`verdict-banner verdict-banner--${copy.tone}`}>
                <p className="verdict-banner__eyebrow">
                  Projected verdict · {qualityLabel(verdict.confidence)}
                </p>
                <h4 className="verdict-banner__headline">{copy.headline}</h4>
                <p className="verdict-banner__summary">{verdict.summary}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CreateSpotForm({ secret, onCreated }: { secret: string; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [facingDeg, setFacingDeg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      await createPrivateSpot(secret, {
        name,
        lat: Number.parseFloat(lat),
        lng: Number.parseFloat(lng),
        facingDeg: Number.parseFloat(facingDeg),
      })
      setName('')
      setLat('')
      setLng('')
      setFacingDeg('')
      onCreated()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create spot')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-create-form" onSubmit={handleSubmit}>
      <div className="admin-create-form__row">
        <label>
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="email-capture__input"
          />
        </label>
        <label>
          Latitude
          <input
            type="number"
            step="any"
            required
            min={-90}
            max={90}
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            className="email-capture__input"
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            step="any"
            required
            min={-180}
            max={180}
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            className="email-capture__input"
          />
        </label>
        <label>
          Facing (° from N, toward water)
          <input
            type="number"
            step="any"
            required
            min={0}
            max={359}
            value={facingDeg}
            onChange={(event) => setFacingDeg(event.target.value)}
            className="email-capture__input"
          />
        </label>
      </div>
      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create private spot'}
      </button>
      {formError && (
        <p className="email-capture__error" role="alert">
          {formError}
        </p>
      )}
    </form>
  )
}

export default AdminPage
