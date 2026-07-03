import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createLocation,
  deleteLocation,
  getLocations,
  locationDtoToPin,
  updateLocation,
} from '../api/locations'
import LakeMap from '../components/LakeMap'
import LocationsPanel, { type LocationsPanelView } from '../components/LocationsPanel'
import type { LocationPin } from '../types/location'

function Home() {
  const [pins, setPins] = useState<LocationPin[]>([])
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelView, setPanelView] = useState<LocationsPanelView>('list')
  const [popupDismissSignal, setPopupDismissSignal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingLocation, setPendingLocation] = useState<[number, number] | null>(null)
  const [newSpotName, setNewSpotName] = useState('')
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editLat, setEditLat] = useState('')
  const [editLng, setEditLng] = useState('')

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

  const handleMarkerClick = useCallback((pin: LocationPin) => {
    setSelectedSpotId(pin.id)
    setPanelOpen(false)
  }, [])

  const openInLocationsPanel = useCallback((pin: LocationPin) => {
    setSelectedSpotId(pin.id)
    setPanelOpen(true)
    setPanelView('detail')
    setPopupDismissSignal((signal) => signal + 1)
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedSpotId(null)
    setPanelView('list')
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingLocation([lat, lng])
    setNewSpotName('')
    setPanelOpen(false)
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
        openInLocationsPanel(pin)
        setNewSpotName('')
        setPendingLocation(null)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Unable to create location.')
      }
    },
    [newSpotName, pendingLocation, openInLocationsPanel],
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
        setEditingSpotId(null)
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Unable to update location.')
      }
    },
    [editLat, editLng, editName],
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
          setPanelView('list')
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
            onClick={() => {
              setPanelOpen((open) => {
                const next = !open
                if (next) setPopupDismissSignal((signal) => signal + 1)
                return next
              })
            }}
            aria-expanded={panelOpen}
            aria-controls="locations-panel"
          >
            {panelOpen ? 'Hide Locations' : 'Locations'}
          </button>
        </div>
        <div className="app-header__center">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">
            Manage locations and review NOAA readings with Windy forecast.
          </p>
        </div>
        <div className="app-header__side app-header__side--right" aria-hidden="true" />
      </header>

      {loading && <p role="status">Loading locations…</p>}
      {error && <p role="alert">Could not load locations: {error}</p>}
      {actionError && <p role="alert">Location action failed: {actionError}</p>}

      <div className="app-body">
        <LocationsPanel
          pins={pins}
          selectedSpotId={selectedSpotId}
          selectedPin={selectedPin}
          view={panelView}
          isOpen={panelOpen}
          onSelectSpot={(spotId) => {
            const pin = pins.find((p) => p.id === spotId)
            if (pin) openInLocationsPanel(pin)
          }}
          onBackToList={handleBackToList}
          onClose={() => setPanelOpen(false)}
        />

        <section className="main-column main-column--map-only">
          <div className="map-zone">
            <p className="map-zone__hint">
              Click the map to add a location, or select a marker for a quick NOAA and Windy view.
            </p>
            <LakeMap
              pins={pins}
              selectedSpotId={selectedSpotId}
              popupDismissSignal={popupDismissSignal}
              pendingLocation={pendingLocation}
              newSpotName={newSpotName}
              editingSpotId={editingSpotId}
              editName={editName}
              editLat={editLat}
              editLng={editLng}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              onOpenDetail={openInLocationsPanel}
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
        </section>
      </div>
    </div>
  )
}

export default Home
