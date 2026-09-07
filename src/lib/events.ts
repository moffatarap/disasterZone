import {
  earthquakeIntensityToSeverity,
  volcanoLevelToSeverity,
} from '../constants/severity'
import { withMaoriName } from '../constants/maoriPlaceNames'
import { formatDistanceKm, nearestLocality, type CompassDirection } from './geo'
import type { EarthquakeFeature, VolcanoFeature } from '../types/geonet'
import type { DisasterEvent } from '../types/event'

function parseGeonetTime(origintime: string): Date {
  // GeoNet returns UTC timestamps like "2016-05-14 22:18:05.322000"
  return new Date(`${origintime.replace(' ', 'T')}Z`)
}

// The felt-quake feed has no place name, so we build one from the nearest
// locality. withMaoriName() adds "Māori (English)" for the few localities
// with a recorded dual name (see constants/maoriPlaceNames.ts).
function describeEarthquakeLocation(name: string, distanceKm: number, bearing: CompassDirection): string {
  const displayName = withMaoriName(name)
  if (distanceKm < 2) return `Near ${displayName}`
  return `${formatDistanceKm(distanceKm)} ${bearing} of ${displayName}`
}

export function earthquakeToEvent(feature: EarthquakeFeature): DisasterEvent {
  const [lng, lat] = feature.geometry.coordinates
  const location = { lat, lng }
  const severity = earthquakeIntensityToSeverity(feature.properties.intensity)
  const magnitude = Math.round(feature.properties.magnitude * 10) / 10
  const { name: localityName, distanceKm, bearing } = nearestLocality(location)

  return {
    id: feature.id,
    kind: 'earthquake',
    severity,
    title: describeEarthquakeLocation(localityName, distanceKm, bearing),
    subtitle: feature.properties.publicid,
    location,
    ratingText: `Magnitude ${magnitude}`,
    time: parseGeonetTime(feature.properties.origintime),
    detail: `Depth ${Math.round(feature.properties.depth)}km`,
    // EventDetailPopup looks up a curated photo by this name (constants/cityImages.ts).
    nearestLocalityName: localityName,
  }
}

export function volcanoToEvent(feature: VolcanoFeature): DisasterEvent {
  const [lng, lat] = feature.geometry.coordinates
  const severity = volcanoLevelToSeverity(feature.properties.level)

  return {
    id: feature.properties.volcanoID,
    kind: 'volcano',
    severity,
    title: withMaoriName(feature.properties.volcanoTitle),
    location: { lat, lng },
    ratingText: `Alert Level ${feature.properties.level}`,
    time: null,
    detail: feature.properties.activity,
  }
}

// No direct "is this device 24-hour" API, but the default-locale formatter
// reflects that OS setting, so borrow its hourCycle.
function detectPreferredHourCycle(): Intl.DateTimeFormatOptions['hourCycle'] {
  if (typeof navigator === 'undefined') return 'h12'
  try {
    return new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions()
      .hourCycle
  } catch {
    return 'h12'
  }
}

// Fixed to NZ time (IANA zone, so NZST/NZDT switch automatically) regardless
// of the viewer's device; only 12h/24h follows the device. See
// docs/DECISIONS.md. Explicit fields, not dateStyle/timeStyle - those can't
// combine with timeZoneName.
const timeFormatter = new Intl.DateTimeFormat('en-NZ', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hourCycle: detectPreferredHourCycle(),
  timeZone: 'Pacific/Auckland',
  timeZoneName: 'short',
})

export function formatEventTime(time: Date | null): string {
  return time ? timeFormatter.format(time) : 'Ongoing'
}
