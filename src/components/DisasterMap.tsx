import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Layer, NavigationControl, Source, type MapRef } from 'react-map-gl/maplibre'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SEVERITY_COLORS } from '../constants/severity'
import type { UserLocation } from '../hooks/useGeolocation'
import { computeStackedCircleSuppressions, eventAlertRadiusMeters } from '../lib/circleDensity'
import { haversineDistanceKm } from '../lib/geo'
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
  /** The >= sm events rail (z-20, 20rem) otherwise buries the attribution. */
  isSidebarOpen: boolean
}

// GNS Science's NZ Active Faults Database (1:250,000), flattened to one
// static file (~500KB gzipped) so no live service is needed. Fetched lazily
// on first toggle-on, not at page load - most sessions never enable it.
// BASE_URL prefix so it resolves under the Pages project path.
const FAULT_LINES_URL = `${import.meta.env.BASE_URL}data/nz-active-faults.geojson`

// New Zealand-wide overview shown before the user's location resolves.
const DEFAULT_VIEW = { longitude: 174.7, latitude: -41.2, zoom: 5 }

// The event popup grows upward from its marker, so a marker left dead-centre
// puts the popup's top - photo and close button - above <main>, where
// overflow-hidden clips it (see App.tsx). Selecting an event reserves this much
// room above the marker instead. Roughly the height of an image popup; the pan
// clamps it to the container so a short window still shows the marker.
//
// This applies at every width. Desktop looks like it has height to spare and
// doesn't: at 1280x900 the popup was clipped by 38px and its close button was
// unclickable, which is exactly what scripts/visual-audit.mjs now guards.
const POPUP_HEADROOM_PX = 460

