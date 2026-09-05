import { Layer, Source } from 'react-map-gl/maplibre'
import { circlePolygon } from '../lib/geoCircle'

interface AlertCircleProps {
  id: string
  center: { lat: number; lng: number }
  radiusMeters: number
  color: string
}

export function AlertCircle({ id, center, radiusMeters, color }: AlertCircleProps) {
  const data = circlePolygon(center, radiusMeters)

  return (
    <Source id={`circle-${id}`} type="geojson" data={data}>
      <Layer
        id={`circle-fill-${id}`}
        type="fill"
        paint={{ 'fill-color': color, 'fill-opacity': 0.25 }}
      />
      <Layer
        id={`circle-outline-${id}`}
        type="line"
        paint={{ 'line-color': color, 'line-width': 1.5 }}
      />
    </Source>
  )
}
