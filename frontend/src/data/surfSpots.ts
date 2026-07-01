export type SurfSpot = {
  id: string
  name: string
  lat: number
  lng: number
  region: string
  windStationId: string
  waveReferenceBuoyId: string
}

/** Curated Lake Michigan surf spots — catalog-only selection in MVP. */
export const SURF_SPOTS: SurfSpot[] = [
  {
    id: 'montrose',
    name: 'Montrose Beach',
    lat: 41.9619,
    lng: -87.6389,
    region: 'Chicago',
    windStationId: 'CHII2',
    waveReferenceBuoyId: '45214',
  },
  {
    id: 'whihala',
    name: 'Whihala Beach',
    lat: 41.6747,
    lng: -87.4947,
    region: 'NW Indiana',
    windStationId: 'MCYI3',
    waveReferenceBuoyId: '45214',
  },
  {
    id: 'michigan-city',
    name: 'Michigan City',
    lat: 41.7106,
    lng: -86.9014,
    region: 'NW Indiana',
    windStationId: 'MCYI3',
    waveReferenceBuoyId: '45170',
  },
  {
    id: 'new-buffalo',
    name: 'New Buffalo',
    lat: 41.7939,
    lng: -86.7442,
    region: 'SW Michigan',
    windStationId: '45026',
    waveReferenceBuoyId: '45026',
  },
  {
    id: 'st-joseph',
    name: 'St. Joseph',
    lat: 42.115,
    lng: -86.487,
    region: 'SW Michigan',
    windStationId: 'SVNM4',
    waveReferenceBuoyId: '45168',
  },
  {
    id: 'south-haven',
    name: 'South Haven',
    lat: 42.4017,
    lng: -86.265,
    region: 'SW Michigan',
    windStationId: 'SVNM4',
    waveReferenceBuoyId: '45029',
  },
  {
    id: 'holland',
    name: 'Holland',
    lat: 42.87,
    lng: -86.202,
    region: 'West Michigan',
    windStationId: 'SVNM4',
    waveReferenceBuoyId: '45029',
  },
  {
    id: 'grand-haven',
    name: 'Grand Haven',
    lat: 43.0631,
    lng: -86.2289,
    region: 'West Michigan',
    windStationId: 'MKGM4',
    waveReferenceBuoyId: '45024',
  },
  {
    id: 'muskegon',
    name: 'Muskegon',
    lat: 43.2342,
    lng: -86.3478,
    region: 'West Michigan',
    windStationId: 'MKGM4',
    waveReferenceBuoyId: '45024',
  },
  {
    id: 'ludington',
    name: 'Ludington',
    lat: 44.0267,
    lng: -86.4578,
    region: 'West Michigan',
    windStationId: '45024',
    waveReferenceBuoyId: '45024',
  },
  {
    id: 'milwaukee',
    name: 'Milwaukee',
    lat: 43.0536,
    lng: -87.8756,
    region: 'Wisconsin',
    windStationId: 'MLWW3',
    waveReferenceBuoyId: '45210',
  },
  {
    id: 'sheboygan',
    name: 'Sheboygan',
    lat: 43.7536,
    lng: -87.6956,
    region: 'Wisconsin',
    windStationId: 'SGNW3',
    waveReferenceBuoyId: '45210',
  },
  {
    id: 'waukegan',
    name: 'Waukegan',
    lat: 42.4167,
    lng: -87.8333,
    region: 'North Illinois',
    windStationId: '45186',
    waveReferenceBuoyId: '45214',
  },
]

export const SNAP_RADIUS_M = 15_000

export function getSpotById(id: string): SurfSpot | undefined {
  return SURF_SPOTS.find((s) => s.id === id)
}
