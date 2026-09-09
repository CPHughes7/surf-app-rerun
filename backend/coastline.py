"""Simplified Lake Michigan shoreline outline for the private-spot coastline
gate. Not survey-grade GIS data — densified with the 13 catalog spots' exact
coordinates everywhere one falls near the shore (so the outline is genuinely
accurate right where usage will concentrate); stretches with no catalog spot
or NOAA station (the northern end, roughly vertices 6-12 below) are still a
coarse hand-authored approximation. Clockwise from the south end near Gary,
IN — the winding direction matters for estimate_facing_deg, not just distance.

Mirrors frontend/src/lib/geo/coastline.ts (client-side gate, same shape) —
keep both in sync if these vertices ever get refined. This file is the real
enforcement; the frontend copy is only there to reject bad clicks early.
"""

import math

LAKE_MICHIGAN_OUTLINE = [
    (41.63, -87.20),  # Gary, IN (generic anchor, no catalog spot here)
    (41.6747, -87.4947),  # Whihala Beach
    (41.9619, -87.6389),  # Montrose Beach
    (42.4167, -87.8333),  # Waukegan
    (43.0536, -87.8756),  # Milwaukee
    (43.7536, -87.6956),  # Sheboygan
    (44.15, -87.60),  # Manitowoc (generic anchor)
    (45.25, -86.95),  # Door peninsula tip (generic anchor)
    (45.95, -86.25),  # far north shore (generic anchor)
    (45.78, -85.05),  # Mackinac area (generic anchor)
    (45.32, -85.26),  # Charlevoix (generic anchor)
    (44.85, -85.90),  # Traverse City area (generic anchor)
    (44.63, -86.25),  # Frankfort (generic anchor)
    (44.25, -86.35),  # Manistee (generic anchor)
    (44.0267, -86.4578),  # Ludington
    (43.2342, -86.3478),  # Muskegon
    (43.0631, -86.2289),  # Grand Haven
    (42.87, -86.202),  # Holland
    (42.4017, -86.265),  # South Haven
    (42.115, -86.487),  # St. Joseph
    (41.7939, -86.7442),  # New Buffalo
    (41.7106, -86.9014),  # Michigan City
    (41.63, -87.20),  # back to Gary, closing the loop
]

DEFAULT_MAX_COASTLINE_DISTANCE_KM = 2

KM_PER_DEG_LAT = 111.32


def _bearing_deg(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_lambda = math.radians(lng2 - lng1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def _distance_to_segment_km(
    lat: float, lng: float, lat1: float, lng1: float, lat2: float, lng2: float
) -> float:
    """Equirectangular-flat point-to-segment distance — accurate enough at this scale."""
    ref_lat = (lat1 + lat2) / 2
    km_per_deg_lng = KM_PER_DEG_LAT * math.cos(math.radians(ref_lat))

    bx = (lng2 - lng1) * km_per_deg_lng
    by = (lat2 - lat1) * KM_PER_DEG_LAT
    px = (lng - lng1) * km_per_deg_lng
    py = (lat - lat1) * KM_PER_DEG_LAT

    ab_len_sq = bx * bx + by * by
    t = 0.0 if ab_len_sq == 0 else max(0.0, min(1.0, (px * bx + py * by) / ab_len_sq))
    dx = px - t * bx
    dy = py - t * by
    return math.sqrt(dx * dx + dy * dy)


def _nearest_segment(lat: float, lng: float) -> tuple[int, float]:
    best_index = 0
    best_distance = math.inf
    for i in range(len(LAKE_MICHIGAN_OUTLINE) - 1):
        lat1, lng1 = LAKE_MICHIGAN_OUTLINE[i]
        lat2, lng2 = LAKE_MICHIGAN_OUTLINE[i + 1]
        d = _distance_to_segment_km(lat, lng, lat1, lng1, lat2, lng2)
        if d < best_distance:
            best_distance = d
            best_index = i
    return best_index, best_distance


def distance_to_coastline_km(lat: float, lng: float) -> float:
    _, distance = _nearest_segment(lat, lng)
    return distance


def is_near_coastline(lat: float, lng: float, max_km: float = DEFAULT_MAX_COASTLINE_DISTANCE_KM) -> bool:
    return distance_to_coastline_km(lat, lng) <= max_km


def estimate_facing_deg(lat: float, lng: float) -> float:
    """See estimateFacingDeg in the TS mirror for the full rationale: nearest
    segment's walking bearing, rotated 90° clockwise, works because the
    outline is wound clockwise (lake interior is always on the right)."""
    index, _ = _nearest_segment(lat, lng)
    lat1, lng1 = LAKE_MICHIGAN_OUTLINE[index]
    lat2, lng2 = LAKE_MICHIGAN_OUTLINE[index + 1]
    segment_bearing = _bearing_deg(lat1, lng1, lat2, lng2)
    return (segment_bearing + 90) % 360
