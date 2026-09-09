# surf-app-rerun

Lake Michigan surf app. The product sells a **decision** — go / marginal / not-today — not a dashboard of raw buoy readings.

For the full architecture map, branch rules, and data rules, see [`CONTEXT.md`](CONTEXT.md).

## What this is

- **Free public layer** (`/`) — 13 curated Lake Michigan breaks on a Leaflet map, each with a decisive verdict fused from live NOAA NDBC data. Email capture ("tell me when a session lines up") tied to a specific spot, plus a distinct pitch for the paid capability below it.
- **Paid-tier MVP** (`/admin`, gated) — create a private spot at *any* coordinate by clicking the map and get a projected verdict there, fused from the nearest allowlisted NOAA stations. Admin-only for now; the data boundary is a real server-side check (`ADMIN_SECRET`), not client-side hiding.
- **Interest dashboard** (`/admin`) — how many people want the free product, and how many specifically want the paid capability. This phase is about measuring that, not building out the paid tier further.

## Architecture

- `frontend/` — React + Vite + Leaflet. Deploys to S3 on push to `main`.
- `backend/` — FastAPI. NOAA proxy (CORS workaround — NDBC sends no `Access-Control-Allow-Origin`), email capture, admin-gated private-spots CRUD. Deploys to Fly.io on push to `main`. Its original location-CRUD endpoints are legacy and unused.

## Development

```bash
# Frontend
cd frontend
npm install
npm run dev          # Vite dev server; proxies /api/ndbc/* to NOAA and /api/* to localhost:8000
npm run test:data    # validate all catalog spots against live NDBC
npm run build         # tsc -b && vite build
npm run lint

# Backend (separate terminal)
cd backend
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt   # first time only
ADMIN_SECRET=<pick-something> ./venv/bin/uvicorn main:app --port 8000
```

Visit `/admin` and enter the same `ADMIN_SECRET` to manage private spots and see the interest dashboard.

See [`frontend/src/docs/MVP_VALIDATION.md`](frontend/src/docs/MVP_VALIDATION.md) for spot/station validation steps and [`frontend/src/docs/NDBC_PIPELINE.md`](frontend/src/docs/NDBC_PIPELINE.md) for the NOAA data pipeline narrative.

## Branching

- **`learn/v1`** — frozen learning snapshot (tag `learn-v1-snapshot`). Reference only, no feature work.
- **`dev/rebuild`** — active development. Fast refactors and experiments welcome.
- **`main`** — production deploy target (S3 + Fly.io). Merge from `dev/rebuild` only when asked to ship.

## Data rules

- **Wind:** nearshore C-MAN / pier / lighthouse stations only (`CHII2`, `MCYI3`, `SVNM4`, `MKGM4`, `MLWW3`, `SGNW3`, `45186`, …)
- **Waves:** allowlisted offshore buoys only (`45168`, `45029`, `45024`, `45026`, `45170`, `45210`, `45214`, …) — open-lake reference, not at the surf line
- **Never** read `WVHT` from nearshore stations (they report `MM`)
- Scoring thresholds are unchanged since the original build and not to be edited casually — see `CONTEXT.md`

## Out of scope (recorded, not lost)

GIS shoreline-buffer gating, the real Windy Point Forecast API (embed only — no key), full meteorological projection (shoaling/refraction/fetch decay), public auth & billing, camera ingestion / CV verdicts, more catalog spots, scoring changes. See [`PARKED.md`](PARKED.md) for a prior paid-tier direction (curated hidden spots) that was built, then deliberately shelved in favor of the current one.
