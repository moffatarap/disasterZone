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
  showFaultLines: boolean
}

// GNS Science's NZ Active Faults Database (1:250,000 scale), fetched from
// their public ArcGIS feature service and flattened into one static file
// (500 named faults, merged from ~10,000 digitized segments) rather than
// queried live - the geometry barely changes, and this avoids depending on
// an external service the same way the basemap already avoids CARTO's key
// requirement. At ~500KB gzipped it's meaningfully heavier than any other
// asset here, so it's fetched lazily on first toggle-on (see the effect
// below), not bundled into the initial page load.
const FAULT_LINES_URL = '/data/nz-active-faults.geojson'

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

export function DisasterMap({
  userLocation,
  events,
  selectedEvent,
  onSelectEvent,
  onDeselectEvent,
  newEventIds,
  showFaultLines,
}: DisasterMapProps) {
  const mapRef = useRef<MapRef>(null)
  const hasCenteredOnUser = useRef(false)
  const [faultLinesData, setFaultLinesData] = useState<GeoJSON.FeatureCollection | null>(null)

  // Fetched once, the first time the toggle is switched on - not on initial
  // load regardless of toggle state, since most sessions will never turn
  // this on and shouldn't pay for it.
  useEffect(() => {
    if (!showFaultLines || faultLinesData) return
    fetch(FAULT_LINES_URL)
      .then((response) => response.json())
      .then(setFaultLinesData)
      .catch(() => {
        // Optional reference layer - a failed fetch just means the toggle
        // silently shows nothing, not worth surfacing as an app error.
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

  // Only earthquakes get suppressed (see computeStackedCircleSuppressions) -
  // recomputed whenever the event list changes, not on every render.
  const suppressedCircleIds = useMemo(() => computeStackedCircleSuppressions(events), [events])

  // Applies at every zoom level, not just zoomed-out - the suppression
  // distance is now a real epicenter-to-epicenter threshold (20-50km, see
  // circleDensity.ts), not the old inflated-visual-radius test, so two
  // genuinely nearby quakes still clutter each other's circles even zoomed
  // in close. Selecting an event still always reveals its circle regardless.
  const visibleCircleEvents = events.filter(
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
    //
    // The attribution link gets the same treatment for a different reason:
    // an axe-core audit flagged it as failing "distinguishable without
    // relying on color" (WCAG 1.4.1) - MapLibre's default styles give it
    // color:rgba(0,0,0,.75) and no underline, and against the semi-
    // transparent attribution bar sitting over a dark map, that measured
    // as low as 2.02:1 in this app with no other visual distinction from
    // the surrounding text. An underline resolves it regardless of the
    // exact background it ends up over.
    <div className="h-full w-full [&_.maplibregl-ctrl-attrib_a]:!underline [&_.maplibregl-ctrl-group_button]:!h-11 [&_.maplibregl-ctrl-group_button]:!w-11">
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={BASEMAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={onDeselectEvent}
      >
        <NavigationControl position="bottom-left" />

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
