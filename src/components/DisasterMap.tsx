import { useEffect, useRef } from 'react'
import Map, { NavigationControl, type MapRef } from 'react-map-gl/maplibre'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  EARTHQUAKE_RADIUS_MULTIPLIER,
  SEVERITY_COLORS,
  VOLCANO_RADIUS_MULTIPLIER,
  alertRadiusMeters,
} from '../constants/severity'
import type { UserLocation } from '../hooks/useGeolocation'
import type { DisasterEvent } from '../types/event'
import { AlertCircle } from './AlertCircle'
import { EventDetailPopup } from './EventDetailPopup'
import { EventMarker } from './EventMarker'

interface DisasterMapProps {
  userLocation: UserLocation | null
  events: DisasterEvent[]
  selectedEvent: DisasterEvent | null
  onSelectEvent: (event: DisasterEvent) => void
  onDeselectEvent: () => void
}

// New Zealand-wide overview shown before the user's location resolves.
const DEFAULT_VIEW = { longitude: 174.7, latitude: -41.2, zoom: 5 }

// Raw OSM raster tiles - no API key/billing, unlike the original's Google Maps setup.
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

const RADIUS_MULTIPLIER_BY_KIND = {
  earthquake: EARTHQUAKE_RADIUS_MULTIPLIER,
  volcano: VOLCANO_RADIUS_MULTIPLIER,
} as const

export function DisasterMap({
  userLocation,
  events,
  selectedEvent,
  onSelectEvent,
  onDeselectEvent,
}: DisasterMapProps) {
  const mapRef = useRef<MapRef>(null)
  const hasCenteredOnUser = useRef(false)

  useEffect(() => {
    if (userLocation && !hasCenteredOnUser.current) {
      hasCenteredOnUser.current = true
      mapRef.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 9 })
    }
  }, [userLocation])

  useEffect(() => {
    if (selectedEvent) {
      mapRef.current?.flyTo({
        center: [selectedEvent.location.lng, selectedEvent.location.lat],
        zoom: 9,
      })
    }
  }, [selectedEvent])

  return (
    <Map
      ref={mapRef}
      initialViewState={DEFAULT_VIEW}
      mapStyle={OSM_STYLE}
      style={{ width: '100%', height: '100%' }}
      onClick={onDeselectEvent}
    >
      <NavigationControl position="bottom-left" />

      {events.map((event) => (
        <AlertCircle
          key={`circle-${event.id}`}
          id={event.id}
          center={event.location}
          radiusMeters={alertRadiusMeters(event.severity, RADIUS_MULTIPLIER_BY_KIND[event.kind])}
          color={SEVERITY_COLORS[event.severity]}
        />
      ))}

      {events.map((event) => (
        <EventMarker
          key={event.id}
          event={event}
          isSelected={event.id === selectedEvent?.id}
          onSelect={onSelectEvent}
        />
      ))}

      {selectedEvent && (
        <EventDetailPopup event={selectedEvent} onClose={onDeselectEvent} />
      )}
    </Map>
  )
}
