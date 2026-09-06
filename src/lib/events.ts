import {
  earthquakeIntensityToSeverity,
  volcanoLevelToSeverity,
} from '../constants/severity'
import { formatDistanceKm, nearestLocality, type CompassDirection } from './geo'
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
function describeEarthquakeLocation(name: string, distanceKm: number, bearing: CompassDirection): string {
  if (distanceKm < 2) return `Near ${name}`
  return `${formatDistanceKm(distanceKm)} ${bearing} of ${name}`
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
    // Reused by EventDetailPopup to look up a curated illustrative photo
    // for the nearest major city, when one exists - see constants/cityImages.ts.
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
    title: feature.properties.volcanoTitle,
    location: { lat, lng },
    ratingText: `Alert Level ${feature.properties.level}`,
    time: null,
    detail: feature.properties.activity,
  }
}

// There's no direct "is this device set to 24-hour time" API, but a
// browser's default-locale formatter already resolves that preference (an
// OS's 24-hour toggle changes what its default locale reports here) - so we
// borrow its hourCycle rather than hardcoding 12- or 24-hour.
function detectPreferredHourCycle(): Intl.DateTimeFormatOptions['hourCycle'] {
  if (typeof navigator === 'undefined') return 'h12'
  try {
    return new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions()
      .hourCycle
  } catch {
    return 'h12'
  }
}

// Fixed to NZ time regardless of the viewer's device settings - this is a NZ
// disaster app, so a quake's displayed time shouldn't shift depending on
// where in the world the reader's device happens to be set. Uses the IANA
// zone (not a hardcoded UTC+12/13 offset) so NZST/NZDT switch automatically.
// Hour cycle (12h vs 24h) is the one thing that *does* follow the viewer's
// own device setting, per user request.
// (Spread out as explicit fields rather than dateStyle/timeStyle - the
// Intl spec doesn't allow combining those with timeZoneName.)
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
