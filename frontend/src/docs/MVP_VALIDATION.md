# MVP Validation — Lake Surf Data

This document records expected behavior for the dual-source NOAA data layer on Lake Michigan catalog spots.

## Data model

- **Wind (nearshore):** C-MAN / lighthouse / pier stations (`CHII2`, `MCYI3`, `SVNM4`, `MKGM4`, `MLWW3`, `SGNW3`, `45186`)
- **Waves (offshore reference):** Allowlisted buoys only (`45168`, `45029`, `45024`, `45026`, `45170`, `45210`, `45214`)
- Wave height is **never** read from nearshore stations (they report `MM` for WVHT)
- Spots succeed when **wind OR wave** data is available

## Validation spots

| Spot | Wind station | Wave buoy | Notes |
|------|--------------|-----------|-------|
| Montrose | `CHII2` (~4 km) | `45214` or `45170` | Not `45198` — no WVHT |
| Michigan City | `MCYI3` (~0.5 km) | `45170` (~8 km) | Pier wind + offshore waves |
| St. Joseph | `SVNM4` | `45168` | |
| South Haven | `SVNM4` (~0 km) | `45029` (~55 km, low confidence) | |
| Grand Haven | `MKGM4` | `45024` | |
| Sheboygan | `SGNW3` | `45210` | |
| Waukegan | `45186` | `45214` | |

## How to validate

1. Run `cd frontend && npm run dev`
2. Select each spot from the drawer or map marker
3. Confirm NOAA section shows **two blocks**:
   - Wind (nearshore) — station, speed, direction, distance
   - Waves (offshore reference) — buoy, WVHT, DPD, distance — or "No buoy in range"
4. Detail panel shows inference note explaining distance and source separation
5. Surfability uses wind-only mode when no offshore wave buoy in range
6. Windy iframe loads for spot coordinates

**Dev:** `npm run dev` fetches NOAA via the Vite proxy at `/api/ndbc/latest_obs.txt` (no CORS issue).

**Production:** deployed builds still need `VITE_NDBC_URL` pointing at a server-side proxy — not set yet.

Use `npm run test:data` to validate parsing logic from Node (direct NDBC URL, no browser).

## Surfability rules (MVP)

- **Wind-only mode** when no offshore WVHT: score on wind only; never flag `tooSmall`
- **Too flat**: offshore WVHT &lt; 1.5 ft (low confidence if buoy &gt; 15 km)
- **Too windy**: nearshore wind &gt; 22 kt
- **Marginal**: waves 1.5–2.5 ft or wind 18–22 kt
- **Good**: waves ≥ 2.5 ft and wind ≤ 18 kt

## NOAA ingest

- Source: `https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt`
- Wind fields: `WDIR`, `WSPD`, `GST` (m/s → kt)
- Wave fields: `WVHT` (m → ft), `DPD`, `APD`, `MWD`
- Optional detail: `PRES` (hPa → inHg), `ATMP`, `WTMP` (°C → °F)

## Known limitations

- Production S3 deploy: no NOAA proxy yet — set `VITE_NDBC_URL` at build time when ready
- Swell/wind-wave breakdown (`SwH`, `WWH`) not in latest_obs — phase 2
- No GIS shoreline gating yet
