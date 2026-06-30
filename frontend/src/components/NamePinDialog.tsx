import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { PendingPin } from '../types/location'
import { formatCoords } from '../types/location'

type NamePinDialogProps = {
  pendingPin: PendingPin
  onSave: (name: string) => void
  onCancel: () => void
}

function NamePinDialog({ pendingPin, onSave, onCancel }: NamePinDialogProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <div className="name-pin-overlay" role="presentation" onClick={onCancel}>
      <div
        className="name-pin-dialog"
        role="dialog"
        aria-labelledby="name-pin-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="name-pin-title">Name this spot</h2>
        <p className="name-pin-dialog__coords">
          {formatCoords(pendingPin.lat, pendingPin.lng)}
        </p>
        <form onSubmit={handleSubmit}>
          <label className="name-pin-dialog__label" htmlFor="pin-name">
            Spot name
          </label>
          <input
            ref={inputRef}
            id="pin-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Montrose"
            maxLength={60}
          />
          <div className="name-pin-dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
              Drop pin
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NamePinDialog
