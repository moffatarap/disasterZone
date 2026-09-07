import {
  EARTHQUAKE_RADIUS_MULTIPLIER,
  SEVERITY_PROXIMITY_SUPPRESSION_KM,
  VOLCANO_RADIUS_MULTIPLIER,
  alertRadiusMeters,
  isSeverityAtLeast,
} from '../constants/severity'
import type { DisasterEvent } from '../types/event'
import { haversineDistanceKm } from './geo'

const RADIUS_MULTIPLIER_BY_KIND = {
  earthquake: EARTHQUAKE_RADIUS_MULTIPLIER,
  volcano: VOLCANO_RADIUS_MULTIPLIER,
} as const

export function eventAlertRadiusMeters(event: DisasterEvent): number {
  return alertRadiusMeters(event.severity, RADIUS_MULTIPLIER_BY_KIND[event.kind])
}

/**
 * The more severe of the two events sets how close together they need to be
 * to count as "the same cluster" - a severe quake's aftershock zone is
 * physically wider than a weak one's.
 */
function suppressionRadiusKm(a: DisasterEvent, b: DisasterEvent): number {
  return Math.max(
    SEVERITY_PROXIMITY_SUPPRESSION_KM[a.severity],
    SEVERITY_PROXIMITY_SUPPRESSION_KM[b.severity],
  )
}

/**
 * Suppresses an earthquake's alert circle when a more recent one exists
 * within SEVERITY_PROXIMITY_SUPPRESSION_KM (real ground distance) - the
 * newest in a cluster wins and stays visible; the caller re-reveals the rest
 * on zoom-in or selection. Only moderate-and-above quakes take part, on
 * either side; volcanoes are exempt. Rationale in docs/DECISIONS.md.
 */
export function computeStackedCircleSuppressions(events: DisasterEvent[]): Set<string> {
  const suppressed = new Set<string>()
  const quakes = events.filter(
    (event) => event.kind === 'earthquake' && isSeverityAtLeast(event.severity, 'moderate'),
  )

  for (const event of quakes) {
    const eventTime = event.time?.getTime() ?? 0

    const hasNewerNearby = quakes.some((other) => {
      if (other.id === event.id) return false
      const otherTime = other.time?.getTime() ?? 0
      if (otherTime <= eventTime) return false

      const distanceKm = haversineDistanceKm(event.location, other.location)
      return distanceKm <= suppressionRadiusKm(event, other)
    })

    if (hasNewerNearby) suppressed.add(event.id)
  }

  return suppressed
}
