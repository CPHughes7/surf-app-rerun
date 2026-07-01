import { useCallback, useMemo, useRef, useState } from 'react'
import { SURF_SPOTS } from '../data/surfSpots'
import { getSpotById } from '../data/surfSpots'
import { snapToNearestSpot } from '../lib/geo/snapToSpot'
import LakeMap from '../components/LakeMap'
import LeftDrawer from '../components/LeftDrawer'
import LocationDetailPanel from '../components/LocationDetailPanel'
import type { LocationPin } from '../types/location'
import { spotToPin } from '../types/location'

function Devv1 () {

  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [detailPin, setDetailPin] = useState<LocationPin | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [detailJustOpened, setDetailJustOpened] = useState(false)
  const [mapMessage, setMapMessage] = useState<string | null>(null)
  const bottomPanelRef = useRef<HTMLDivElement>(null)
  const messageTimerRef = useRef<number | null>(null)

  const selectedPin = useMemo(() => {
    if (!selectedSpotId) return null
    const spot = getSpotById(selectedSpotId)
    return spot ? spotToPin(spot) : null
  }, [selectedSpotId])

  const showMapMessage = useCallback((message: string) => {
    setMapMessage(message)
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current)
    messageTimerRef.current = window.setTimeout(() => setMapMessage(null), 4000)
  }, [])

  const selectSpot = useCallback((spotId: string) => {
    const spot = getSpotById(spotId)
    if (!spot) return
    setSelectedSpotId(spot.id)
    setDetailPin(spotToPin(spot))
  }, [])

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      const result = snapToNearestSpot(lat, lng)
      if (result.ok) {
        selectSpot(result.spot.id)
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
    [selectSpot, showMapMessage],
  )

  const handleSelectSpotFromDrawer = useCallback(
    (spotId: string) => {
      selectSpot(spotId)
    },
    [selectSpot],
  )

  const handleSelectSpotFromMap = useCallback(
    (pin: LocationPin) => {
      selectSpot(pin.spotId)
    },
    [selectSpot],
  )

  const handleOpenDetail = useCallback((pin: LocationPin) => {
    setSelectedSpotId(pin.spotId)
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
            {drawerOpen ? 'Hide spots' : 'Show spots'}
          </button>
        </div>
        <div className="app-header__center">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">
            Select a Lake Michigan surf spot, then review live NOAA buoy data and Windy forecast.
          </p>
        </div>
        <div className="app-header__side app-header__side--right" aria-hidden="true" />
      </header>

      <div className="app-body">
        <LeftDrawer
          spots={SURF_SPOTS}
          selectedSpotId={selectedSpotId}
          selectedPin={selectedPin}
          isOpen={drawerOpen}
          onSelectSpot={handleSelectSpotFromDrawer}
          onClose={() => setDrawerOpen(false)}
        />

        <section className="main-column">
          <div className="map-zone">
            <p className="map-zone__hint">
              Click a spot marker or snap-click within ~15 km of a catalog break
            </p>
            {mapMessage && (
              <p className="map-zone__message" role="status">
                {mapMessage}
              </p>
            )}
            <LakeMap
              selectedSpotId={selectedSpotId}
              onMapClick={handleMapClick}
              onSelectSpot={handleSelectSpotFromMap}
              onOpenDetail={handleOpenDetail}
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
                  Select a catalog spot on the map or in the drawer to load NOAA buoy readings and
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

export default Devv1