// The map re-centres whenever the user's location moves at least this far -
// covers a typed address or a fresh GPS fix somewhere new, while ignoring the
// metre-scale drift watchPosition reports when you're holding still.
const RECENTER_THRESHOLD_KM = 0.25

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
  isSidebarOpen,
}: DisasterMapProps) {
  const mapRef = useRef<MapRef>(null)
  const lastCenteredOn = useRef<UserLocation | null>(null)
  // The Map is created asynchronously, so mapRef.current is still null while
  // the first effects run. Both camera effects depend on this so they re-run
  // once there's actually a map to drive - otherwise a location restored from
  // localStorage (a saved manual address, or a cached fix when the watch only
  // errors) never changes identity again and the map stays NZ-wide forever.
  const [mapLoaded, setMapLoaded] = useState(false)
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

  // Centre on the user whenever their location is (re)found - the first fix, a
  // typed address, a fresh "Use my location" fix in a new spot. `userLocation`
  // is App's effectiveLocation, so this covers manual and GPS alike. Sub-250m
  // watchPosition jitter is ignored so the map doesn't drift while you're
  // still; the first centre also zooms in from the NZ-wide default.
  useEffect(() => {
    const map = mapRef.current
    if (!userLocation || !map) return
    // Never yank the camera off an event the user is reading. Their location
    // is still recorded, so closing the popup doesn't drag them back either.
    if (selectedEvent) {
      lastCenteredOn.current = { lat: userLocation.lat, lng: userLocation.lng }
      return
    }

    const previous = lastCenteredOn.current
    if (previous && haversineDistanceKm(previous, userLocation) < RECENTER_THRESHOLD_KM) return

    lastCenteredOn.current = { lat: userLocation.lat, lng: userLocation.lng }
    // Explicit zero padding: a popup that was open may have left the 460px
    // headroom applied, which would push this centring far off-target.
    map.flyTo({
      center: [userLocation.lng, userLocation.lat],
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      ...(previous ? {} : { zoom: 9 }),
    })
    // selectedEvent is read only as a guard; re-running when it changes would
    // re-centre on the user the moment a popup closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, mapLoaded])

  // Depend on the identity of the *selection*, not the event object: App
  // derives selectedEvent with filteredEvents.find(), which returns a fresh
  // object on every GeoNet poll. Keying the effect on that re-ran this - and
  // re-centred the map under an open popup - once a minute.
  const selectedEventId = selectedEvent?.id ?? null
  const selectedLng = selectedEvent?.location.lng ?? null
  const selectedLat = selectedEvent?.location.lat ?? null

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (selectedEventId === null || selectedLng === null || selectedLat === null) {
      // Popup closed - drop any headroom a mobile select applied so panning
      // and pinch-zoom re-centre normally.
      if (map.getPadding().top !== 0) {
        map.easeTo({ padding: { top: 0, bottom: 0, left: 0, right: 0 }, duration: 200 })
      }
      return
    }

    // Pan the marker into the lower part of the view so the popup above it
    // isn't clipped, clamped so the marker itself stays visible on a short one.
    const topPadding = Math.max(
      0,
      Math.min(POPUP_HEADROOM_PX, map.getContainer().clientHeight - 180),
    )

    map.flyTo({
      center: [selectedLng, selectedLat],
      zoom: 9,
      padding: { top: topPadding, bottom: 0, left: 0, right: 0 },
    })
  }, [selectedEventId, selectedLng, selectedLat, mapLoaded])

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
    // over the map). Both bottom control stacks are lifted clear of the
    // full-width location bar (see LocationStatus). `!` is needed because
    // maplibre-gl.css ships unlayered rules that outrank Tailwind's @layer
    // utilities.
    <div className={`${
      // The attribution lives bottom-right, where the events rail covers it
      // completely at >= sm - the map credit has to stay reachable, so it ends
      // short of the rail while it's open.
      isSidebarOpen ? 'sm:[&_.maplibregl-ctrl-bottom-right]:!right-[21rem]' : ''
    } h-full w-full [&_.maplibregl-ctrl-attrib_a]:!underline [&_.maplibregl-ctrl-bottom-left]:!bottom-16 [&_.maplibregl-ctrl-bottom-right]:!bottom-16 [&_.maplibregl-ctrl-group]:!overflow-hidden [&_.maplibregl-ctrl-group]:!rounded-lg [&_.maplibregl-ctrl-group]:!bg-slate-900/95 [&_.maplibregl-ctrl-group]:!shadow-xl [&_.maplibregl-ctrl-group]:!ring-1 [&_.maplibregl-ctrl-group]:!ring-white/10 [&_.maplibregl-ctrl-group_button]:!h-10 [&_.maplibregl-ctrl-group_button]:!w-10 sm:[&_.maplibregl-ctrl-group_button]:!h-11 sm:[&_.maplibregl-ctrl-group_button]:!w-11 [&_.maplibregl-ctrl-group_button+button]:!border-t [&_.maplibregl-ctrl-group_button+button]:!border-white/10 [&_.maplibregl-ctrl-group_button:hover]:!bg-white/10 [&_.maplibregl-ctrl-icon]:!brightness-0 [&_.maplibregl-ctrl-icon]:!invert`}>
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={BASEMAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={onDeselectEvent}
        // Attribution stays collapsed to its "i" button by default; it opens
        // on tap. Keeps the tile credit present without a wide strip of text
        // over the map or the location bar.
        attributionControl={{ compact: true }}
        // North-locked: no drag-rotate, no pitch. touchZoomRotate stays on for
        // pinch-zoom but its rotation is disabled on load (below).
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        onLoad={(event) => {
          event.target.touchZoomRotate.disableRotation()
          setMapLoaded(true)
          // `compact` only makes the attribution collapsible - MapLibre still
          // renders it expanded, so every fresh load put a strip of credit text
          // over the map, and it became the "i" only once someone had clicked
          // it. Collapse it here so it starts as the "i" the design expects;
          // clicking still toggles it back open.
          event.target
            .getContainer()
            .querySelector('.maplibregl-ctrl-attrib')
            ?.classList.remove('maplibregl-compact-show')
        }}
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
