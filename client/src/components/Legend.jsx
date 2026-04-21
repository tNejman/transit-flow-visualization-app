import { OCCUPANCY_BANDS, NO_DATA_COLOR } from '../utils/occupancy.js'

export default function Legend() {
  return (
    <div className="legend">
      <h3>Zajętość miejsc</h3>
      <ul>
        {OCCUPANCY_BANDS.map((band) => (
          <li key={band.label}>
            <span className="swatch" style={{ background: band.color, height: band.weight }} />
            <span>{band.label}</span>
          </li>
        ))}
        <li>
          <span
            className="swatch dashed"
            style={{ borderTopColor: NO_DATA_COLOR }}
          />
          <span>Dane estymowane (historia)</span>
        </li>
        <li>
          <span className="swatch" style={{ background: NO_DATA_COLOR, height: 3 }} />
          <span>Brak danych</span>
        </li>
      </ul>
    </div>
  )
}
