import { useState } from 'react'
import { notifyMe } from '../lib/api'

type EmailCaptureProps = {
  spotId: string
  spotName: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

function EmailCapture({ spotId, spotName }: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (status === 'submitting' || status === 'success') return

    setStatus('submitting')
    setError(null)
    try {
      await notifyMe(email, spotId)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <p className="email-capture email-capture--success" role="status">
        We'll let you know when {spotName} lines up.
      </p>
    )
  }

  return (
    <form className="email-capture" onSubmit={handleSubmit}>
      <label htmlFor={`notify-email-${spotId}`} className="email-capture__label">
        Tell me when a session lines up
      </label>
      <div className="email-capture__row">
        <input
          id={`notify-email-${spotId}`}
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="email-capture__input"
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          className="btn btn--primary email-capture__submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Saving…' : 'Notify me'}
        </button>
      </div>
      {error && (
        <p className="email-capture__error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default EmailCapture
