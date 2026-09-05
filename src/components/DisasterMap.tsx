import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { NavigationControl, type MapRef, type ViewStateChangeEvent } from 'react-map-gl/maplibre'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SEVERITY_COLORS } from '../constants/severity'
import type { UserLocation } from '../hooks/useGeolocation'
import { computeStackedCircleSuppressions, eventAlertRadiusMeters } from '../lib/circleDensity'
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
  newEventIds: Set<string>
}

// New Zealand-wide overview shown before the user's location resolves.
const DEFAULT_VIEW = { longitude: 174.7, latitude: -41.2, zoom: 5 }

// Esri's free "World Dark Gray Canvas" basemap - no API key/billing, unlike
// the original's Google Maps setup - chosen (over plain OSM's bright default
// green/yellow styling) to match the app's dark navy chrome, and it makes
// the severity-coloured markers/circles read more vividly against it.
// (CARTO's equivalent dark tiles now require an API key - verified by
// actually inspecting a fetched tile's image content, not just its HTTP
// status, since they return a 200 "API KEY REQUIRED" watermark tile instead
// of an error.) Esri splits base terrain and place-name labels into two
// separate raster layers, stacked here; note ArcGIS's tile URLs order
// {z}/{y}/{x} (row before column) - reversed from every other provider's
// standard {z}/{x}/{y} - easy to get backwards.
const ESRI_DARK_GRAY_BASE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const ESRI_DARK_GRAY_LABELS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION = 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community'

const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    basemap: {
      type: 'raster',
      tiles: [ESRI_DARK_GRAY_BASE],
      tileSize: 256,
      attribution: ESRI_ATTRIBUTION,
    },
    labels: {
      type: 'raster',
      tiles: [ESRI_DARK_GRAY_LABELS],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'basemap', type: 'raster', source: 'basemap' },
    { id: 'labels', type: 'raster', source: 'labels' },
  ],
}

// At or above this zoom, alert circles are shown unconditionally - you're
// looking closely enough at one area that overlap-declutter no longer
// matters, and it matches the zoom flyTo already uses for a selected event.
const ZOOM_SHOW_ALL_CIRCLES = 9

export function DisasterMap({
  userLocation,
  events,
  selectedEvent,
  onSelectEvent,
  onDeselectEvent,
  newEventIds,
}: DisasterMapProps) {
  const mapRef = useRef<MapRef>(null)
  const hasCenteredOnUser = useRef(false)
  const [zoom, setZoom] = useState(DEFAULT_VIEW.zoom)

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

  // Only earthquakes get suppressed (see computeStackedCircleSuppressions) -
  // recomputed whenever the event list changes, not on every render.
  const suppressedCircleIds = useMemo(() => computeStackedCircleSuppressions(events), [events])

  const visibleCircleEvents =
    zoom >= ZOOM_SHOW_ALL_CIRCLES
      ? events
      : events.filter(
          (event) => event.id === selectedEvent?.id || !suppressedCircleIds.has(event.id),
        )

  return (
    // MapLibre's own zoom/compass buttons default to 29x29px - grown here to
    // a 44x44px touch target (WCAG 2.5.5) via a wrapper div, since <Map>
    // doesn't forward className to its own container. The icon glyph inside
    // stays its normal size (centered via background-position), same
    // invisible-padding approach used for the map markers.
    // `!` (important) is required: maplibre-gl.css sets width/height as plain,
    // unlayered CSS, which always beats a Tailwind utility (Tailwind wraps
    // utilities in @layer, and unlayered rules win over layered ones
    // regardless of specificity) unless marked important.
    <div className="h-full w-full [&_.maplibregl-ctrl-group_button]:!h-11 [&_.maplibregl-ctrl-group_button]:!w-11">
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={BASEMAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={onDeselectEvent}
        onZoomEnd={(evt: ViewStateChangeEvent) => setZoom(evt.viewState.zoom)}
      >
        <NavigationControl position="bottom-left" />

        {visibleCircleEvents.map((event) => (
          <AlertCircle
            key={`circle-${event.id}`}
            id={event.id}
            center={event.location}
            radiusMeters={eventAlertRadiusMeters(event)}
            color={SEVERITY_COLORS[event.severity]}
          />
        ))}

        {events.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            isSelected={event.id === selectedEvent?.id}
            isNew={newEventIds.has(event.id)}
            onSelect={onSelectEvent}
          />
        ))}

        {selectedEvent && (
          <EventDetailPopup
            event={selectedEvent}
            userLocation={userLocation}
            onClose={onDeselectEvent}
          />
        )}
      </Map>
    </div>
  )
}
