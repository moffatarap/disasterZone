import {
  EARTHQUAKE_RADIUS_MULTIPLIER,
  SEVERITY_PROXIMITY_SUPPRESSION_KM,
  VOLCANO_RADIUS_MULTIPLIER,
  alertRadiusMeters,
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
 * When two earthquakes happen close together, showing both circles floods
 * the map with overlapping colour washes and can bury a smaller/older
 * event's marker entirely (the problem this exists to solve). An event's
 * circle is suppressed if a *more recent* nearby earthquake exists - the
 * newest event in a cluster "wins" and stays visible by default, with
 * everything else revealed again on zoom-in or selection (handled by the
 * caller, not here).
 *
 * "Nearby" is real epicenter-to-epicenter distance (see
 * SEVERITY_PROXIMITY_SUPPRESSION_KM), not whether the two events' *visual*
 * alert circles happen to overlap on screen - that radius scales with
 * severity multiplier and balloons past 200km for a severe quake, which
 * would suppress unrelated severe quakes on opposite ends of the country
 * just because their inflated circles overlapped.
 *
 * Volcanoes are exempt: there are only ever a handful of fixed, well-known
 * locations, they represent an ongoing alert level rather than a discrete
 * timestamped event, and "more recent" isn't a meaningful comparison for
 * them - the actual crowding problem this targets is earthquake swarms.
 */
export function computeStackedCircleSuppressions(events: DisasterEvent[]): Set<string> {
  const suppressed = new Set<string>()
  const quakes = events.filter((event) => event.kind === 'earthquake')

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
