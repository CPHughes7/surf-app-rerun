import { useCallback, useEffect, useState } from 'react'
import type { SurfSpot } from '../data/surfSpots'
import { bearingDeg, compassLabel, destinationPoint } from '../lib/geo/bearing'
import { DEFAULT_MAX_COASTLINE_DISTANCE_KM, distanceToCoastlineKm, estimateFacingDeg } from '../lib/geo/coastline'
import { resolveAllConditions } from '../lib/conditions/resolveConditions'
import { projectPrivateSpotVerdict, type PrivateSpotVerdict } from '../lib/conditions/projection'
import { verdictCopyFor } from '../lib/verdictCopy'
import {
  createPrivateSpot,
  getNotifyStats,
  listPrivateSpots,
  type NotifyMeStats,
  type PrivateSpot,
} from '../lib/adminApi'
import AdminSpotMap from '../components/AdminSpotMap'

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
  const [stats, setStats] = useState<NotifyMeStats | null>(null)
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
      const [spots, notifyStats] = await Promise.all([listPrivateSpots(secret), getNotifyStats(secret)])
      const conditionsBySpotId = await resolveAllConditions(spots.map(toSurfSpot))
      setEntries(
        spots.map((spot) => ({
          spot,
          verdict: projectPrivateSpotVerdict(conditionsBySpotId.get(spot.id) ?? null, spot.facingDeg),
        })),
      )
      setStats(notifyStats)
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
    // load() sets loading/error before its first await so a re-fetch (e.g.
    // after unlocking with a new secret) shows the loading state again —
    // intentional, not the accidental-cascading-render case this rule guards.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <h1>Admin</h1>
        <button type="button" className="btn btn--ghost" onClick={() => setSecret(null)}>
          Lock
        </button>
      </header>

      <InterestStats stats={stats} />

      <h2 className="admin-page__section-title">Private spots</h2>

      <CreateSpotForm
        secret={secret}
        existingSpots={entries.map((entry) => entry.spot)}
        onCreated={load}
      />

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
                {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)} · facing {compassLabel(spot.facingDeg)} (
                {spot.facingDeg.toFixed(0)}°)
              </p>
              <div className={`verdict-banner verdict-banner--${copy.tone}`}>
                <p className="verdict-banner__eyebrow">
                  Projected verdict · {verdict.confidencePercent}% confidence
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

