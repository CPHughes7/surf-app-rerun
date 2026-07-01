import type { BuoyDataState } from '../hooks/useBuoyData'
import { formatObservedAt, formatValue } from '../types/location'
import SurfabilityBadge from './SurfabilityBadge'

type NoaaReadingsProps = {
  buoyData: BuoyDataState
  variant?: 'popup' | 'detail'
}

function NoaaReadings({ buoyData, variant = 'popup' }: NoaaReadingsProps) {
  const { conditions, surfability, loading, error } = buoyData
  const gridClass =
    variant === 'detail' ? 'bottom-detail__grid' : 'pin-popup__readings'

  if (loading) {
    return <p className="noaa-readings__status">Loading NOAA station data…</p>
  }

  if (error && !conditions) {
    return <p className="noaa-readings__status noaa-readings__status--error">{error}</p>
  }

  const wind = conditions?.wind ?? null
  const wave = conditions?.wave ?? null

  return (
    <>
      <SurfabilityBadge surfability={surfability} compact={variant === 'popup'} />
      {variant === 'detail' && conditions?.inferenceNote && (
        <p className="noaa-readings__inference">{conditions.inferenceNote}</p>
      )}
      {variant === 'detail' && (
        <p className="surfability-block__summary surfability-block__summary--detail">
          {surfability.summary}
        </p>
      )}

      <section className="noaa-readings__section">
        <h4 className="noaa-readings__section-title">Wind (nearshore)</h4>
        <dl className={gridClass}>
          <div>
            <dt>Station</dt>
            <dd>
              {wind ? `${wind.stationName} (${wind.stationId})` : '—'}
            </dd>
          </div>
          <div>
            <dt>Wind speed</dt>
            <dd>{formatValue(wind?.speedKt ?? null, 'kt', 0)}</dd>
          </div>
          <div>
            <dt>Wind direction</dt>
            <dd>{formatValue(wind?.dirDeg ?? null, '°', 0)}</dd>
          </div>
          {variant === 'detail' && (
            <>
              <div>
                <dt>Wind gust</dt>
                <dd>{formatValue(wind?.gustKt ?? null, 'kt', 0)}</dd>
              </div>
              <div>
                <dt>Distance to break</dt>
                <dd>{wind ? `${wind.distanceKm.toFixed(1)} km` : '—'}</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>{formatObservedAt(wind?.observedAt ?? null)}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <section className="noaa-readings__section">
        <h4 className="noaa-readings__section-title">Waves (offshore reference)</h4>
        <dl className={gridClass}>
          <div>
            <dt>Offshore buoy</dt>
            <dd>
              {wave ? `${wave.stationName} (${wave.stationId})` : 'No buoy in range'}
            </dd>
          </div>
          <div>
            <dt>Wave height</dt>
            <dd>{formatValue(wave?.heightFt ?? null, 'ft')}</dd>
          </div>
          <div>
            <dt>Dominant period</dt>
            <dd>{formatValue(wave?.dominantPeriodS ?? null, 's', 0)}</dd>
          </div>
          {variant === 'detail' && (
            <>
              <div>
                <dt>Avg period</dt>
                <dd>{formatValue(wave?.avgPeriodS ?? null, 's', 1)}</dd>
              </div>
              <div>
                <dt>Wave direction</dt>
                <dd>{formatValue(wave?.meanDirDeg ?? null, '°', 0)}</dd>
              </div>
              <div>
                <dt>Buoy distance</dt>
                <dd>{wave ? `${wave.distanceKm.toFixed(1)} km` : '—'}</dd>
              </div>
              <div>
                <dt>Water temp</dt>
                <dd>{formatValue(wave?.waterTempF ?? null, '°F', 1)}</dd>
              </div>
              <div>
                <dt>Air temp</dt>
                <dd>{formatValue(wave?.airTempF ?? null, '°F', 1)}</dd>
              </div>
              <div>
                <dt>Pressure</dt>
                <dd>{formatValue(wave?.presInHg ?? null, 'inHg', 2)}</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>{formatObservedAt(wave?.observedAt ?? null)}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      {error && conditions && (
        <p className="noaa-readings__status noaa-readings__status--warn">{error}</p>
      )}
    </>
  )
}

export default NoaaReadings
