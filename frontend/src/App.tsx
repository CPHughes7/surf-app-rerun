import { useCallback, useRef, useState } from 'react'
import LakeMap from './components/LakeMap'
import LeftDrawer from './components/LeftDrawer'
import LocationDetailPanel from './components/LocationDetailPanel'
import NamePinDialog from './components/NamePinDialog'
import type { LocationPin, PendingPin } from './types/location'
import './App.css'

function App() {
  const [pins, setPins] = useState<LocationPin[]>([])
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [detailPin, setDetailPin] = useState<LocationPin | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [detailJustOpened, setDetailJustOpened] = useState(false)
  const bottomPanelRef = useRef<HTMLDivElement>(null)

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
      setSelectedPinId(pin.id)
      setPendingPin(null)
    },
    [pendingPin],
  )

  const handleSelectPin = useCallback((pinId: string) => {
    setSelectedPinId(pinId)
  }, [])

  const handleOpenDetail = useCallback((pin: LocationPin) => {
    setSelectedPinId(pin.id)
    setDetailPin(pin)
    setDetailJustOpened(true)

    requestAnimationFrame(() => {
      bottomPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    window.setTimeout(() => setDetailJustOpened(false), 1200)
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__side app-header__side--left">
          <button
            type="button"
            className="btn btn--ghost drawer-toggle"
            onClick={() => setDrawerOpen((open) => !open)}
            aria-expanded={drawerOpen}
            aria-controls="pins-drawer"
          >
            {drawerOpen ? 'Hide pins' : 'Show pins'}
          </button>
        </div>
        <div className="app-header__center">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">
            Drop a pin on the map, then review NOAA and Windy for that spot.
          </p>
        </div>
        <div className="app-header__side app-header__side--right" aria-hidden="true" />
      </header>

      <div className="app-body">
        <LeftDrawer
          pins={pins}
          selectedPinId={selectedPinId}
          isOpen={drawerOpen}
          onSelectPin={handleSelectPin}
          onClose={() => setDrawerOpen(false)}
        />

        <section className="main-column">
          <div className="map-zone">
            <p className="map-zone__hint">Click the map to drop a named pin</p>
            <LakeMap pins={pins} onMapClick={handleMapClick} onOpenDetail={handleOpenDetail} />
          </div>

          <div className="bottom-panel" ref={bottomPanelRef}>
            {detailPin ? (
              <LocationDetailPanel
                pin={detailPin}
                justOpened={detailJustOpened}
                onClose={() => setDetailPin(null)}
              />
            ) : (
              <div className="bottom-panel__placeholder">
                <p className="bottom-panel__label">Spot detail</p>
                <p>
                  Click a pin on the map, then choose <strong>Open full detail below</strong> in
                  the popup to review conditions here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {pendingPin && (
        <NamePinDialog
          pendingPin={pendingPin}
          onSave={handleSavePin}
          onCancel={() => setPendingPin(null)}
        />
      )}
    </div>
  )
}

export default App
