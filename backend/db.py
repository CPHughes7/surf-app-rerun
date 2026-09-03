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
                created_at TEXT NOT NULL,
                UNIQUE(email, spot_id)
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS hidden_spots (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                region TEXT NOT NULL,
                is_firing INTEGER NOT NULL DEFAULT 0,
                firing_at TEXT
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS subscriber_tokens (
                token TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        seeded = conn.execute("SELECT COUNT(*) AS n FROM hidden_spots").fetchone()["n"]
        if seeded == 0:
            # Placeholder breaks to demonstrate the gated-data plumbing —
            # not curated real hidden spots.
            conn.executemany(
                "INSERT INTO hidden_spots (id, name, lat, lng, region) VALUES (?, ?, ?, ?, ?)",
                [
                    ("secret-point", "Secret Point (placeholder)", 42.95, -86.45, "West Michigan"),
                    ("hidden-jetty", "Hidden Jetty (placeholder)", 41.85, -87.05, "NW Indiana"),
                ],
            )
