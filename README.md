# surf-app-rerun

Lake surf map prototype — catalog spots on Lake Michigan with live NOAA buoy data and Windy forecast context.

## What this is

A single-page workflow for reviewing surf conditions at curated Lake Michigan breaks:

1. Open the app — Leaflet map centered on Lake Michigan with catalog surf spots.
2. Select a spot — from the map marker, drawer list, or snap-click within ~15 km of a break.
3. Review conditions — popup and detail panel show live NOAA NDBC buoy readings.
4. Windy embed — forecast map for the same coordinates.

Selection is restricted to the curated spot catalog (no arbitrary offshore pins). Session state clears on refresh.

## In scope

- Leaflet + OSM map with 13 Lake Michigan catalog spots
- Catalog-only spot selection with map snap gating
- Live NOAA NDBC buoy fetch (wave, wind, period)
- Explainable surfability scoring with confidence badges
- Windy embed for forecast context
- Frontend-only architecture

## Out of scope (phase 2)

- GIS shoreline-buffer auto gating
- Windy Point Forecast API (embed only for now)
- Production NOAA proxy (dev uses Vite proxy; set `VITE_NDBC_URL` when ready)
- Authentication

## Development

```bash
cd frontend
npm install
npm run dev          # NOAA live data via Vite proxy (/api/ndbc/latest_obs.txt)
npm run test:data   # validate station mapping against live NDBC (direct, Node)
```

Live NOAA fetches work in **local dev** through the Vite proxy. The deployed S3 build still needs a production proxy (`VITE_NDBC_URL`) — not wired yet.

See [frontend/src/docs/MVP_VALIDATION.md](frontend/src/docs/MVP_VALIDATION.md) for validation steps.

## Branching

- **`learn/v1`** — frozen learning snapshot (tag: `learn-v1-snapshot`); reference only, no feature work
- **`dev/rebuild`** — active agent-driven development; large refactors and experiments welcome
- **`main`** — production deploy target; merge from `dev/rebuild` when ready to ship

## Data model

- **Wind:** nearshore C-MAN / pier stations (`CHII2`, `MCYI3`, `SVNM4`, etc.)
- **Waves:** offshore buoy allowlist only (`45168`, `45029`, `45024`, etc.) — open-lake reference, not at surf line
