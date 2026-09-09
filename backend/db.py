import os
import sqlite3
from pathlib import Path

DB_PATH = Path(os.environ.get("APP_DB_PATH", Path(__file__).parent / "app.db"))


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                spot_id TEXT NOT NULL DEFAULT '',
                utm_source TEXT,
                utm_medium TEXT,
                utm_campaign TEXT,
                referrer TEXT,
                location_interest TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(email, spot_id)
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS private_spots (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                facing_deg REAL NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
