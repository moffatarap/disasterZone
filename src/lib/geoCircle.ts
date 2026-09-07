// Builds a geodesic circle polygon so alert-radius circles are accurate in
// real metres and scale correctly with the map.

import type { Feature, Polygon } from 'geojson'

const EARTH_RADIUS_METERS = 6_371_008.8

export function circlePolygon(
  center: { lat: number; lng: number },
  radiusMeters: number,
  steps = 64,
): Feature<Polygon> {
  const centerLatRad = (center.lat * Math.PI) / 180
  const centerLngRad = (center.lng * Math.PI) / 180
  const angularDistance = radiusMeters / EARTH_RADIUS_METERS

  const coordinates: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI
    const pointLatRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(angularDistance) +
        Math.cos(centerLatRad) * Math.sin(angularDistance) * Math.cos(bearing),
    )
    const pointLngRad =
      centerLngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(centerLatRad),
        Math.cos(angularDistance) - Math.sin(centerLatRad) * Math.sin(pointLatRad),
      )

    coordinates.push([(pointLngRad * 180) / Math.PI, (pointLatRad * 180) / Math.PI])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  }
}
