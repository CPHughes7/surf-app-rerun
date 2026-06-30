# surf-app-rerun

Lake surf map prototype — front-end only, ephemeral session pins on a real map.

## What this is

A single-page workflow for dropping and reviewing surf spots on Lake Michigan:

1. Open the app — Leaflet map centered on Lake Michigan with OpenStreetMap tiles.
2. Click the map — name a spot and drop a pin (session only).
3. Click any pin — popup shows NOAA placeholder first, Windy iframe second.
4. Click **Open** — generic detail panel slides in on the same page (no new routes).

All pin data lives in React state and clears on refresh. No backend, no database, no local storage.

## In scope

- Leaflet + OSM map
- Click-to-drop named pins (ephemeral)
- Pin popups with NOAA placeholder + Windy embed
- Generic in-page detail panel fed by location state
- Frontend-only architecture

## Out of scope (for now)

- NOAA live API fetch
- Backend or persistent storage
- Authentication
- Route-based detail pages
- Nearest-buoy lookup logic

## Development

```bash
cd frontend
npm install
npm run dev
```
