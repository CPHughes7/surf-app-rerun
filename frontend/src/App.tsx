import { useState } from 'react'
import './App.css'

type Decision = 'go' | 'maybe' | 'no-go'

type SurfSpot = {
  id: string
  name: string
  region: string
  latHint: string
  lngHint: string
  mapX: number
  mapY: number
  windKts: number
  windDir: string
  waveFt: number
  periodSec: number
  confidence: 'high' | 'medium' | 'low'
  summary: string
  decision: Decision
  rationale: string
}

const LAST_UPDATED_LABEL = 'Jun 29, 2026 · 1:30 PM CDT'

const SPOTS: SurfSpot[] = [
  {
    id: 'montrose',
    name: 'Montrose',
    region: 'Chicago, IL',
    latHint: '41.97° N',
    lngHint: '87.64° W',
    mapX: 62,
    mapY: 48,
    windKts: 14,
    windDir: 'NE',
    waveFt: 2.1,
    periodSec: 5,
    confidence: 'medium',
    summary: 'Short-period wind swell building onshore. Rideable for longboard if you time the lulls.',
    decision: 'maybe',
    rationale: 'Waves are present but period is short and wind is onshore — worth a look, not a sure thing.',
  },
  {
    id: 'whiting',
    name: 'Whiting Lakefront',
    region: 'Whiting, IN',
    latHint: '41.68° N',
    lngHint: '87.50° W',
    mapX: 78,
    mapY: 58,
    windKts: 18,
    windDir: 'E',
    waveFt: 1.4,
    periodSec: 4,
    confidence: 'low',
    summary: 'Choppy and disorganized. Wind has been onshore for several hours.',
    decision: 'no-go',
    rationale: 'Onshore wind and sub-5s period — conditions likely unsurfable on arrival.',
  },
  {
    id: 'new-buffalo',
    name: 'New.... ',
    region: 'MI (Lake Michigan)',
    latHint: '41.79° N',
    lngHint: '86.74° W',
    mapX: 28,
    mapY: 72,
    windKts: 12,
    windDir: 'NW',
    waveFt: 3.2,
    periodSec: 7,
    confidence: 'high',
    summary: 'Clean side-shore setup with longer-period swell wrapping the point.',
    decision: 'go',
    rationale: 'Best alignment today — offshore-leaning wind and 7s period suggest surfable faces.',
  },
  {
    id: 'sheboygan',
    name: 'Deland Park',
    region: 'Sheboygan, WI',
    latHint: '43.75° N',
    lngHint: '87.69° W',
    mapX: 45,
    mapY: 22,
    windKts: 10,
    windDir: 'W',
    waveFt: 2.8,
    periodSec: 6,
    confidence: 'medium',
    summary: 'Moderate swell with cross-shore wind. Break can be sectiony near the pier.',
    decision: 'maybe',
    rationale: 'Surfable but inconsistent — check the pier side before committing to the drive.',
  },
  {
    id: 'holland',
    name: 'Holland State Park',
    region: 'Holland, MI',
    latHint: '42.77° N',
    lngHint: '86.21° W',
    mapX: 18,
    mapY: 55,
    windKts: 8,
    windDir: 'SW',
    waveFt: 2.4,
    periodSec: 6,
    confidence: 'medium',
    summary: 'Mellow wind swell with light side-offshore. Smaller but cleaner than Chicago spots.',
    decision: 'go',
    rationale: 'Light wind and organized 6s swell — a reliable fallback if closer spots disappoint.',
  },
]

const DECISION_LABELS: Record<Decision, string> = {
  go: 'Go',
  maybe: 'Maybe',
  'no-go': 'No-Go',
}

