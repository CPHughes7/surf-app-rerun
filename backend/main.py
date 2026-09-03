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


class SubscribeInput(BaseModel):
    email: str


@app.post("/api/subscribe")
def subscribe(payload: SubscribeInput):
    """Issue a bearer token gating hidden-spot reads.

    Payment is stubbed — the token is granted immediately — but the
    token is genuinely required: there is no other way to read
    /api/hidden-spots. Idempotent per email (same email -> same token).
    """
    email = payload.email.strip().lower()
    if not email or not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")

    with db.get_connection() as conn:
        existing = conn.execute(
            "SELECT token FROM subscriber_tokens WHERE email = ? ORDER BY created_at ASC LIMIT 1",
            (email,),
        ).fetchone()
        if existing:
            return {"token": existing["token"], "email": email}

        token = uuid.uuid4().hex
        created_at = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "INSERT INTO subscriber_tokens (token, email, created_at) VALUES (?, ?, ?)",
            (token, email, created_at),
        )

    return {"token": token, "email": email}


def require_subscriber_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT token FROM subscriber_tokens WHERE token = ?", (token,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return token


@app.get("/api/hidden-spots")
def get_hidden_spots(_: str = Depends(require_subscriber_token)):
    with db.get_connection() as conn:
        rows = conn.execute(
            "SELECT id, name, lat, lng, region, is_firing, firing_at FROM hidden_spots"
        ).fetchall()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "lat": row["lat"],
            "lng": row["lng"],
            "region": row["region"],
            "isFiring": bool(row["is_firing"]),
            "firingAt": row["firing_at"],
        }
        for row in rows
    ]


def require_operator_secret(x_operator_secret: str | None = Header(default=None)) -> None:
    expected = os.environ.get("OPERATOR_SECRET", "")
    # Fail closed: an unset secret must never match an absent/empty header.
    if not expected or x_operator_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid operator secret")


@app.post("/api/operator/hidden-spots/{spot_id}/fire")
def fire_hidden_spot(spot_id: str, _: None = Depends(require_operator_secret)):
    now = datetime.now(timezone.utc).isoformat()
    with db.get_connection() as conn:
        cursor = conn.execute(
            "UPDATE hidden_spots SET is_firing = 1, firing_at = ? WHERE id = ?",
            (now, spot_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Unknown hidden spot")

    return {"ok": True}


@app.post("/api/operator/hidden-spots/{spot_id}/clear")
def clear_hidden_spot(spot_id: str, _: None = Depends(require_operator_secret)):
    with db.get_connection() as conn:
        cursor = conn.execute(
            "UPDATE hidden_spots SET is_firing = 0, firing_at = NULL WHERE id = ?",
            (spot_id,),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Unknown hidden spot")

    return {"ok": True}


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