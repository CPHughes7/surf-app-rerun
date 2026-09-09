"""Simplified Lake Michigan shoreline outline for the private-spot coastline
gate. Not survey-grade GIS data — just enough vertices to trace the lake's
real shape, including stretches with no catalog spot or NOAA station (e.g.
the northern end), so private spots can't land mid-lake or far inland.
Clockwise from the south end near Gary, IN.

Mirrors frontend/src/lib/geo/coastline.ts (client-side gate, same shape) —
keep both in sync if these vertices ever get refined. This file is the real
enforcement; the frontend copy is only there to reject bad clicks early.
"""

import math

LAKE_MICHIGAN_OUTLINE = [
    (41.63, -87.20),
    (41.88, -87.62),
    (42.50, -87.80),
    (43.04, -87.90),
    (43.75, -87.71),
    (44.15, -87.60),
    (45.25, -86.95),
    (45.95, -86.25),
    (45.78, -85.05),
    (45.32, -85.26),
    (44.85, -85.90),
    (44.63, -86.25),
    (44.25, -86.35),
    (43.95, -86.45),
    (43.23, -86.35),
    (43.06, -86.23),
    (42.77, -86.20),
    (42.40, -86.27),
    (42.11, -86.49),
    (41.79, -86.74),
    (41.71, -86.91),
    (41.63, -87.20),
]

DEFAULT_MAX_COASTLINE_DISTANCE_KM = 15

KM_PER_DEG_LAT = 111.32


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


def distance_to_coastline_km(lat: float, lng: float) -> float:
    return min(
        _distance_to_segment_km(lat, lng, lat1, lng1, lat2, lng2)
        for (lat1, lng1), (lat2, lng2) in zip(LAKE_MICHIGAN_OUTLINE, LAKE_MICHIGAN_OUTLINE[1:])
    )


def is_near_coastline(lat: float, lng: float, max_km: float = DEFAULT_MAX_COASTLINE_DISTANCE_KM) -> bool:
    return distance_to_coastline_km(lat, lng) <= max_km
