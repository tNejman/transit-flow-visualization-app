import { useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Polyline, Tooltip } from 'react-leaflet'
import voivodeships from '../assets/geo/poland-voivodeships.geo.json'
import { segmentStyle, segmentAverage } from '../utils/occupancy.js'

const POLAND_CENTER = [52.07, 19.48]
const POLAND_ZOOM = 6

const voivodeshipStyle = {
  color: '#475569',
  weight: 1,
  fillColor: '#94a3b8',
  fillOpacity: 0.08,
}

export default function PolandMap({
  stations,
  network,
  selection,
  onSelect,
}) {
  const stationById = useMemo(
    () => Object.fromEntries(stations.map((s) => [s.id, s])),
    [stations],
  )

  return (
    <MapContainer
      center={POLAND_CENTER}
      zoom={POLAND_ZOOM}
      minZoom={5}
      maxZoom={12}
      scrollWheelZoom
      preferCanvas={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        subdomains="abcd"
      />

      <GeoJSON
        data={voivodeships}
        style={voivodeshipStyle}
        onEachFeature={(feature, layer) => {
          const name = feature?.properties?.nazwa || feature?.properties?.name
          if (name) layer.bindTooltip(name, { sticky: true })
        }}
      />

      {network.map((data) => {
        const from = stationById[data.routeSegment.stationFrom.id]
        const to = stationById[data.routeSegment.stationTo.id]
        if (!from || !to) return null
        const isSelected = selection?.type === 'segment' && selection.id === data.routeSegment.id
        const base = segmentStyle(data)
        return (
          <Polyline
            key={data.routeSegment.id}
            positions={[[from.location.lat, from.location.lng], [to.location.lat, to.location.lng]]}
            pathOptions={{
              ...base,
              weight: isSelected ? base.weight + 4 : base.weight,
              opacity: isSelected ? 1 : base.opacity,
            }}
            eventHandlers={{
              click: () => onSelect({ type: 'segment', id: data.routeSegment.id }),
            }}
          >
            <Tooltip sticky>
              <div className="map-tooltip">
                <b>{from.name} ↔ {to.name}</b>
                <div>Średnia zajętość: <b>{segmentAverage(data)}%</b></div>
                {data.estimated && <div className="tt-warn">Dane estymowane</div>}
              </div>
            </Tooltip>
          </Polyline>
        )
      })}

      {stations.map((s) => {
        const isSelected = selection?.type === 'station' && selection.id === s.id
        return (
          <CircleMarker
            key={s.id}
            center={[s.location.lat, s.location.lng]}
            radius={isSelected ? 9 : 6}
            pathOptions={{
              color: '#0f172a',
              weight: 2,
              fillColor: isSelected ? '#6ea8ff' : '#ffffff',
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => onSelect({ type: 'station', id: s.id }),
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <b>{s.name}</b>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
