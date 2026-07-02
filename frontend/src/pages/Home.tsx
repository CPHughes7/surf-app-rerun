import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  createLocation,
  deleteLocation,
  getLocations,
  locationDtoToPin,
  updateLocation,
} from '../api/locations'
import LakeMap from '../components/LakeMap'
import LeftDrawer from '../components/LeftDrawer'
import LocationDetailPanel from '../components/LocationDetailPanel'
import type { LocationPin } from '../types/location'

function Home() {
  const [pins, setPins] = useState<LocationPin[]>([])
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [detailPin, setDetailPin] = useState<LocationPin | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [detailJustOpened, setDetailJustOpened] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingLocation, setPendingLocation] = useState<[number, number] | null>(null)
  const [newSpotName, setNewSpotName] = useState('')
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editLat, setEditLat] = useState('')
  const [editLng, setEditLng] = useState('')
  const bottomPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    async function loadLocations() {
      try {
        setLoading(true)
        setError(null)
        const locations = await getLocations()
        if (!active) return
        setPins(locations.map(locationDtoToPin))
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load locations.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadLocations()
    return () => {
      active = false
    }
  }, [])

  const selectedPin = useMemo(
    () => pins.find((pin) => pin.id === selectedSpotId) ?? null,
    [pins, selectedSpotId],
  )

  const selectPin = useCallback((pin: LocationPin) => {
    setSelectedSpotId(pin.id)
    setDetailPin(pin)
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingLocation([lat, lng])
    setNewSpotName('')
  }, [])

  const handleOpenDetail = useCallback((pin: LocationPin) => {
    setSelectedSpotId(pin.id)
    setDetailPin(pin)
    setDetailJustOpened(true)
    requestAnimationFrame(() => {
      bottomPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    window.setTimeout(() => setDetailJustOpened(false), 1200)
  }, [])

  const handleAddSpot = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!pendingLocation || newSpotName.trim() === '') return

      try {
        setActionError(null)
        const created = await createLocation({
          name: newSpotName.trim(),
          latitude: pendingLocation[0],
          longitude: pendingLocation[1],
        })
        const pin = locationDtoToPin(created)
        setPins((current) => [...current, pin])
        selectPin(pin)
        setNewSpotName('')
        setPendingLocation(null)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Unable to create location.')
      }
    },
    [newSpotName, pendingLocation, selectPin],
  )

  const handleEdit = useCallback((pin: LocationPin) => {
    setEditingSpotId(pin.id)
    setEditName(pin.name)
    setEditLat(String(pin.lat))
    setEditLng(String(pin.lng))
  }, [])

  const handleSaveEdit = useCallback(
    async (event: FormEvent<HTMLFormElement>, pinId: string) => {
      event.preventDefault()
      const lat = Number(editLat)
      const lng = Number(editLng)
      if (editName.trim() === '' || Number.isNaN(lat) || Number.isNaN(lng)) return

      try {
        const id = Number(pinId)
        if (Number.isNaN(id)) throw new Error(`Invalid location id: ${pinId}`)
        setActionError(null)
        const updated = await updateLocation(id, {
          name: editName.trim(),
          latitude: lat,
          longitude: lng,
        })
        const pin = locationDtoToPin(updated)
        setPins((current) => current.map((p) => (p.id === pinId ? pin : p)))
        if (selectedSpotId === pinId) {
          setDetailPin(pin)
        }
        setEditingSpotId(null)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Unable to update location.')
      }
    },
    [editLat, editLng, editName, selectedSpotId],
  )

  const handleDelete = useCallback(
    async (pinId: string) => {
      try {
        const id = Number(pinId)
        if (Number.isNaN(id)) throw new Error(`Invalid location id: ${pinId}`)
        setActionError(null)
        await deleteLocation(id)
        setPins((current) => current.filter((pin) => pin.id !== pinId))
        if (selectedSpotId === pinId) {
          setSelectedSpotId(null)
          setDetailPin(null)
        }
        setEditingSpotId(null)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Unable to delete location.')
      }
    },
    [selectedSpotId],
  )

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
            {drawerOpen ? 'Hide spots' : 'Show spots'}
          </button>
        </div>
        <div className="app-header__center">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">
            Add and manage surf locations, then review NOAA readings and Windy forecast.
          </p>
        </div>
        <div className="app-header__side app-header__side--right" aria-hidden="true" />
      </header>

      {loading && <p role="status">Loading locations…</p>}
      {error && <p role="alert">Could not load locations: {error}</p>}
      {actionError && <p role="alert">Location action failed: {actionError}</p>}

      <div className="app-body">
        <LeftDrawer
          pins={pins}
          selectedSpotId={selectedSpotId}
          selectedPin={selectedPin}
          isOpen={drawerOpen}
          onSelectSpot={(spotId) => {
            const pin = pins.find((p) => p.id === spotId)
            if (pin) selectPin(pin)
          }}
          onClose={() => setDrawerOpen(false)}
        />

        <section className="main-column">
          <div className="map-zone">
            <p className="map-zone__hint">
              Click the map to add a location anywhere, or select a marker for NOAA + Windy detail.
            </p>
            <LakeMap
              pins={pins}
              selectedSpotId={selectedSpotId}
              pendingLocation={pendingLocation}
              newSpotName={newSpotName}
              editingSpotId={editingSpotId}
              editName={editName}
              editLat={editLat}
              editLng={editLng}
              onMapClick={handleMapClick}
              onSelectSpot={selectPin}
              onOpenDetail={handleOpenDetail}
              onNewSpotNameChange={setNewSpotName}
              onAddSpot={handleAddSpot}
              onCancelAdd={() => setPendingLocation(null)}
              onEdit={handleEdit}
              onDelete={(pinId) => void handleDelete(pinId)}
              onEditNameChange={setEditName}
              onEditLatChange={setEditLat}
              onEditLngChange={setEditLng}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditingSpotId(null)}
            />
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
                  Select a location on the map or in the drawer to load NOAA buoy readings and
                  Windy forecast below.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
