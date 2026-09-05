import {
  earthquakeIntensityToSeverity,
  volcanoLevelToSeverity,
} from '../constants/severity'
import type { EarthquakeFeature, VolcanoFeature } from '../types/geonet'
import type { DisasterEvent } from '../types/event'

function parseGeonetTime(origintime: string): Date {
  // GeoNet returns UTC timestamps like "2016-05-14 22:18:05.322000"
  return new Date(`${origintime.replace(' ', 'T')}Z`)
}

export function earthquakeToEvent(feature: EarthquakeFeature): DisasterEvent {
  const [lng, lat] = feature.geometry.coordinates
  const severity = earthquakeIntensityToSeverity(feature.properties.intensity)
  const magnitude = Math.round(feature.properties.magnitude * 10) / 10

  return {
    id: feature.id,
    kind: 'earthquake',
    severity,
    title: feature.properties.publicid,
    location: { lat, lng },
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

const timeFormatter = new Intl.DateTimeFormat('en-NZ', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatEventTime(time: Date | null): string {
  return time ? timeFormatter.format(time) : 'Ongoing'
}