function App() {
  const [selectedSpotId, setSelectedSpotId] = useState(SPOTS[0].id)
  const selectedSpot = SPOTS.find((spot) => spot.id === selectedSpotId) ?? SPOTS[0]

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <h1>Lake Surf</h1>
          <p className="app-header__tagline">
            One view to decide where to go — less NOAA tab-hopping, clearer go / no-go.
          </p>
        </div>
        <p className="app-header__updated">
          <span className="label">Last updated</span>
          <time dateTime="2026-06-29T13:30">{LAST_UPDATED_LABEL}</time>
          <span className="placeholder-badge">Placeholder data</span>
        </p>
      </header>

      <div className="app-body">
        <aside className="left-drawer" aria-label="Spot conditions">
          <p className="drawer-label">Selected spot</p>
          <h2>{selectedSpot.name}</h2>
          <p className="drawer-region">{selectedSpot.region}</p>
          <p className="drawer-coords">
            {selectedSpot.latHint} · {selectedSpot.lngHint}
          </p>

          <dl className="conditions-grid">
            <div>
              <dt>Wind</dt>
              <dd>
                {selectedSpot.windKts} kt {selectedSpot.windDir}
              </dd>
            </div>
            <div>
              <dt>Waves</dt>
              <dd>{selectedSpot.waveFt} ft</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{selectedSpot.periodSec} s</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd className={`confidence confidence--${selectedSpot.confidence}`}>
                {selectedSpot.confidence}
              </dd>
            </div>
          </dl>

          <p className="drawer-summary">{selectedSpot.summary}</p>

          <nav className="spot-list" aria-label="All spots">
            <p className="drawer-label">All spots</p>
            <ul>
              {SPOTS.map((spot) => (
                <li key={spot.id}>
                  <button
                    type="button"
                    className={spot.id === selectedSpotId ? 'spot-btn is-active' : 'spot-btn'}
                    onClick={() => setSelectedSpotId(spot.id)}
                    aria-pressed={spot.id === selectedSpotId}
                  >
                    <span className="spot-btn__name">{spot.name}</span>
                    <span className={`spot-btn__decision decision--${spot.decision}`}>
                      {DECISION_LABELS[spot.decision]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="map-stage">
          <p className="map-stage__hint">Click a pin to review conditions</p>
          <svg
            className="mock-map"
            viewBox="0 0 100 100"
            role="img"
            aria-label="Lake Michigan surf spots map"
          >
            <defs>
              <linearGradient id="lakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--lake-light)" />
                <stop offset="100%" stopColor="var(--lake-deep)" />
              </linearGradient>
            </defs>

            <rect width="100" height="100" fill="var(--map-land)" rx="4" />
            <path
              d="M 5 15 Q 30 5 55 12 Q 80 8 95 20 L 98 95 Q 60 88 35 92 Q 12 85 5 70 Z"
              fill="url(#lakeGradient)"
              stroke="var(--lake-border)"
              strokeWidth="0.5"
            />
            <text x="42" y="52" className="map-label" textAnchor="middle">
              Lake Michigan
            </text>

            {SPOTS.map((spot) => {
              const isActive = spot.id === selectedSpotId
              return (
                <g key={spot.id}>
                  <circle
                    className={`map-pin-hit ${isActive ? 'is-active' : ''}`}
                    cx={spot.mapX}
                    cy={spot.mapY}
                    r="6"
                    onClick={() => setSelectedSpotId(spot.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${spot.name}, ${DECISION_LABELS[spot.decision]}`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedSpotId(spot.id)
                      }
                    }}
                  />
                  <circle
                    className={`map-pin ${isActive ? 'is-active' : ''} decision--${spot.decision}`}
                    cx={spot.mapX}
                    cy={spot.mapY}
                    r="3"
                    pointerEvents="none"
                  />
                  <text
                    x={spot.mapX}
                    y={spot.mapY - 5}
                    className={`map-pin-label ${isActive ? 'is-active' : ''}`}
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {spot.name.split(' ')[0]}
                  </text>
                </g>
              )
            })}
          </svg>
        </main>
      </div>

      <footer className="bottom-decision-bar" aria-live="polite">
        <div className={`decision-badge decision--${selectedSpot.decision}`}>
          {DECISION_LABELS[selectedSpot.decision]}
        </div>
        <div className="decision-copy">
          <p className="decision-copy__spot">{selectedSpot.name}</p>
          <p className="decision-copy__rationale">{selectedSpot.rationale}</p>
        </div>
      </footer>
    </div>
  )
}

export default App
