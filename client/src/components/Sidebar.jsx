import Legend from './Legend.jsx'

export default function Sidebar({
  date,
  onDateChange,
  loading,
  dataComplete,
  networkSize,
  stationCount,
  exportCount,
  onExport,
  onClearSelection,
  availableStations,
  displayedStations,
  filterPick,
  onFilterPickChange,
  onAddStation,
  onRemoveStation,
}) {
  return (
    <aside className="sidebar">
      <section className="sidebar-block">
        <h2>Stacje do wyświetlenia</h2>
        <select
          value={filterPick}
          onChange={(e) => onFilterPickChange(e.target.value)}
        >
          <option value="">— wybierz stację —</option>
          {availableStations.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          className="primary full"
          onClick={onAddStation}
          disabled={!filterPick}
        >
          Załaduj
        </button>
        {displayedStations.length > 0 && (
          <ul className="filter-list">
            {displayedStations.map((s) => (
              <li key={s.id}>
                <span>{s.name}</span>
                <button
                  className="icon-btn"
                  onClick={() => onRemoveStation(s.id)}
                  aria-label={`Usuń ${s.name}`}
                  title="Usuń z mapy"
                >×</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sidebar-block">
        <h2>Data</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <div className={`status ${dataComplete ? 'ok' : 'warn'}`}>
          {loading
            ? 'Ładowanie danych…'
            : dataComplete
              ? 'Dane kompletne'
              : 'Dane niepełne — część odcinków estymowana'}
        </div>
        <div className="meta-row">
          <span>{stationCount} stacji</span>
          <span>{networkSize} odcinków</span>
        </div>
      </section>

      <section className="sidebar-block">
        <Legend />
      </section>

      <section className="sidebar-block">
        <h2>Eksport</h2>
        <p className="hint">
          Kliknij stację lub odcinek i oznacz „Uwzględnij w eksporcie CSV".
          Pusta selekcja = eksport widocznych stacji i odcinków.
        </p>
        <div className="meta-row">
          <span>{exportCount} zaznaczonych</span>
          <button onClick={onClearSelection} disabled={exportCount === 0}>
            Wyczyść
          </button>
        </div>
        <button className="primary full" onClick={onExport}>
          Eksportuj do CSV…
        </button>
      </section>
    </aside>
  )
}
