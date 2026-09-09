import type { CatalogConditionsState } from '../hooks/useCatalogConditions'
import { buoyDataForSpot } from '../hooks/useCatalogConditions'
import type { LocationPin } from '../types/location'
import { formatCoords } from '../types/location'
import AdvancedAnalysisPitch from './AdvancedAnalysisPitch'
import SurfabilityBadge from './SurfabilityBadge'

type LocationsPanelProps = {
  pins: LocationPin[]
  selectedSpotId: string | null
  catalog: CatalogConditionsState
  isOpen: boolean
  onSelectSpot: (spotId: string) => void
  onClose: () => void
}

function LocationsPanel({
  pins,
  selectedSpotId,
  catalog,
  isOpen,
  onSelectSpot,
  onClose,
}: LocationsPanelProps) {
  const regions = [...new Set(pins.map((pin) => pin.region))]

  return (
    <aside
      id="spots-drawer"
      className={isOpen ? 'locations-panel' : 'locations-panel is-closed'}
      aria-label="Surf spots"
      aria-hidden={!isOpen}
    >
      <div className="locations-panel__toolbar">
        <div>
          <p className="locations-panel__label">Surf spots</p>
          <p className="locations-panel__count">
            {catalog.loading ? 'Loading conditions…' : `${pins.length} on Lake Michigan`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost locations-panel__close"
          onClick={onClose}
          aria-label="Hide spots list"
        >
          Hide
        </button>
      </div>

      <nav className="locations-panel__list" aria-label="Catalog spots">
        {regions.map((region) => (
          <div key={region} className="locations-panel__region-group">
            <p className="locations-panel__label">{region}</p>
            <ul>
              {pins
                .filter((pin) => pin.region === region)
                .map((pin) => {
                  const buoyData = buoyDataForSpot(catalog, pin.spotId)
                  return (
                    <li key={pin.id}>
                      <button
                        type="button"
                        className={
                          pin.id === selectedSpotId ? 'pin-list-btn is-active' : 'pin-list-btn'
                        }
                        onClick={() => onSelectSpot(pin.id)}
                        aria-pressed={pin.id === selectedSpotId}
                      >
                        <span className="pin-list-btn__main">
                          <span className="pin-list-btn__name">{pin.name}</span>
                          <span className="pin-list-btn__coords">
                            {formatCoords(pin.lat, pin.lng)}
                          </span>
                        </span>
                        {!catalog.loading && (
                          <SurfabilityBadge surfability={buoyData.surfability} compact />
                        )}
                      </button>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}
      </nav>

      <AdvancedAnalysisPitch />
    </aside>
  )
}

export default LocationsPanel
