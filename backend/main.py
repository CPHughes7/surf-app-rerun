import string
from fastapi import FastAPI 
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

string = "Hello"

class LocationsCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    
locations = [
  { "id": 1, "name": "Bradford Beach", "latitude": 43.0634, "longitude": -87.8724 },
  { "id": 2, "name": "McKinley Beach", "latitude": 43.0509, "longitude": -87.8833 },
  { "id": 3, "name": "South Shore Beach", "latitude": 42.9993, "longitude": -87.8832 },
]

'''@app.get("api/hello")
def hello():
    return True'''

@app.get("/api/locations")
def get_locations():
    return locations

@app.post("/api/location")
def create_locations(loc: LocationsCreate):
    new_id = max([lc["id"] for lc in locations], default=0) + 1 
    new_location = {"id": new_id, "name": loc.name, "latitude": loc.latitude, "longitude": loc.longitude}
    locations.append(new_location)
    return new_location