import type { EarthquakeCollection, VolcanoCollection } from '../types/geonet'

const EARTHQUAKE_FELT_URL = 'https://api.geonet.org.nz/quakes/services/felt.json'
const VOLCANO_ALERT_LEVEL_URL = 'https://api.geonet.org.nz/volcano/val'

export async function fetchFeltEarthquakes(): Promise<EarthquakeCollection> {
  const response = await fetch(EARTHQUAKE_FELT_URL)
  if (!response.ok) {
    throw new Error(`GeoNet earthquake request failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchVolcanoAlertLevels(): Promise<VolcanoCollection> {
  const response = await fetch(VOLCANO_ALERT_LEVEL_URL)
  if (!response.ok) {
    throw new Error(`GeoNet volcano request failed: ${response.status}`)
  }
  return response.json()
}
