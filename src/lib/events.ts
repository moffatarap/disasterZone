import {
  earthquakeIntensityToSeverity,
  volcanoLevelToSeverity,
} from '../constants/severity'
import { formatDistanceKm, nearestLocality, type LatLng } from './geo'
import type { EarthquakeFeature, VolcanoFeature } from '../types/geonet'
import type { DisasterEvent } from '../types/event'

function parseGeonetTime(origintime: string): Date {
  // GeoNet returns UTC timestamps like "2016-05-14 22:18:05.322000"
  return new Date(`${origintime.replace(' ', 'T')}Z`)
}

// GeoNet's felt-quake feed gives only coordinates and an opaque ID
// (e.g. "2026p666955") - no place name - so we build a human-readable
// description ourselves, the same way GeoNet/USGS phrase their own quake
// summaries.
function describeEarthquakeLocation(point: LatLng): string {
  const { name, distanceKm, bearing } = nearestLocality(point)
  if (distanceKm < 2) return `Near ${name}`
  return `${formatDistanceKm(distanceKm)} ${bearing} of ${name}`
}

export function earthquakeToEvent(feature: EarthquakeFeature): DisasterEvent {
  const [lng, lat] = feature.geometry.coordinates
  const location = { lat, lng }
  const severity = earthquakeIntensityToSeverity(feature.properties.intensity)
  const magnitude = Math.round(feature.properties.magnitude * 10) / 10

  return {
    id: feature.id,
    kind: 'earthquake',
    severity,
    title: describeEarthquakeLocation(location),
    subtitle: feature.properties.publicid,
    location,
    ratingText: `Magnitude ${magnitude}`,
    time: parseGeonetTime(feature.properties.origintime),
    detail: `Depth ${Math.round(feature.properties.depth)}km`,
  }
}

export function volcanoToEvent(feature: VolcanoFeature): DisasterEvent {
  const [lng, lat] = feature.geometry.coordinates
  const severity = volcanoLevelToSeverity(feature.properties.level)

  return {
    id: feature.properties.volcanoID,
    kind: 'volcano',
    severity,
    title: feature.properties.volcanoTitle,
    location: { lat, lng },
    ratingText: `Alert Level ${feature.properties.level}`,
    time: null,
    detail: feature.properties.activity,
  }
}

// Fixed to NZ time regardless of the viewer's device settings - this is a NZ
// disaster app, so a quake's displayed time shouldn't shift depending on
// where in the world the reader's device happens to be set. Uses the IANA
// zone (not a hardcoded UTC+12/13 offset) so NZST/NZDT switch automatically.
// (Spread out as explicit fields rather than dateStyle/timeStyle - the
// Intl spec doesn't allow combining those with timeZoneName.)
const timeFormatter = new Intl.DateTimeFormat('en-NZ', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Pacific/Auckland',
  timeZoneName: 'short',
})

export function formatEventTime(time: Date | null): string {
  return time ? timeFormatter.format(time) : 'Ongoing'
}
