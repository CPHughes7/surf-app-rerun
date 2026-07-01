import { useEffect, useState, type FormEvent } from "react";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { data } from "react-router-dom";

const surfSpotIcon = L.icon({
  iconAnchor: [12, 41],
  iconRetinaUrl: markerIcon2x,
  iconSize: [25, 41],
  iconUrl: markerIcon,
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl: markerShadow,
});

type SurfSpot = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

// const initialSurfSpots: SurfSpot[] = [
//   { id: 1, name: "Bradford Beach", latitude: 43.0634, longitude: -87.8724 },
//   { id: 2, name: "McKinley Beach", latitude: 43.0509, longitude: -87.8833 },
//   { id: 3, name: "South Shore Beach", latitude: 42.9993, longitude: -87.8832 },
// ];

type MapClickHandlerProps = {
  onMapClick: (location: LatLngTuple) => void;
};

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (event) => {
      onMapClick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function Share() {
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [newSpotName, setNewSpotName] = useState("");
  const [pendingLocation, setPendingLocation] = useState<LatLngTuple | null>(null);

//   const initialSurfSpots: SurfSpot[] = [
//     { id: 1, name: "Bradford Beach", latitude: 43.0634, longitude: -87.8724 },
//     { id: 2, name: "McKinley Beach", latitude: 43.0509, longitude: -87.8833 },
//     { id: 3, name: "South Shore Beach", latitude: 42.9993, longitude: -87.8832 },
// ]; 
  useEffect (() =>  {
    fetch("http://localhost:8000/api/locations")
    .then((res) => res.json())
    .then((data) => setSpots(data))

  }, []);

  function addLocation(name, latitude, longitude) {
    fetch("http://localhost:8000/api/location", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, latitude, longitude}),
     })
     .then((res) => res.json())
    
    }

  function handleAddSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pendingLocation || newSpotName.trim() === "") {
      return;
    }

    setSpots((currentSpots) => [
      ...currentSpots,
      {
        id: Date.now(),
        name: newSpotName.trim(),
        latitude: pendingLocation[0],
        longitude: pendingLocation[1],
      },
    ]);

    addLocation(newSpotName, pendingLocation[0], pendingLocation[1]); 

    setNewSpotName("");
    setPendingLocation(null);
  }

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "calc(100vh - 112px)",
      }}
    >
      <MapContainer
        center={[43.035, -87.879]}
        zoom={12}
        style={{ height: "650px", maxWidth: "1000px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={setPendingLocation} />
        {spots.map((spot) => (
          <Marker key={spot.id} icon={surfSpotIcon} position={[spot.latitude, spot.longitude]}>
            <Popup>{spot.name}</Popup>
          </Marker>
        ))}
        {pendingLocation && (
          <Popup
            position={pendingLocation}
            eventHandlers={{ remove: () => setPendingLocation(null) }}
          >
            <form onSubmit={handleAddSpot}>
              <label>
                Spot name
                <input
                  autoFocus
                  value={newSpotName}
                  onChange={(event) => setNewSpotName(event.target.value)}
                  style={{ display: "block", margin: "8px 0", width: "160px" }}
                />
              </label>
              <button type="submit">Add spot</button>
            </form>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}