function InterestStats({ stats }: { stats: NotifyMeStats | null }) {
  if (!stats) return null

  return (
    <section className="admin-stats">
      <div className="admin-stats__headline-row">
        <p className="admin-stats__total">
          <strong>{stats.total}</strong> {stats.total === 1 ? 'person' : 'people'} interested
        </p>
        <p className="admin-stats__total admin-stats__total--secondary">
          <strong>{stats.advancedInterest}</strong> want advanced analysis
        </p>
      </div>

      {stats.locationInterests.length > 0 && (
        <div className="admin-stats__sources">
          <p className="admin-page__section-title admin-page__section-title--small">
            Where people want coverage
          </p>
          <ul className="admin-stats__source-list">
            {stats.locationInterests.map((row) => (
              <li key={row.location} className="admin-stats__source-row">
                <span>{row.location}</span>
                <span className="admin-stats__source-count">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(stats.bySource.length > 0 || stats.recent.length > 0) && (
        <details className="admin-stats__recent">
          <summary>Detail — by channel, most recent</summary>
          {stats.bySource.length > 0 && (
            <ul className="admin-stats__source-list">
              {stats.bySource.map((row) => (
                <li key={row.source} className="admin-stats__source-row">
                  <span>{row.source}</span>
                  <span className="admin-stats__source-count">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
          <ul>
            {stats.recent.map((row) => (
              <li key={`${row.email}-${row.createdAt}`}>
                {row.email}
                {row.spotId ? ` · ${row.spotId}` : ''}
                {row.locationInterest ? ` · wants: ${row.locationInterest}` : ''}
                {row.utmSource ? ` · ${row.utmSource}` : row.referrer ? ` · via ${row.referrer}` : ''}
                {' · '}
                {new Date(row.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

type LatLng = { lat: number; lng: number }

function CreateSpotForm({
  secret,
  existingSpots,
  onCreated,
}: {
  secret: string
  existingSpots: PrivateSpot[]
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [draftLocation, setDraftLocation] = useState<LatLng | null>(null)
  const [draftFacingPoint, setDraftFacingPoint] = useState<LatLng | null>(null)
  const [facingIsAuto, setFacingIsAuto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const facingDeg =
    draftLocation && draftFacingPoint
      ? bearingDeg(draftLocation.lat, draftLocation.lng, draftFacingPoint.lat, draftFacingPoint.lng)
      : null

  const step = !draftLocation ? 'location' : 'ready'

  const handleMapClick = (lat: number, lng: number) => {
    setFormError(null)
    if (step === 'location') {
      const distanceKm = distanceToCoastlineKm(lat, lng)
      if (distanceKm > DEFAULT_MAX_COASTLINE_DISTANCE_KM) {
        setFormError(
          `That's ${distanceKm.toFixed(1)} km from the Lake Michigan shoreline — private spots have to be within ${DEFAULT_MAX_COASTLINE_DISTANCE_KM} km of the coast. Click closer to shore.`,
        )
        return
      }
      // Auto-generate a facing default from the local shoreline direction —
      // reads the same outline the coastline gate uses, rotated to point out
      // toward open water. A synthetic point 5km out in that direction keeps
      // the map's line/marker visualization and the bearing math unchanged;
      // clicking again below overrides it with a real manual facing point.
      const autoFacingDeg = estimateFacingDeg(lat, lng)
      setDraftLocation({ lat, lng })
      setDraftFacingPoint(destinationPoint(lat, lng, autoFacingDeg, 5))
      setFacingIsAuto(true)
    } else {
      // Ready — a click here overrides the facing (auto or previously
      // manual) rather than starting a new spot. Reset pin starts over.
      setDraftFacingPoint({ lat, lng })
      setFacingIsAuto(false)
    }
  }

  const handleReset = () => {
    setDraftLocation(null)
    setDraftFacingPoint(null)
    setFacingIsAuto(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draftLocation || facingDeg === null) return
    setSubmitting(true)
    setFormError(null)
    try {
      await createPrivateSpot(secret, {
        name,
        lat: draftLocation.lat,
        lng: draftLocation.lng,
        facingDeg,
      })
      setName('')
      handleReset()
      onCreated()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create spot')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-create-form" onSubmit={handleSubmit}>
      <p className={formError ? 'admin-create-form__hint admin-create-form__hint--error' : 'admin-create-form__hint'}>
        {formError && formError}
        {!formError && step === 'location' && 'Click the map where the break is.'}
        {!formError &&
          step === 'ready' &&
          (facingIsAuto
            ? `Facing ${compassLabel(facingDeg!)} (${facingDeg!.toFixed(0)}°) — auto-detected from the shoreline. Click the map to correct it, or name it and create it.`
            : `Facing ${compassLabel(facingDeg!)} (${facingDeg!.toFixed(0)}°) — set manually. Click again to adjust, or name it and create it.`)}
      </p>

      <AdminSpotMap
        existingSpots={existingSpots}
        draftLocation={draftLocation}
        draftFacingPoint={draftFacingPoint}
        onMapClick={handleMapClick}
      />

      <div className="admin-create-form__row">
        <label className="admin-create-form__name-label">
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="email-capture__input"
            placeholder="What do you call this spot?"
          />
        </label>
        {draftLocation && (
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            Reset pin
          </button>
        )}
      </div>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={submitting || step !== 'ready' || !name.trim()}
      >
        {submitting ? 'Creating…' : 'Create private spot'}
      </button>
    </form>
  )
}

export default AdminPage
