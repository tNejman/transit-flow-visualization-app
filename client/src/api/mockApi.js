
import { stations, segments, stationById, segmentById } from '../data/network.js'

const LATENCY_MS = 80

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fnv1a(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function hashed(seed, salt) {
  return fnv1a(`${seed}|${salt}`) % 10000 / 10000
}

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}


function segmentBase(segment) {
  const fromW = segment.stationFromId === 'stn-wawa-c' || segment.stationToId === 'stn-wawa-c'
  const majorHub = ['stn-krakow-gl', 'stn-poznan-gl', 'stn-wroclaw-gl', 'stn-gdansk-gl', 'stn-katowice']
  const hubBoost = majorHub.includes(segment.stationFromId) || majorHub.includes(segment.stationToId) ? 15 : 0
  return 40 + (fromW ? 20 : 0) + hubBoost
}

function computeOccupancy(segment, dateISO) {
  const date = parseDate(dateISO)
  const dow = date.getUTCDay() // 0 = Sunday
  const weekdayBoost = dow === 5 ? 15 : dow === 0 ? 10 : dow >= 1 && dow <= 4 ? 0 : -5
  const base = segmentBase(segment) + weekdayBoost

  const jitterFrom = (hashed(segment.id, dateISO + ':from') - 0.5) * 30
  const jitterTo = (hashed(segment.id, dateISO + ':to') - 0.5) * 30

  const from = Math.max(0, Math.min(100, Math.round(base + jitterFrom)))
  const to = Math.max(0, Math.min(100, Math.round(base + jitterTo)))
  return { from, to }
}

function isEstimated(segment, dateISO) {
  return hashed(segment.id, dateISO + ':est') < 0.08
}

function hasDataForDate(dateISO) {
  const now = parseDate(todayISO())
  const target = parseDate(dateISO)
  const diffDays = (target - now) / 86_400_000
  return diffDays <= 0 && diffDays >= -180
}

function buildSegmentData(segment, dateISO) {
  if (!hasDataForDate(dateISO)) return null
  const { from, to } = computeOccupancy(segment, dateISO)
  const estimated = isEstimated(segment, dateISO)
  return {
    id: `rsd-${segment.id}-${dateISO}`,
    routeSegment: {
      id: segment.id,
      stationFrom: stationById[segment.stationFromId],
      stationTo: stationById[segment.stationToId],
    },
    occupancyFromTo: from,
    occupancyToFrom: to,
    snapshotTime: `${dateISO}T03:30:00Z`,
    eventTime: dateISO,
    estimated,
  }
}

export async function getNodes() {
  await sleep(LATENCY_MS)
  return stations.map((s) => ({ ...s, location: { ...s.location } }))
}

export async function getNode(id) {
  await sleep(LATENCY_MS)
  const s = stationById[id]
  if (!s) throw new Error(`Station ${id} not found`)
  return { ...s, location: { ...s.location } }
}

export async function getNetwork(dateISO) {
  await sleep(LATENCY_MS)
  return segments.map((seg) => buildSegmentData(seg, dateISO)).filter(Boolean)
}

export async function getSegmentDetails(id, dateISO) {
  await sleep(LATENCY_MS)
  const seg = segmentById[id]
  if (!seg) throw new Error(`Segment ${id} not found`)
  const data = buildSegmentData(seg, dateISO)
  if (!data) throw new Error(`No data for segment ${id} on ${dateISO}`)
  return data
}

export async function getSegmentsForNode(nodeId, dateISO) {
  await sleep(LATENCY_MS)
  const attached = segments.filter(
    (s) => s.stationFromId === nodeId || s.stationToId === nodeId,
  )
  return attached.map((seg) => buildSegmentData(seg, dateISO)).filter(Boolean)
}

export async function getStatus(dateISO) {
  await sleep(LATENCY_MS)
  if (!hasDataForDate(dateISO)) return false
  return !segments.some((seg) => isEstimated(seg, dateISO))
}
