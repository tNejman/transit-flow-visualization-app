import { segmentAverage, stationFlow, occupancyBand } from '../utils/occupancy.js'

function StationDetails({ station, network, exported, onToggleExport, onClose }) {
  const { inflow, outflow, segmentsTouched } = stationFlow(station.id, network)
  return (
    <div className="details-panel">
      <header>
        <div>
          <div className="kind">Stacja</div>
          <h3>{station.name}</h3>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
      </header>
      <dl>
        <dt>ID</dt>
        <dd className="mono">{station.id}</dd>
        <dt>Współrzędne</dt>
        <dd className="mono">
          {station.location.lat.toFixed(4)}, {station.location.lng.toFixed(4)}
        </dd>
        <dt>Odcinki</dt>
        <dd>{segmentsTouched}</dd>
        <dt>Sumaryczny przyjazd</dt>
        <dd>{inflow}</dd>
        <dt>Sumaryczny odjazd</dt>
        <dd>{outflow}</dd>
      </dl>
      <label className="export-toggle">
        <input
          type="checkbox"
          checked={exported}
          onChange={(e) => onToggleExport(e.target.checked)}
        />
        Uwzględnij w eksporcie CSV
      </label>
    </div>
  )
}

function SegmentDetails({ data, exported, onToggleExport, onClose }) {
  const { stationFrom, stationTo } = data.routeSegment
  const avg = segmentAverage(data)
  const band = occupancyBand(avg)
  return (
    <div className="details-panel">
      <header>
        <div>
          <div className="kind">Odcinek</div>
          <h3>{stationFrom.name} ↔ {stationTo.name}</h3>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
      </header>
      <dl>
        <dt>ID odcinka</dt>
        <dd className="mono">{data.routeSegment.id}</dd>
        <dt>Data</dt>
        <dd>{data.eventTime}</dd>
        <dt>Średnie obciążenie</dt>
        <dd style={{ color: band.color, fontWeight: 600 }}>{avg}% — {band.label}</dd>
        <dt>{stationFrom.name} → {stationTo.name}</dt>
        <dd>{data.occupancyFromTo}%</dd>
        <dt>{stationTo.name} → {stationFrom.name}</dt>
        <dd>{data.occupancyToFrom}%</dd>
        <dt>Snapshot</dt>
        <dd className="mono">{data.snapshotTime}</dd>
        <dt>Źródło</dt>
        <dd>{data.estimated ? 'Estymacja historyczna' : 'Dane bieżące'}</dd>
      </dl>
      <label className="export-toggle">
        <input
          type="checkbox"
          checked={exported}
          onChange={(e) => onToggleExport(e.target.checked)}
        />
        Uwzględnij w eksporcie CSV
      </label>
    </div>
  )
}

export default function DetailsPanel({
  selection,
  network,
  stations,
  exportSet,
  onToggleExport,
  onClose,
}) {
  if (!selection) return null

  if (selection.type === 'station') {
    const station = stations.find((s) => s.id === selection.id)
    if (!station) return null
    const key = `station:${station.id}`
    return (
      <StationDetails
        station={station}
        network={network}
        exported={exportSet.has(key)}
        onToggleExport={(v) => onToggleExport(key, v)}
        onClose={onClose}
      />
    )
  }

  if (selection.type === 'segment') {
    const data = network.find((d) => d.routeSegment.id === selection.id)
    if (!data) return null
    const key = `segment:${data.routeSegment.id}`
    return (
      <SegmentDetails
        data={data}
        exported={exportSet.has(key)}
        onToggleExport={(v) => onToggleExport(key, v)}
        onClose={onClose}
      />
    )
  }

  return null
}
