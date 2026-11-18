import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

// Detail page साठी छोटा map — meter (green) + poles (gold)
export default function MiniMap({ center, poles = [] }) {
  return (
    <MapContainer center={center} zoom={17} scrollWheelZoom={false} preferCanvas className="h-full w-full">
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CircleMarker center={center} radius={9} pathOptions={{ color: '#fff', weight: 2, fillColor: '#00843C', fillOpacity: 1 }}>
        <Tooltip>Meter</Tooltip>
      </CircleMarker>
      {poles.filter((p) => p.location?.coordinates).map((p) => (
        <CircleMarker
          key={p._id}
          center={[p.location.coordinates[1], p.location.coordinates[0]]}
          radius={6}
          pathOptions={{ color: '#fff', weight: 2, fillColor: '#C09C24', fillOpacity: 1 }}
        >
          <Tooltip>{p.pole.name} · {p.light.name}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
