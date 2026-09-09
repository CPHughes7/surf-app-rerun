import { useState } from 'react'
import { notifyMe } from '../lib/api'

const ADVANCED_INTEREST_SPOT_ID = 'advanced-analysis'

type Status = 'idle' | 'submitting' | 'success' | 'error'

function AdvancedAnalysisPitch() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (status === 'submitting' || status === 'success') return

    setStatus('submitting')
    setError(null)
    try {
      await notifyMe(email, ADVANCED_INTEREST_SPOT_ID)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <section className="advanced-pitch advanced-pitch--success" role="status">
        <p>You're on the list — we'll reach out when it opens up.</p>
      </section>
    )
  }

  return (
    <section className="advanced-pitch">
      <p className="advanced-pitch__eyebrow">Coming soon</p>
      <h3 className="advanced-pitch__headline">Point anywhere on the lake. Get a real verdict.</h3>
      <p className="advanced-pitch__body">
        Not just these 13 spots — any coordinate, fused into a real go / marginal / not-today call.
      </p>
      <form className="advanced-pitch__form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="email-capture__input"
          disabled={status === 'submitting'}
          aria-label="Email for advanced analysis early access"
        />
        <button type="submit" className="btn btn--primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Saving…' : 'Get early access'}
        </button>
      </form>
      {error && (
        <p className="email-capture__error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

export default AdvancedAnalysisPitch
