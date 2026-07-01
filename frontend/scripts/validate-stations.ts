/**
 * Validates dual-source station resolution against NDBC latest_obs.
 * Run: npx tsx scripts/validate-stations.ts
 */
import { SURF_SPOTS } from '../src/data/surfSpots'
import { parseNdbcLatestObs, spotConditionsFromObservations } from '../src/services/noaa'
import { computeSurfability } from '../src/lib/surfability'

const NDBC_URL = 'https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt'

async function main() {
  const res = await fetch(NDBC_URL)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const text = await res.text()
  const observations = parseNdbcLatestObs(text)

  console.log(`Parsed ${observations.size} NDBC stations\n`)

  for (const spot of SURF_SPOTS) {
    const conditions = spotConditionsFromObservations(spot, observations)
    const score = computeSurfability(conditions)

    if (!conditions) {
      console.log(`✗ ${spot.name}: no data`)
      continue
    }

    const wind = conditions.wind
      ? `${conditions.wind.stationId} @ ${conditions.wind.distanceKm.toFixed(1)}km, ${conditions.wind.speedKt?.toFixed(0) ?? '—'}kt`
      : '—'
    const wave = conditions.wave
      ? `${conditions.wave.stationId} @ ${conditions.wave.distanceKm.toFixed(1)}km, ${conditions.wave.heightFt?.toFixed(1) ?? '—'}ft`
      : '—'

    console.log(`✓ ${spot.name}`)
    console.log(`  Wind:  ${wind}`)
    console.log(`  Wave:  ${wave}`)
    console.log(`  Score: ${score.overall} (${score.confidence})`)
    console.log(`  Note:  ${conditions.inferenceNote}`)
    console.log()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
