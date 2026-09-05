import { EARTHQUAKE_RADIUS_MULTIPLIER, VOLCANO_RADIUS_MULTIPLIER, alertRadiusMeters } from '../constants/severity'
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
 * When two earthquakes' alert circles overlap, showing both floods the map
 * with overlapping colour washes and can bury a smaller/older event's
 * marker entirely (the problem this exists to solve). Instead, an event's
 * circle is suppressed if a *more recent* earthquake's circle overlaps it -
 * the newest event in an overlapping cluster "wins" and stays visible by
 * default, with everything else revealed again on zoom-in or selection
 * (handled by the caller, not here).
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
    const eventRadius = eventAlertRadiusMeters(event)

    const hasNewerOverlap = quakes.some((other) => {
      if (other.id === event.id) return false
      const otherTime = other.time?.getTime() ?? 0
      if (otherTime <= eventTime) return false

      const otherRadius = eventAlertRadiusMeters(other)
      const distanceMeters = haversineDistanceKm(event.location, other.location) * 1000
      return distanceMeters < eventRadius + otherRadius
    })

    if (hasNewerOverlap) suppressed.add(event.id)
  }

  return suppressed
}
