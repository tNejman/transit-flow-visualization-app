export const stations = [
  { id: 'stn-wawa-c',     name: 'Warszawa Centralna', location: { lat: 52.2285, lng: 21.0037 } },
  { id: 'stn-krakow-gl',  name: 'Kraków Główny',      location: { lat: 50.0681, lng: 19.9478 } },
  { id: 'stn-gdansk-gl',  name: 'Gdańsk Główny',      location: { lat: 54.3556, lng: 18.6442 } },
  { id: 'stn-gdynia-gl',  name: 'Gdynia Główna',      location: { lat: 54.5186, lng: 18.5305 } },
  { id: 'stn-poznan-gl',  name: 'Poznań Główny',      location: { lat: 52.4012, lng: 16.9114 } },
  { id: 'stn-wroclaw-gl', name: 'Wrocław Główny',     location: { lat: 51.0984, lng: 17.0361 } },
  { id: 'stn-lodz-f',     name: 'Łódź Fabryczna',     location: { lat: 51.7687, lng: 19.4712 } },
  { id: 'stn-katowice',   name: 'Katowice',           location: { lat: 50.2584, lng: 19.0168 } },
  { id: 'stn-szczecin-gl',name: 'Szczecin Główny',    location: { lat: 53.4182, lng: 14.5515 } },
  { id: 'stn-bydgoszcz',  name: 'Bydgoszcz Główna',   location: { lat: 53.1336, lng: 18.0103 } },
  { id: 'stn-lublin-gl',  name: 'Lublin Główny',      location: { lat: 51.2375, lng: 22.5686 } },
  { id: 'stn-bialystok',  name: 'Białystok',          location: { lat: 53.1418, lng: 23.1706 } },
  { id: 'stn-olsztyn-gl', name: 'Olsztyn Główny',     location: { lat: 53.7732, lng: 20.4870 } },
  { id: 'stn-torun-gl',   name: 'Toruń Główny',       location: { lat: 53.0097, lng: 18.5988 } },
  { id: 'stn-rzeszow-gl', name: 'Rzeszów Główny',     location: { lat: 50.0413, lng: 22.0047 } },
  { id: 'stn-czestochowa',name: 'Częstochowa',        location: { lat: 50.8127, lng: 19.1226 } },
  { id: 'stn-kielce',     name: 'Kielce',             location: { lat: 50.8703, lng: 20.6232 } },
  { id: 'stn-opole',      name: 'Opole Główne',       location: { lat: 50.6683, lng: 17.9391 } },
  { id: 'stn-radom',      name: 'Radom',              location: { lat: 51.4017, lng: 21.1464 } },
  { id: 'stn-przemysl',   name: 'Przemyśl Główny',    location: { lat: 49.7832, lng: 22.7767 } },
]

const edges = [
  ['stn-wawa-c',     'stn-lodz-f'],
  ['stn-wawa-c',     'stn-radom'],
  ['stn-wawa-c',     'stn-lublin-gl'],
  ['stn-wawa-c',     'stn-bialystok'],
  ['stn-wawa-c',     'stn-olsztyn-gl'],
  ['stn-wawa-c',     'stn-poznan-gl'],
  ['stn-wawa-c',     'stn-gdansk-gl'],
  ['stn-wawa-c',     'stn-katowice'],
  ['stn-wawa-c',     'stn-krakow-gl'],
  ['stn-wawa-c',     'stn-torun-gl'],
  ['stn-radom',      'stn-kielce'],
  ['stn-kielce',     'stn-krakow-gl'],
  ['stn-lodz-f',     'stn-wroclaw-gl'],
  ['stn-lodz-f',     'stn-poznan-gl'],
  ['stn-poznan-gl',  'stn-szczecin-gl'],
  ['stn-poznan-gl',  'stn-wroclaw-gl'],
  ['stn-poznan-gl',  'stn-gdansk-gl'],
  ['stn-poznan-gl',  'stn-bydgoszcz'],
  ['stn-bydgoszcz',  'stn-torun-gl'],
  ['stn-bydgoszcz',  'stn-gdansk-gl'],
  ['stn-gdansk-gl',  'stn-gdynia-gl'],
  ['stn-gdansk-gl',  'stn-szczecin-gl'],
  ['stn-wroclaw-gl', 'stn-opole'],
  ['stn-opole',      'stn-katowice'],
  ['stn-katowice',   'stn-krakow-gl'],
  ['stn-katowice',   'stn-czestochowa'],
  ['stn-czestochowa','stn-wawa-c'],
  ['stn-krakow-gl',  'stn-rzeszow-gl'],
  ['stn-rzeszow-gl', 'stn-przemysl'],
]

export const segments = edges.map(([fromId, toId], idx) => {
  const [a, b] = fromId < toId ? [fromId, toId] : [toId, fromId]
  return { id: `seg-${String(idx + 1).padStart(3, '0')}`, stationFromId: a, stationToId: b }
})

export const stationById = Object.fromEntries(stations.map((s) => [s.id, s]))
export const segmentById = Object.fromEntries(segments.map((s) => [s.id, s]))
