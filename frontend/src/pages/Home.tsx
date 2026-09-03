import { useCallback, useMemo, useRef, useState } from 'react'
import LakeMap from '../components/LakeMap'
import LocationDetailPanel from '../components/LocationDetailPanel'
import LocationsPanel from '../components/LocationsPanel'
import { SURF_SPOTS, getSpotById } from '../data/surfSpots'
import { snapToNearestSpot } from '../lib/geo/snapToSpot'
import { buoyDataForSpot, useCatalogConditions } from '../hooks/useCatalogConditions'
import type { LocationPin } from '../types/location'
import { spotToPin } from '../types/location'

function Home() {
  const catalog = useCatalogConditions()
  const pins = useMemo(() => SURF_SPOTS.map(spotToPin), [])

  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [detailPin, setDetailPin] = useState<LocationPin | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 901px)').matches,
  )
  const [popupDismissSignal, setPopupDismissSignal] = useState(0)
  const [mapMessage, setMapMessage] = useState<string | null>(null)
  const messageTimerRef = useRef<number | null>(null)

  const showMapMessage = useCallback((message: string) => {
    setMapMessage(message)
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current)
    messageTimerRef.current = window.setTimeout(() => setMapMessage(null), 4000)
  }, [])

  const selectSpot = useCallback((spotId: string) => {
    const spot = getSpotById(spotId)
    if (!spot) return
    setSelectedSpotId(spot.id)
  }, [])

  const openDetail = useCallback((pin: LocationPin) => {
    setSelectedSpotId(pin.spotId)
    setDetailPin(pin)
    setPopupDismissSignal((signal) => signal + 1)
  }, [])

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      const result = snapToNearestSpot(lat, lng)
      if (result.ok) {
        const pin = spotToPin(result.spot)
        openDetail(pin)
        showMapMessage(`Snapped to ${result.spot.name}`)
      } else if (result.nearestSpot && result.nearestDistanceM !== null) {
        const km = (result.nearestDistanceM / 1000).toFixed(1)
        showMapMessage(
          `Outside surf spots. Nearest is ${result.nearestSpot.name} (${km} km away). Pick from the catalog.`,
        )
      } else {
        showMapMessage('Click closer to a catalog surf spot.')
      }
    },
    [openDetail, showMapMessage],
  )

  const handleSelectSpotFromDrawer = useCallback(
    (spotId: string) => {
      const spot = getSpotById(spotId)
      if (!spot) return
      openDetail(spotToPin(spot))
    },
    [openDetail],
  )

  const handleMarkerClick = useCallback((pin: LocationPin) => {
    selectSpot(pin.spotId)
  }, [selectSpot])

  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__side app-header__side--left">
          <button
            type="button"
            className="btn btn--ghost drawer-toggle"
            onClick={() => {
              setDrawerOpen((open) => {
                const next = !open
                if (next) setPopupDismissSignal((signal) => signal + 1)
                return next
              })
            }}
            aria-expanded={drawerOpen}
            aria-controls="spots-drawer"
          >
            {drawerOpen ? 'Hide spots' : 'Spots'}
          </button>
        </div>
        <div className="app-header__center">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">Live NOAA conditions for Lake Michigan breaks</p>
        </div>
        <div className="app-header__side app-header__side--right" aria-hidden="true" />
      </header>

      <div className="app-body">
        {drawerOpen && (
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Close spots list"
            onClick={handleCloseDrawer}
          />
        )}

        <LocationsPanel
          pins={pins}
          selectedSpotId={selectedSpotId}
          catalog={catalog}
          isOpen={drawerOpen}
          onSelectSpot={handleSelectSpotFromDrawer}
          onClose={handleCloseDrawer}
        />

        <section className="main-column">
          <div className="map-zone">
            <p className="map-zone__hint">
              Click a marker, pick a catalog spot, or snap-click within ~15 km of a break
            </p>
            {mapMessage && (
              <p className="map-zone__message" role="status">
                {mapMessage}
              </p>
            )}
            {catalog.error && (
              <p className="map-zone__message map-zone__message--error" role="alert">
                Could not load NOAA data: {catalog.error}
              </p>
            )}
            <LakeMap
              pins={pins}
              selectedSpotId={selectedSpotId}
              popupDismissSignal={popupDismissSignal}
              catalog={catalog}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              onOpenDetail={openDetail}
            />
          </div>

          {detailPin && (
            <LocationDetailPanel
              pin={detailPin}
              buoyData={buoyDataForSpot(catalog, detailPin.spotId)}
              onClose={() => setDetailPin(null)}
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default Home
