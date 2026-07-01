export type StationKind = 'cman' | 'lighthouse' | 'pier' | 'buoy'

export type Station = {
  id: string
  name: string
  lat: number
  lng: number
  kind: StationKind
  hasWind: boolean
  hasWaves: boolean
}

/** Nearshore C-MAN / lighthouse / pier stations — wind-primary, no WVHT at surf line. */
export const NEARSHORE_STATIONS: Station[] = [
  { id: 'CHII2', name: 'Chicago Harrison-Dever Crib', lat: 41.916, lng: -87.572, kind: 'cman', hasWind: true, hasWaves: false },
  { id: 'MCYI3', name: 'Michigan City Pier', lat: 41.729, lng: -86.912, kind: 'pier', hasWind: true, hasWaves: false },
  { id: 'SVNM4', name: 'South Haven C-MAN', lat: 42.401, lng: -86.288, kind: 'cman', hasWind: true, hasWaves: false },
  { id: 'MKGM4', name: 'Muskegon Coast Guard', lat: 43.228, lng: -86.339, kind: 'cman', hasWind: true, hasWaves: false },
  { id: 'MLWW3', name: 'Milwaukee Harbor', lat: 43.005, lng: -87.884, kind: 'cman', hasWind: true, hasWaves: false },
  { id: 'SGNW3', name: 'Sheboygan', lat: 43.749, lng: -87.693, kind: 'cman', hasWind: true, hasWaves: false },
  { id: '45186', name: 'Waukegan Buoy', lat: 42.368, lng: -87.795, kind: 'buoy', hasWind: true, hasWaves: false },
]

/** Offshore buoys verified to report WVHT — wave reference only. */
export const WAVE_CAPABLE_OFFSHORE_BUOYS: Station[] = [
  { id: '45168', name: 'St. Joseph Buoy', lat: 42.397, lng: -86.331, kind: 'buoy', hasWind: true, hasWaves: true },
  { id: '45029', name: 'South Haven Buoy', lat: 42.9, lng: -86.272, kind: 'buoy', hasWind: true, hasWaves: true },
  { id: '45024', name: 'Ludington Buoy', lat: 43.98, lng: -86.56, kind: 'buoy', hasWind: true, hasWaves: true },
  { id: '45026', name: 'New Buffalo Buoy', lat: 41.982, lng: -86.619, kind: 'buoy', hasWind: true, hasWaves: true },
  { id: '45170', name: 'Michigan City Buoy', lat: 41.755, lng: -86.968, kind: 'buoy', hasWind: true, hasWaves: true },
  { id: '45210', name: 'Sheboygan Buoy', lat: 44.055, lng: -87.05, kind: 'buoy', hasWind: true, hasWaves: true },
  { id: '45214', name: 'South Entry Light', lat: 42.674, lng: -87.026, kind: 'lighthouse', hasWind: false, hasWaves: true },
]

export const MAX_WAVE_REFERENCE_KM = 80

const ALL_STATIONS: Station[] = [...NEARSHORE_STATIONS, ...WAVE_CAPABLE_OFFSHORE_BUOYS]

export function getStationById(id: string): Station | undefined {
  return ALL_STATIONS.find((s) => s.id === id)
}

export function isWaveCapableBuoy(id: string): boolean {
  return WAVE_CAPABLE_OFFSHORE_BUOYS.some((s) => s.id === id)
}
