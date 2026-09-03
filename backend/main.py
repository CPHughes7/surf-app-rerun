import os
import re
import time
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db

app = FastAPI()
db.init_db()

DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
allowed_origins = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

NDBC_LATEST_OBS_URL = "https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt"
NDBC_CACHE_SECONDS = 60
_ndbc_cache: dict[str, object] = {"at": 0.0, "body": None}


@app.get("/api/ndbc/latest_obs.txt")
async def get_ndbc_latest_obs() -> Response:
    """Server-side proxy for NDBC's latest_obs bulletin.

    NDBC does not send Access-Control-Allow-Origin, so the browser can't
    fetch it directly in production — this endpoint stands in for the
    Vite dev proxy that only exists under `vite dev`.
    """
    now = time.monotonic()
    if _ndbc_cache["body"] is not None and now - _ndbc_cache["at"] < NDBC_CACHE_SECONDS:
        return Response(content=_ndbc_cache["body"], media_type="text/plain")

    async with httpx.AsyncClient(timeout=10.0) as client:
        upstream = await client.get(NDBC_LATEST_OBS_URL)
    upstream.raise_for_status()

    _ndbc_cache["at"] = now
    _ndbc_cache["body"] = upstream.text
    return Response(content=upstream.text, media_type="text/plain")


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class NotifyMeInput(BaseModel):
    email: str
    spotId: str | None = None


@app.post("/api/notify-me")
def notify_me(payload: NotifyMeInput):
    """Capture a "tell me when a session lines up" lead, optionally tied to a spot."""
    email = payload.email.strip().lower()
    if not email or not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")

    spot_id = (payload.spotId or "").strip()
    created_at = datetime.now(timezone.utc).isoformat()

    with db.get_connection() as conn:
        conn.execute(
            """
            INSERT INTO subscribers (email, spot_id, created_at)
            VALUES (?, ?, ?)
            ON CONFLICT(email, spot_id) DO NOTHING
            """,
            (email, spot_id, created_at),
        )

    return {"ok": True}


def require_admin_secret(x_admin_secret: str | None = Header(default=None)) -> None:
    expected = os.environ.get("ADMIN_SECRET", "")
    # Fail closed: an unset secret must never match an absent/empty header.
    if not expected or x_admin_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid admin secret")


class PrivateSpotInput(BaseModel):
    name: str
    lat: float
    lng: float
    facingDeg: float


@app.post("/api/private-spots")
def create_private_spot(payload: PrivateSpotInput, _: None = Depends(require_admin_secret)):
    """Create a private spot at an arbitrary coordinate.

    The paid capability is this: point at any coordinate and get a
    verdict there, fused client-side from the same NOAA seam that
    powers catalog spots (see frontend/src/lib/conditions/). This
    endpoint is only the gated persistence boundary — admin-only for
    now, real auth/billing later without moving where the boundary
    sits.
    """
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name is required")
    if not (-90 <= payload.lat <= 90) or not (-180 <= payload.lng <= 180):
        raise HTTPException(status_code=422, detail="Invalid coordinates")
    facing_deg = payload.facingDeg % 360

    spot_id = uuid.uuid4().hex
    created_at = datetime.now(timezone.utc).isoformat()

    with db.get_connection() as conn:
        conn.execute(
            """
            INSERT INTO private_spots (id, name, lat, lng, facing_deg, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (spot_id, name, payload.lat, payload.lng, facing_deg, created_at),
        )

    return {
        "id": spot_id,
        "name": name,
        "lat": payload.lat,
        "lng": payload.lng,
        "facingDeg": facing_deg,
        "createdAt": created_at,
    }


@app.get("/api/private-spots")
def list_private_spots(_: None = Depends(require_admin_secret)):
    with db.get_connection() as conn:
        rows = conn.execute(
            "SELECT id, name, lat, lng, facing_deg, created_at FROM private_spots ORDER BY created_at DESC"
        ).fetchall()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "lat": row["lat"],
            "lng": row["lng"],
            "facingDeg": row["facing_deg"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]


class LocationInput(BaseModel):
    name: str
    latitude: float
    longitude: float


# Instructional Lake Michigan starter spots (from surf catalog)
locations = [
    {"id": 1, "name": "Montrose Beach", "latitude": 41.9619, "longitude": -87.6389},
    {"id": 2, "name": "Michigan City", "latitude": 41.7106, "longitude": -86.9014},
    {"id": 3, "name": "St. Joseph", "latitude": 42.115, "longitude": -86.487},
    {"id": 4, "name": "Grand Haven", "latitude": 43.0631, "longitude": -86.2289},
    {"id": 5, "name": "Sheboygan", "latitude": 43.7536, "longitude": -87.6956},
]


@app.get("/api/locations")
def get_locations():
    return locations


@app.post("/api/locations")
def create_location(loc: LocationInput):
    new_id = max((existing["id"] for existing in locations), default=0) + 1
    new_location = {
        "id": new_id,
        "name": loc.name,
        "latitude": loc.latitude,
        "longitude": loc.longitude,
    }
    locations.append(new_location)
    return new_location


# Temporary compatibility alias for the existing frontend call.
@app.post("/api/location")
def create_location_legacy(loc: LocationInput):
    return create_location(loc)


@app.put("/api/locations/{location_id}")
def update_location(location_id: int, loc: LocationInput):
    for index, existing in enumerate(locations):
        if existing["id"] == location_id:
            updated_location = {
                "id": location_id,
                "name": loc.name,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
            }
            locations[index] = updated_location
            return updated_location

    raise HTTPException(status_code=404, detail="Location not found")


@app.delete("/api/locations/{location_id}")
def delete_location(location_id: int):
    for index, existing in enumerate(locations):
        if existing["id"] == location_id:
            removed = locations.pop(index)
            return {"deleted": True, "location": removed}

    raise HTTPException(status_code=404, detail="Location not found")