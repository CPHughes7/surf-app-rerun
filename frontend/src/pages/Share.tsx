import { useEffect, useState, type FormEvent } from "react";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
  const [refresh, setRefresh] = useState(false)
  const [isEditing, setIsEditing] = useState(false);
//   const initialSurfSpots: SurfSpot[] = [
//     { id: 1, name: "Bradford Beach", latitude: 43.0634, longitude: -87.8724 },
//     { id: 2, name: "McKinley Beach", latitude: 43.0509, longitude: -87.8833 },
//     { id: 3, name: "South Shore Beach", latitude: 42.9993, longitude: -87.8832 },
// ]; 
  useEffect (() =>  {
    fetch("/api/locations")
    .then((res) => res.json())
    .then((data) => setSpots(data))

  }, [refresh]);

  function addLocation(name: string, latitude: number, longitude: number) {
    fetch("/api/location", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, latitude, longitude}),
     })
     .then((res) => res.json())
     .then( () => setRefresh(!refresh))
    
    }

  function handleAddSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pendingLocation || newSpotName.trim() === "") {
      return;
    }

    setSpots((currentSpots) => [
      ...currentSpots,
      {
        // Temporary negative id until the backend responds and a refetch
        // replaces this optimistic entry with the real record.
        id: -Date.now(),
        name: newSpotName.trim(),
        latitude: pendingLocation[0],
        longitude: pendingLocation[1],
      },
    ]);

    addLocation(newSpotName, pendingLocation[0], pendingLocation[1]); 

    setNewSpotName("");
    setPendingLocation(null);
  }
  function deleteLocation(location_id: number) {
    fetch(`/api/locations/${location_id}`, {
        method: "DELETE",
     })
     .then((res) => res.json())
     .then( () => setRefresh(!refresh))
    
    }

  function handleDeleteSpot(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, spot_id: number) {
    event.preventDefault();
    deleteLocation(spot_id)

  
  }
    
    
    function handleUpdateLocation(event: any, location_id: number ) {
        event.preventDefault();
        event.stopPropagation();

        fetch(`/api/locations/${location_id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name: newSpotName}),
         })
         .then((res) => res.json())
         .then( () => {
            setRefresh(!refresh);
            setIsEditing(false);
          }
         )
         

        setIsEditing(!isEditing)
    }

    function handleIsEditingToggle(event: any, spot_name: string) {
        event.preventDefault();
        event.stopPropagation();
        setIsEditing(!isEditing)



        if (isEditing) {
            setNewSpotName(spot_name)
        }
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
            <Popup>
                {isEditing ? (
                    <>
                        <input
                            autoFocus
                            value={newSpotName}
                            onChange={(event) => setNewSpotName(event.target.value)}
                            style={{ display: "block", margin: "8px 0", width: "160px" }}
                        />
                        <button onClick={(e) => {handleIsEditingToggle(e, spot.name)}}>Cancel</button>
                        <button onClick={(e) => {handleUpdateLocation(e, spot.id)}}>Update</button>
                    </>
                ) : (

                    <>
                        {spot.name}{( spot.id ? spot.id : " no id" )} 
                        <button onClick={(e) => handleDeleteSpot(e, spot.id )}>Delete</button>
                        <button onClick={(e) => {handleIsEditingToggle(e, spot.name)}}>Edit</button>
                    </>
                )}

            </Popup>
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