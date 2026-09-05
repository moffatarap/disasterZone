import { NZ_LOCALITIES } from '../data/nzLocalities'

export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371.0088

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
export type CompassDirection = (typeof COMPASS_POINTS)[number]

/** 8-point compass direction pointing from `a` towards `b`. */
export function bearingFrom(a: LatLng, b: LatLng): CompassDirection {
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180

  const y = Math.sin(deltaLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng)
  const bearingDeg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360

  const index = Math.round(bearingDeg / 45) % 8
  return COMPASS_POINTS[index]
}

export interface NearestLocalityResult {
  name: string
  distanceKm: number
  bearing: CompassDirection
}

/** Finds the closest bundled NZ town/city to a point, with distance and direction. */
export function nearestLocality(point: LatLng): NearestLocalityResult {
  let closest = NZ_LOCALITIES[0]
  let closestDistance = haversineDistanceKm(point, closest)

  for (const locality of NZ_LOCALITIES) {
    const distance = haversineDistanceKm(point, locality)
    if (distance < closestDistance) {
      closest = locality
      closestDistance = distance
    }
  }

  return {
    name: closest.name,
    distanceKm: closestDistance,
    bearing: bearingFrom(closest, point),
  }
}

export function formatDistanceKm(km: number): string {
  return km < 1 ? '<1km' : `${Math.round(km)}km`
}
