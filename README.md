# surf-app-rerun

Lake surf decision prototype — a single-page, front-end-only experience for choosing where to go based on simplified conditions.

## What this is

A static MVP that visualizes one workflow:

1. Land on a home view with a left drawer, center map, and bottom decision bar.
2. Select a surf spot on the mock map (or from the spot list).
3. Review placeholder conditions in the drawer.
4. Read a Go / Maybe / No-Go signal and rationale in the bottom bar.

All data is hardcoded placeholder content. There is no backend, no persistence, and no cross-server or cross-site communication.

## In scope

- One-page layout (drawer + map + bottom bar)
- Interactive spot selection (local React state only)
- Placeholder conditions and decision copy
- Visible "Last updated" timestamp (placeholder)
- Mock SVG map with clickable pins

## Out of scope (for now)

- NOAA or any live API integration
- Data transformers, sync, or business-rule engines
- Authentication / sign-up
- Multi-page routing
- Local storage or backend state

## Development

```bash
cd frontend
npm install
npm run dev
```
