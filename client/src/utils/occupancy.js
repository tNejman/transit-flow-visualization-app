
export const OCCUPANCY_BANDS = [
  { min: 0,  max: 25,  color: '#22c55e', weight: 3, label: 'Niska (0–25%)' },
  { min: 25, max: 50,  color: '#eab308', weight: 5, label: 'Średnia (25–50%)' },
  { min: 50, max: 75,  color: '#f97316', weight: 7, label: 'Wysoka (50–75%)' },
  { min: 75, max: 101, color: '#ef4444', weight: 9, label: 'Bardzo wysoka (75–100%)' },
]

export const NO_DATA_COLOR = '#6b7280'

export function occupancyBand(pct) {
  return OCCUPANCY_BANDS.find((b) => pct >= b.min && pct < b.max) ?? OCCUPANCY_BANDS[OCCUPANCY_BANDS.length - 1]
}

export function segmentAverage(data) {
  return Math.round((data.occupancyFromTo + data.occupancyToFrom) / 2)
}

export function segmentStyle(data) {
  const avg = segmentAverage(data)
  const band = occupancyBand(avg)
  return {
    color: band.color,
    weight: band.weight,
    opacity: 0.85,
    dashArray: data.estimated ? '8,6' : undefined,
  }
}


export function stationFlow(stationId, networkData) {
  let inflow = 0
  let outflow = 0
  let segmentsTouched = 0
  for (const d of networkData) {
    if (d.routeSegment.stationFrom.id === stationId) {
      outflow += d.occupancyFromTo
      inflow += d.occupancyToFrom
      segmentsTouched++
    } else if (d.routeSegment.stationTo.id === stationId) {
      outflow += d.occupancyToFrom
      inflow += d.occupancyFromTo
      segmentsTouched++
    }
  }
  return { inflow, outflow, segmentsTouched }
}
