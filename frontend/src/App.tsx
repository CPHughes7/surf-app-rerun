import { useCallback, useState } from 'react'
import LakeMap from './components/LakeMap'
import LocationDetailPanel from './components/LocationDetailPanel'
import NamePinDialog from './components/NamePinDialog'
import type { LocationPin, PendingPin } from './types/location'
import './App.css'

function App() {
  const [pins, setPins] = useState<LocationPin[]>([])
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null)
  const [detailPin, setDetailPin] = useState<LocationPin | null>(null)

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingPin({ lat, lng })
  }, [])

  const handleSavePin = useCallback(
    (name: string) => {
      if (!pendingPin) return
      const pin: LocationPin = {
        id: crypto.randomUUID(),
        name,
        lat: pendingPin.lat,
        lng: pendingPin.lng,
        createdAt: new Date().toISOString(),
      }
      setPins((current) => [...current, pin])
      setPendingPin(null)
    },
    [pendingPin],
  )

  const handleOpenDetail = useCallback((pin: LocationPin) => {
    setDetailPin(pin)
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">
            Click the map to drop a pin, then review NOAA and Windy for that spot.
          </p>
        </div>
        <p className="app-header__meta">
          <span className="label">Session pins</span>
          <span>{pins.length}</span>
          <span className="placeholder-badge">Ephemeral · refresh clears</span>
        </p>
      </header>

      <main className="map-stage">
        <p className="map-stage__hint">Click anywhere on the map to drop a named pin</p>
        <LakeMap pins={pins} onMapClick={handleMapClick} onOpenDetail={handleOpenDetail} />
      </main>

      {pendingPin && (
        <NamePinDialog
          pendingPin={pendingPin}
          onSave={handleSavePin}
          onCancel={() => setPendingPin(null)}
        />
      )}

      {detailPin && (
        <LocationDetailPanel pin={detailPin} onClose={() => setDetailPin(null)} />
      )}
    </div>
  )
}

export default App
