import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Layer, NavigationControl, Source, type MapRef } from 'react-map-gl/maplibre'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SEVERITY_COLORS } from '../constants/severity'
import type { UserLocation } from '../hooks/useGeolocation'
import { computeStackedCircleSuppressions, eventAlertRadiusMeters } from '../lib/circleDensity'
import type { DisasterEvent } from '../types/event'
import { AlertCircle } from './AlertCircle'
import { EventDetailPopup } from './EventDetailPopup'
import { EventMarker } from './EventMarker'
import { UserLocationMarker } from './UserLocationMarker'

interface DisasterMapProps {
  userLocation: UserLocation | null
  events: DisasterEvent[]
  selectedEvent: DisasterEvent | null
  onSelectEvent: (event: DisasterEvent) => void
  onDeselectEvent: () => void
  newEventIds: Set<string>
  /** id -> 1-based recency rank for the newest few felt quakes. */
  latestQuakeRanks: Map<string, number>
  showFaultLines: boolean
}

// GNS Science's NZ Active Faults Database (1:250,000), flattened to one
// static file (~500KB gzipped) so no live service is needed. Fetched lazily
// on first toggle-on, not at page load - most sessions never enable it.
// BASE_URL prefix so it resolves under the Pages project path.
const FAULT_LINES_URL = `${import.meta.env.BASE_URL}data/nz-active-faults.geojson`

// New Zealand-wide overview shown before the user's location resolves.
const DEFAULT_VIEW = { longitude: 174.7, latitude: -41.2, zoom: 5 }

// Esri "World Dark Gray Canvas" - free, no API key (see docs/DECISIONS.md).
// Base terrain and place-name labels are two separate raster layers, stacked
// below. Note: ArcGIS tile URLs order {z}/{y}/{x}, not the usual {z}/{x}/{y}.
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

export function DisasterMap({
  userLocation,
  events,
  selectedEvent,
  onSelectEvent,
  onDeselectEvent,
  newEventIds,
  latestQuakeRanks,
  showFaultLines,
}: DisasterMapProps) {
  const mapRef = useRef<MapRef>(null)
  const hasCenteredOnUser = useRef(false)
  const [faultLinesData, setFaultLinesData] = useState<GeoJSON.FeatureCollection | null>(null)

  // Fetched once, on first toggle-on - most sessions never enable this.
  useEffect(() => {
    if (!showFaultLines || faultLinesData) return
    fetch(FAULT_LINES_URL)
      .then((response) => response.json())
      .then(setFaultLinesData)
      .catch(() => {
        // Optional layer - a failed fetch just shows nothing.
      })
  }, [showFaultLines, faultLinesData])

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

  // Earthquakes only (see computeStackedCircleSuppressions); recomputed only
  // when the event list changes.
  const suppressedCircleIds = useMemo(() => computeStackedCircleSuppressions(events), [events])

  // Suppression uses a real epicenter-to-epicenter distance (see
  // circleDensity.ts), so it applies at every zoom level. Selecting an event
  // always reveals its circle. Inactive volcanoes ('none') never get one - a
  // 6.5km ring on a dormant cone is just noise.
  const visibleCircleEvents = events.filter(
    (event) =>
      !(event.kind === 'volcano' && event.severity === 'none') &&
      (event.id === selectedEvent?.id || !suppressedCircleIds.has(event.id)),
  )

  return (
    // Restyling library-rendered controls to match the dark popup card: the
    // zoom control gets slate-900/ring/shadow and its glyphs are forced white
    // (brightness-0 then invert). Buttons are a 40px touch target on mobile,
    // 44px (WCAG 2.5.5) from sm: up. The attribution link gets an underline so
    // it's distinguishable without colour (WCAG 1.4.1 - it measured 2.02:1
    // over the map). `!` is needed because maplibre-gl.css ships unlayered
    // rules that outrank Tailwind's @layer utilities.
    <div className="h-full w-full [&_.maplibregl-ctrl-attrib_a]:!underline [&_.maplibregl-ctrl-group]:!overflow-hidden [&_.maplibregl-ctrl-group]:!rounded-lg [&_.maplibregl-ctrl-group]:!bg-slate-900/95 [&_.maplibregl-ctrl-group]:!shadow-xl [&_.maplibregl-ctrl-group]:!ring-1 [&_.maplibregl-ctrl-group]:!ring-white/10 [&_.maplibregl-ctrl-group_button]:!h-10 [&_.maplibregl-ctrl-group_button]:!w-10 sm:[&_.maplibregl-ctrl-group_button]:!h-11 sm:[&_.maplibregl-ctrl-group_button]:!w-11 [&_.maplibregl-ctrl-group_button+button]:!border-t [&_.maplibregl-ctrl-group_button+button]:!border-white/10 [&_.maplibregl-ctrl-group_button:hover]:!bg-white/10 [&_.maplibregl-ctrl-icon]:!brightness-0 [&_.maplibregl-ctrl-icon]:!invert">
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={BASEMAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={onDeselectEvent}
        // North-locked: no drag-rotate, no pitch. touchZoomRotate stays on for
        // pinch-zoom but its rotation is disabled on load (below).
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        onLoad={(event) => event.target.touchZoomRotate.disableRotation()}
      >
        <NavigationControl position="bottom-left" showCompass={false} />

        {/* Declared before every hazard marker/circle below, so MapLibre
            stacks it underneath them - reads as background context, never
            competing with the map's actual purpose. */}
        {showFaultLines && faultLinesData && (
          <Source id="nz-active-faults" type="geojson" data={faultLinesData}>
            <Layer
              id="nz-active-faults-line"
              type="line"
              paint={{ 'line-color': '#94a3b8', 'line-width': 1.25, 'line-opacity': 0.65 }}
            />
          </Source>
        )}

        {userLocation && <UserLocationMarker location={userLocation} />}

        {visibleCircleEvents.map((event) => (
          <AlertCircle
            key={`circle-${event.id}`}
            id={event.id}
            center={event.location}
            radiusMeters={eventAlertRadiusMeters(event)}
            color={SEVERITY_COLORS[event.severity]}
          />
        ))}

        {/* `events` arrives newest-first (App.tsx sorts earthquakes that way
            for the sidebar's benefit) - rendered in that order, the newest
            marker would be earliest in the DOM and so paint *underneath*
            every older one it overlaps, backwards from the intended "newest
            on top". Reversed here, for marker stacking only, so the last
            one painted - and therefore the one on top - is the newest. */}
        {[...events].reverse().map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            isSelected={event.id === selectedEvent?.id}
            isNew={newEventIds.has(event.id)}
            rank={latestQuakeRanks.get(event.id)}
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
