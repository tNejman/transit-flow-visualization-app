import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import PolandMap from './components/PolandMap.jsx'
import Sidebar from './components/Sidebar.jsx'
import DetailsPanel from './components/DetailsPanel.jsx'
import ExportDialog from './components/ExportDialog.jsx'
import * as api from './api/mockApi.js'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function App() {
  const [date, setDate] = useState(todayISO)
  const [stations, setStations] = useState([])
  const [network, setNetwork] = useState([])
  const [dataComplete, setDataComplete] = useState(true)
  const [loadedDate, setLoadedDate] = useState(null)
  const [selection, setSelection] = useState(null)
  const [exportSet, setExportSet] = useState(() => new Set())
  const [showExport, setShowExport] = useState(false)
  const [filterPick, setFilterPick] = useState('')
  const [displayedIds, setDisplayedIds] = useState(() => new Set())
  const fetchToken = useRef(0)

  useEffect(() => {
    let cancelled = false
    api.getNodes().then((nodes) => {
      if (!cancelled) setStations(nodes)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const token = ++fetchToken.current
    Promise.all([api.getNetwork(date), api.getStatus(date)])
      .then(([segs, complete]) => {
        if (token !== fetchToken.current) return
        setNetwork(segs)
        setDataComplete(complete)
        setLoadedDate(date)
      })
  }, [date])

  const handleToggleExport = useCallback((key, include) => {
    setExportSet((prev) => {
      const next = new Set(prev)
      if (include) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])

  const handleClearSelection = useCallback(() => setExportSet(new Set()), [])

  const handleAddStation = useCallback(() => {
    if (!filterPick) return
    setDisplayedIds((prev) => {
      const next = new Set(prev)
      next.add(filterPick)
      return next
    })
    setFilterPick('')
  }, [filterPick])

  const handleRemoveStation = useCallback((id) => {
    setDisplayedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const visibleStations = useMemo(
    () => stations.filter((s) => displayedIds.has(s.id)),
    [stations, displayedIds],
  )

  const visibleNetwork = useMemo(
    () =>
      network.filter(
        (d) =>
          displayedIds.has(d.routeSegment.stationFrom.id) &&
          displayedIds.has(d.routeSegment.stationTo.id),
      ),
    [network, displayedIds],
  )

  const availableStations = useMemo(
    () => stations.filter((s) => !displayedIds.has(s.id)),
    [stations, displayedIds],
  )

  const effectiveSelection = useMemo(() => {
    if (!selection) return null
    if (selection.type === 'station') {
      return visibleStations.some((s) => s.id === selection.id) ? selection : null
    }
    if (selection.type === 'segment') {
      return visibleNetwork.some((d) => d.routeSegment.id === selection.id) ? selection : null
    }
    return selection
  }, [selection, visibleStations, visibleNetwork])

  const loading = loadedDate !== date
  const stationCount = visibleStations.length
  const networkSize = visibleNetwork.length
  const exportCount = exportSet.size

  const emptyFilter = displayedIds.size === 0
  const noDateData = !loading && !emptyFilter && network.length === 0

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="logo">◈</span>
          <span className="subtitle">Pasażerski ruch kolejowy PKP Intercity</span>
        </div>
      </header>

      <Sidebar
        date={date}
        onDateChange={setDate}
        loading={loading}
        dataComplete={dataComplete}
        stationCount={stationCount}
        networkSize={networkSize}
        exportCount={exportCount}
        onExport={() => setShowExport(true)}
        onClearSelection={handleClearSelection}
        availableStations={availableStations}
        displayedStations={visibleStations}
        filterPick={filterPick}
        onFilterPickChange={setFilterPick}
        onAddStation={handleAddStation}
        onRemoveStation={handleRemoveStation}
      />

      <main className="map-wrap">
        <PolandMap
          stations={visibleStations}
          network={visibleNetwork}
          selection={effectiveSelection}
          onSelect={setSelection}
        />
        {emptyFilter && (
          <div className="map-overlay">
            Wybierz stację w panelu bocznym, aby wyświetlić ją na mapie.
          </div>
        )}
        {noDateData && (
          <div className="map-overlay">
            Brak danych dla wybranej daty. Spróbuj wybrać inny dzień.
          </div>
        )}
        <div className="details-slot">
          <DetailsPanel
            selection={effectiveSelection}
            network={visibleNetwork}
            stations={visibleStations}
            exportSet={exportSet}
            onToggleExport={handleToggleExport}
            onClose={() => setSelection(null)}
          />
        </div>
      </main>

      {showExport && (
        <ExportDialog
          date={date}
          stations={visibleStations}
          network={visibleNetwork}
          exportSet={exportSet}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
