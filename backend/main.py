
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, create_engine, select
from backend.models import Location 
from pathlib import Path

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = Path(__file__).resolve().parent
DB =  BASE_DIR / "database.db"

engine = create_engine(f"sqlite:///{DB}", echo=True)

def add_three_locations():
    initial_locations = [
        Location(id=1, name="Bradford Beach", latitude=43.0634, longitude=-87.8724),
        Location(id=2, name="McKinley Beach", latitude=43.0509, longitude=-87.8833),
        Location(id=3, name="South Shore Beach", latitude=42.9993, longitude=-87.8832),
    ]

    with Session(engine) as session:
        for location in initial_locations:
            if session.get(Location, location.id) is None:
                session.add(location)
        session.commit()

# def init_db():
#     SQLModel.metadata.create_all(engine)
#     add_three_locations()

# init_db()

def get_session():
    with Session(engine) as session:
        yield session

class LocationsCreate(BaseModel):
    name: str
    latitude: float
    longitude: float

@app.get("/api/locations")
def get_locations(session: Session = Depends(get_session)):
    return session.exec(select(Location)).all()


@app.post("/api/location")
def create_locations(location: Location, session: Session = Depends(get_session)):
    session.add(location)
    session.commit()
    session.refresh(location)
    return location

@app.delete("/api/locations/{location_id}")
def delete_location(location_id: int, session: Session = Depends(get_session)):
    location = session.get(Location, location_id)
    session.delete(location)
    session.commit()
    return{"Deleted": location_id}

@app.put("/api/locations/{location_id}")
def update_location(location_id: int, data: Location, session: Session = Depends(get_session)):
    location = session.get(Location, location_id)
    location.name = data.name
    session.commit()
    session.refresh(location)
    return location