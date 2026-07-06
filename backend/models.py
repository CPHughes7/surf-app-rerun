from typing import Optional
from sqlmodel import SQLModel, Field
class Location(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    latitude: float
    longitude: float
    notes: Optional[str] = None
    notes2: Optional[str] = None