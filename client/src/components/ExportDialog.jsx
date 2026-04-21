import { useMemo, useState } from 'react'
import { toCsv, downloadCsv } from '../utils/csv.js'
import { segmentAverage, stationFlow } from '../utils/occupancy.js'

const STATION_COLUMNS = [
  { key: 'type',          label: 'type',          default: true,  pick: (r) => r.type },
  { key: 'id',             label: 'id',            default: true,  pick: (r) => r.id },
  { key: 'name',           label: 'name',          default: true,  pick: (r) => r.name },
  { key: 'lat',            label: 'lat',           default: true,  pick: (r) => r.lat },
  { key: 'lng',            label: 'lng',           default: true,  pick: (r) => r.lng },
  { key: 'inflow',         label: 'inflow',        default: true,  pick: (r) => r.inflow },
  { key: 'outflow',        label: 'outflow',       default: true,  pick: (r) => r.outflow },
  { key: 'segmentsTouched',label: 'segmentsTouched', default: false, pick: (r) => r.segmentsTouched },
]

const SEGMENT_COLUMNS = [
  { key: 'type',            label: 'type',            default: true,  pick: (r) => r.type },
  { key: 'id',              label: 'id',              default: true,  pick: (r) => r.id },
  { key: 'date',            label: 'date',            default: true,  pick: (r) => r.date },
  { key: 'stationFrom',     label: 'stationFrom',     default: true,  pick: (r) => r.stationFrom },
  { key: 'stationTo',       label: 'stationTo',       default: true,  pick: (r) => r.stationTo },
  { key: 'occupancyFromTo', label: 'occupancyFromTo', default: true,  pick: (r) => r.occupancyFromTo },
  { key: 'occupancyToFrom', label: 'occupancyToFrom', default: true,  pick: (r) => r.occupancyToFrom },
  { key: 'average',         label: 'average',         default: true,  pick: (r) => r.average },
  { key: 'estimated',       label: 'estimated',       default: true,  pick: (r) => r.estimated },
  { key: 'snapshotTime',    label: 'snapshotTime',    default: false, pick: (r) => r.snapshotTime },
]

function defaultColumns(defs) {
  return new Set(defs.filter((c) => c.default).map((c) => c.key))
}

export default function ExportDialog({
  date,
  stations,
  network,
  exportSet,
  onClose,
}) {
  const [stationCols, setStationCols] = useState(() => defaultColumns(STATION_COLUMNS))
  const [segmentCols, setSegmentCols] = useState(() => defaultColumns(SEGMENT_COLUMNS))
  const selectionOnly = exportSet.size > 0
  const [scope, setScope] = useState(selectionOnly ? 'selected' : 'all')

  const { stationRows, segmentRows } = useMemo(() => {
    const pickStations = scope === 'selected'
      ? stations.filter((s) => exportSet.has(`station:${s.id}`))
      : stations
    const pickSegments = scope === 'selected'
      ? network.filter((d) => exportSet.has(`segment:${d.routeSegment.id}`))
      : network

    const stationRows = pickStations.map((s) => {
      const flow = stationFlow(s.id, network)
      return {
        type: 'station',
        id: s.id,
        name: s.name,
        lat: s.location.lat,
        lng: s.location.lng,
        inflow: flow.inflow,
        outflow: flow.outflow,
        segmentsTouched: flow.segmentsTouched,
      }
    })

    const segmentRows = pickSegments.map((d) => ({
      type: 'segment',
      id: d.routeSegment.id,
      date: d.eventTime,
      stationFrom: d.routeSegment.stationFrom.name,
      stationTo: d.routeSegment.stationTo.name,
      occupancyFromTo: d.occupancyFromTo,
      occupancyToFrom: d.occupancyToFrom,
      average: segmentAverage(d),
      estimated: d.estimated,
      snapshotTime: d.snapshotTime,
    }))
    return { stationRows, segmentRows }
  }, [scope, stations, network, exportSet])

  function toggle(setter, key) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleExport() {
    const activeStationCols = STATION_COLUMNS.filter((c) => stationCols.has(c.key))
    const activeSegmentCols = SEGMENT_COLUMNS.filter((c) => segmentCols.has(c.key))

    if (stationRows.length && activeStationCols.length) {
      downloadCsv(`stacje-${date}.csv`, toCsv(stationRows, activeStationCols))
    }
    if (segmentRows.length && activeSegmentCols.length) {
      downloadCsv(`odcinki-${date}.csv`, toCsv(segmentRows, activeSegmentCols))
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Eksport danych do CSV</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>

        <section className="modal-section">
          <h4>Zakres</h4>
          <label>
            <input
              type="radio"
              name="scope"
              checked={scope === 'all'}
              onChange={() => setScope('all')}
            />
            Wszystkie elementy na mapie ({stations.length} stacji, {network.length} odcinków)
          </label>
          <label>
            <input
              type="radio"
              name="scope"
              disabled={!selectionOnly}
              checked={scope === 'selected'}
              onChange={() => setScope('selected')}
            />
            Tylko zaznaczone ({exportSet.size})
          </label>
        </section>

        <div className="modal-columns">
          <section className="modal-section">
            <h4>Kolumny — stacje ({stationRows.length})</h4>
            {STATION_COLUMNS.map((c) => (
              <label key={c.key}>
                <input
                  type="checkbox"
                  checked={stationCols.has(c.key)}
                  onChange={() => toggle(setStationCols, c.key)}
                />
                {c.label}
              </label>
            ))}
          </section>
          <section className="modal-section">
            <h4>Kolumny — odcinki ({segmentRows.length})</h4>
            {SEGMENT_COLUMNS.map((c) => (
              <label key={c.key}>
                <input
                  type="checkbox"
                  checked={segmentCols.has(c.key)}
                  onChange={() => toggle(setSegmentCols, c.key)}
                />
                {c.label}
              </label>
            ))}
          </section>
        </div>

        <footer>
          <button onClick={onClose}>Anuluj</button>
          <button className="primary" onClick={handleExport}>Pobierz CSV</button>
        </footer>
      </div>
    </div>
  )
}
