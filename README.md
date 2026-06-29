# surf-app

Great Lakes surf conditions — a static frontend prototype.

## The one workflow

1. **Home** — see spots on a lake map and ranked list
2. **Select a spot** — tap a marker or list item
3. **Spot Detail** — read conditions and a plain-language recommendation
4. **Back** — return to Home

Everything is hardcoded mock data. No backend, no auth, no live NOAA feeds.

## Design context (not in the app yet)

The app currently serves one baseline recommendation per spot. These user stories guide future direction:

- **Ron** — veteran with a tight schedule; wants a quick, reliable call after work
- **James** — dedicated surfer chasing the biggest swell on the lake
- **Calvin** — intermediate learner who prefers clean, moderate conditions and exploring new spots

Persona-specific recommendations may come later. For now, personas live in [frontend/src/data/personas.ts](frontend/src/data/personas.ts) as design reference only.

## Development

```bash
cd frontend
npm install
npm run dev
```
