import { useState } from 'react'
import { useHiddenSpotAlerts } from '../hooks/useHiddenSpotAlerts'
import { subscribe } from '../lib/hiddenSpots'

function HiddenSpotsPanel() {
  const { token, setToken, spots, error } = useHiddenSpotAlerts()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  if (!token) {
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()
      if (submitting) return
      setSubmitting(true)
      setSubscribeError(null)
      try {
        const result = await subscribe(email)
        setToken(result.token)
      } catch (err) {
        setSubscribeError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <section className="hidden-spots">
        <p className="hidden-spots__label">Hidden breaks</p>
        <p className="hidden-spots__pitch">
          Subscribe for a proactive alert when a break the free map doesn't show is firing.
        </p>
        <form className="hidden-spots__form" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            className="email-capture__input"
            aria-label="Email for hidden break alerts"
          />
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Subscribing…' : 'Get access'}
          </button>
        </form>
        {subscribeError && (
          <p className="email-capture__error" role="alert">
            {subscribeError}
          </p>
        )}
      </section>
    )
  }

  const firing = spots.filter((spot) => spot.isFiring)

  return (
    <section className="hidden-spots">
      <p className="hidden-spots__label">Hidden breaks</p>
      {firing.length > 0 ? (
        <ul className="hidden-spots__alerts">
          {firing.map((spot) => (
            <li key={spot.id} className="hidden-spots__alert">
              {spot.name} is firing — go.
            </li>
          ))}
        </ul>
      ) : (
        <p className="hidden-spots__quiet">
          {spots.length > 0
            ? `Watching ${spots.length} hidden break${spots.length === 1 ? '' : 's'} — nothing firing right now.`
            : 'Checking hidden breaks…'}
        </p>
      )}
      {error && (
        <p className="email-capture__error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

export default HiddenSpotsPanel
