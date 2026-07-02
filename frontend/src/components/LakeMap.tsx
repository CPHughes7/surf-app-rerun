import { useMemo, type FormEvent } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LocationPin } from '../types/location'
import PinPopupContent from './PinPopupContent'

const LAKE_MICHIGAN_CENTER: [number, number] = [44.0, -86.5]
const LAKE_MICHIGAN_ZOOM = 6

const spotIcon = L.divIcon({
  className: 'lake-pin-icon',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

const selectedSpotIcon = L.divIcon({
  className: 'lake-pin-icon lake-pin-icon--selected',
  html: '<span class="lake-pin-icon__dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

type MapClickHandlerProps = {
  onMapClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

type PinPopupWithOpenProps = {
  pin: LocationPin
  onOpenDetail: (pin: LocationPin) => void
  onEdit: (pin: LocationPin) => void
  onDelete: (pinId: string) => void
  isEditing: boolean
  editName: string
  editLat: string
  editLng: string
  onEditNameChange: (value: string) => void
  onEditLatChange: (value: string) => void
  onEditLngChange: (value: string) => void
  onSaveEdit: (event: FormEvent<HTMLFormElement>, pinId: string) => void
  onCancelEdit: () => void
}

function PinPopupWithOpen({
  pin,
  onOpenDetail,
  onEdit,
  onDelete,
  isEditing,
  editName,
  editLat,
  editLng,
  onEditNameChange,
  onEditLatChange,
  onEditLngChange,
  onSaveEdit,
  onCancelEdit,
}: PinPopupWithOpenProps) {
  const map = useMap()

  const handleOpen = () => {
    onOpenDetail(pin)
    map.closePopup()
  }

  if (isEditing) {
    return (
      <form onSubmit={(event) => void onSaveEdit(event, pin.id)}>
        <label>
          Name
          <input value={editName} onChange={(e) => onEditNameChange(e.target.value)} />
        </label>
        <label>
          Lat
          <input value={editLat} onChange={(e) => onEditLatChange(e.target.value)} />
        </label>
        <label>
          Lng
          <input value={editLng} onChange={(e) => onEditLngChange(e.target.value)} />
        </label>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancelEdit}>
          Cancel
        </button>
      </form>
    )
  }

  return (
    <div>
      <PinPopupContent pin={pin} onOpen={handleOpen} />
      <div className="pin-popup__actions">
        <button type="button" onClick={() => onEdit(pin)}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(pin.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}

type LakeMapProps = {
  pins: LocationPin[]
  selectedSpotId: string | null
  pendingLocation: [number, number] | null
  newSpotName: string
  editingSpotId: string | null
  editName: string
  editLat: string
  editLng: string
  onMapClick: (lat: number, lng: number) => void
  onSelectSpot: (pin: LocationPin) => void
  onOpenDetail: (pin: LocationPin) => void
  onNewSpotNameChange: (value: string) => void
  onAddSpot: (event: FormEvent<HTMLFormElement>) => void
  onCancelAdd: () => void
  onEdit: (pin: LocationPin) => void
  onDelete: (pinId: string) => void
  onEditNameChange: (value: string) => void
  onEditLatChange: (value: string) => void
  onEditLngChange: (value: string) => void
  onSaveEdit: (event: FormEvent<HTMLFormElement>, pinId: string) => void
  onCancelEdit: () => void
}

function LakeMap({
  pins,
  selectedSpotId,
  pendingLocation,
  newSpotName,
  editingSpotId,
  editName,
  editLat,
  editLng,
  onMapClick,
  onSelectSpot,
  onOpenDetail,
  onNewSpotNameChange,
  onAddSpot,
  onCancelAdd,
  onEdit,
  onDelete,
  onEditNameChange,
  onEditLatChange,
  onEditLngChange,
  onSaveEdit,
  onCancelEdit,
}: LakeMapProps) {
  const markers = useMemo(
    () =>
      pins.map((pin) => {
        const isSelected = pin.id === selectedSpotId
        return (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={isSelected ? selectedSpotIcon : spotIcon}
            eventHandlers={{
              click: () => onSelectSpot(pin),
            }}
          >
            <Popup
              minWidth={260}
              maxWidth={320}
              maxHeight={360}
              className="pin-popup-wrapper"
              autoPan
              autoPanPadding={[16, 16]}
            >
              <PinPopupWithOpen
                pin={pin}
                onOpenDetail={onOpenDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                isEditing={editingSpotId === pin.id}
                editName={editName}
                editLat={editLat}
                editLng={editLng}
                onEditNameChange={onEditNameChange}
                onEditLatChange={onEditLatChange}
                onEditLngChange={onEditLngChange}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
              />
            </Popup>
          </Marker>
        )
      }),
    [
      pins,
      selectedSpotId,
      editingSpotId,
      editName,
      editLat,
      editLng,
      onSelectSpot,
      onOpenDetail,
      onEdit,
      onDelete,
      onEditNameChange,
      onEditLatChange,
      onEditLngChange,
      onSaveEdit,
      onCancelEdit,
    ],
  )

  return (
    <MapContainer
      className="lake-map"
      center={LAKE_MICHIGAN_CENTER}
      zoom={LAKE_MICHIGAN_ZOOM}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {markers}
      {pendingLocation && (
        <Popup position={pendingLocation}>
          <form onSubmit={(event) => void onAddSpot(event)}>
            <p>
              Add location at {pendingLocation[0].toFixed(4)}, {pendingLocation[1].toFixed(4)}
            </p>
            <label>
              Name
              <input value={newSpotName} onChange={(e) => onNewSpotNameChange(e.target.value)} />
            </label>
            <button type="submit">Add spot</button>
            <button type="button" onClick={onCancelAdd}>
              Cancel
            </button>
          </form>
        </Popup>
      )}
    </MapContainer>
  )
}

export default LakeMap
