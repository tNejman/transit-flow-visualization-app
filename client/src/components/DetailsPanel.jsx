import { useEffect, useState } from 'react'
import { segmentAverage, occupancyBand } from '../utils/occupancy.js'
import * as api from '../api/Api.js'

function stationCoords(station) {
  if (!station) return { lat: null, lng: null }
  const loc = station.location
  const lat = loc?.lat ?? loc?.y ?? station.latitude ?? null
  const lng = loc?.lng ?? loc?.x ?? station.longitude ?? null
  return { lat, lng }
}

function StationDetails({ stationId, exported, onToggleExport, onClose }) {
  const [station, setStation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStation(null)
    setError(null)
    api.getNode(stationId)
      .then((s) => { if (!cancelled) setStation(s) })
      .catch((e) => { if (!cancelled) setError(e.message || 'Błąd pobierania') })
    return () => { cancelled = true }
  }, [stationId])

  if (error) {
    return (
      <div className="details-panel">
        <header>
          <div>
            <div className="kind">Stacja</div>
            <h3>Błąd</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>
        <p className="mono">{error}</p>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="details-panel">
        <header>
          <div>
            <div className="kind">Stacja</div>
            <h3>Ładowanie…</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>
      </div>
    )
  }

  const { lat, lng } = stationCoords(station)
  const coords =
    typeof lat === 'number' && typeof lng === 'number'
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : '—'

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
        <dt>Nazwa</dt>
        <dd>{station.name}</dd>
        <dt>Współrzędne</dt>
        <dd className="mono">{coords}</dd>
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
        <dd style={{ color: band.color, fontWeight: 600 }}>{avg} — {band.label}</dd>
        <dt>{stationFrom.name} → {stationTo.name}</dt>
        <dd>{data.occupancyFromTo}</dd>
        <dt>{stationTo.name} → {stationFrom.name}</dt>
        <dd>{data.occupancyToFrom}</dd>
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
    const stationExists = stations.some((s) => s.id === selection.id)
    if (!stationExists) return null
    const key = `station:${selection.id}`
    return (
      <StationDetails
        stationId={selection.id}
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
