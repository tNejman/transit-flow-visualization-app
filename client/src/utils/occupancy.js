
export const OCCUPANCY_BANDS = [
  { min: 0,    max: 500,   color: '#6a8063', weight: 3, label: '0–500' },
  { min: 500,  max: 1000,  color: '#22c55e', weight: 4, label: '500–1000' },
  { min: 1000, max: 1500,  color: '#eab308', weight: 5, label: '1000–1500' },
  { min: 1500, max: 2000,  color: '#f97316', weight: 6, label: '1500–2000' },
  { min: 2000, max: 2500,  color: '#ef4444', weight: 7, label: '2000–2500' },
  { min: 2500, max: Infinity, color: '#7a0404', weight: 8, label: '2500+' }
];

export const NO_DATA_COLOR = '#404040'

export function occupancyBand(pct) {
  return OCCUPANCY_BANDS.find((b) => pct >= b.min && pct < b.max) ?? OCCUPANCY_BANDS[OCCUPANCY_BANDS.length - 1]
}

export function segmentAverage(data) {
  return Math.round((data.occupancyFromTo + data.occupancyToFrom) / 2)
}

export function segmentStyle(data) {
  if (data.noData) {
    return {
      color: NO_DATA_COLOR,
      weight: 3,
      opacity: 0.75,
    }
  }

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
