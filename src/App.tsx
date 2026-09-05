import { useMemo, useState } from 'react'
import { DisasterMap } from './components/DisasterMap'
import { EventsSidebar } from './components/EventsSidebar'
import { LocationStatus } from './components/LocationStatus'
import { Navbar } from './components/Navbar'
import { NewEventToast } from './components/NewEventToast'
import { SeverityKey } from './components/SeverityKey'
import { FILTERABLE_SEVERITY_LEVELS, type SeverityLevel } from './constants/severity'
import { useDemoEvent } from './hooks/useDemoEvent'
import { useEarthquakes } from './hooks/useEarthquakes'
import { useGeolocation } from './hooks/useGeolocation'
import { useManualLocation } from './hooks/useManualLocation'
import { useNewEvents } from './hooks/useNewEvents'
import { useReverseGeocode } from './hooks/useReverseGeocode'
import { useVolcanoes } from './hooks/useVolcanoes'
import { earthquakeToEvent, volcanoToEvent } from './lib/events'
import type { DisasterEvent, HazardKind } from './types/event'

const ALL_KINDS: HazardKind[] = ['earthquake', 'volcano']

// Three-tier breakpoints, matching Tailwind's `sm:`/`lg:` tokens so these
// stay in sync with the CSS:
//   mobile <640px | tablet 640-1023px | large >=1024px
// `sm:` (640px) is where the events panel switches from a mobile bottom
// sheet to a tablet/desktop side panel - see EventsSidebar. `lg:` (1024px)
// only affects whether that side panel starts open by default, below.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 639px)'
const LARGE_BREAKPOINT_QUERY = '(min-width: 1024px)'

function App() {
  const { location, error: locationError } = useGeolocation()
  const { manualLocation, submit: submitManualAddress, clear: clearManualLocation, isSubmitting, notFound } =
    useManualLocation()
  // Manual entry is sticky once set - it doesn't get silently overridden if
  // geolocation later succeeds, since the user made a deliberate choice.
  const effectiveLocation = manualLocation?.coords ?? location
  // No point reverse-geocoding the GPS location while a manual address is
  // active - we already have its display name from the forward-geocode result.
  const { data: reverseGeocodedAddress } = useReverseGeocode(manualLocation ? null : location)
  const displayAddress = manualLocation?.displayName ?? reverseGeocodedAddress ?? null
  const { data: earthquakes } = useEarthquakes()
  const { data: volcanoes } = useVolcanoes()
  const demoEvent = useDemoEvent()

  // Open by default on large screens only - tablet gets the same side-panel
  // layout as desktop (not the mobile bottom sheet) but starts closed like
  // mobile does, since it doesn't have the spare width desktop does to keep
  // it open without crowding the map. Checked once at mount, not kept in
  // sync with later window resizes.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.matchMedia(LARGE_BREAKPOINT_QUERY).matches,
  )
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [visibleKinds, setVisibleKinds] = useState<Set<HazardKind>>(new Set(ALL_KINDS))
  const [visibleSeverities, setVisibleSeverities] = useState<Set<SeverityLevel>>(
    new Set(FILTERABLE_SEVERITY_LEVELS),
  )

  const events = useMemo<DisasterEvent[]>(() => {
    const earthquakeEvents = (earthquakes ?? [])
      .map(earthquakeToEvent)
      .sort((a, b) => (b.time?.getTime() ?? 0) - (a.time?.getTime() ?? 0))

    // Mirrors the original's VolcanoSortLoop: only show volcanoes with active unrest.
    const volcanoEvents = (volcanoes ?? [])
      .filter((feature) => feature.properties.level > 0)
      .map(volcanoToEvent)

    // TEMPORARY DEMO ONLY - see useDemoEvent above.
    return demoEvent
      ? [demoEvent, ...earthquakeEvents, ...volcanoEvents]
      : [...earthquakeEvents, ...volcanoEvents]
  }, [earthquakes, volcanoes, demoEvent])

  // Filtering happens after the full list is built (and after new-event
  // tracking sees everything, below) so a hidden event's "seen" state stays
  // accurate and it doesn't reappear as "new" the moment it's un-filtered.
  const filteredEvents = useMemo(
    () => events.filter((event) => visibleKinds.has(event.kind) && visibleSeverities.has(event.severity)),
    [events, visibleKinds, visibleSeverities],
  )
  const isFiltered =
    visibleKinds.size < ALL_KINDS.length || visibleSeverities.size < FILTERABLE_SEVERITY_LEVELS.length

  // Deriving from filteredEvents (not events) means a selected event's popup
  // closes itself automatically the moment a filter change hides it.
  const selectedEvent = filteredEvents.find((event) => event.id === selectedEventId) ?? null

  // Earthquakes and volcanoes are two independent queries that resolve at
  // different times - seeding "new" tracking off whichever one happens to
  // load first would wrongly flag the other's data as new the moment it
  // arrives a beat later. Wait for both before treating anything as a baseline.
  const initialDataLoaded = earthquakes !== undefined && volcanoes !== undefined
  const { newEventIds, toastQueue, acknowledge } = useNewEvents(events, initialDataLoaded)
  // Toasts are rendered independently of the (already-filtered) map/sidebar
  // lists, so they need their own filter check - otherwise a "new" event
  // you've explicitly hidden would still pop up a notification for it.
  const visibleToastQueue = toastQueue.filter(
    (event) => visibleKinds.has(event.kind) && visibleSeverities.has(event.severity),
  )

  function toggleKind(kind: HazardKind) {
    setVisibleKinds((current) => {
      const next = new Set(current)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })
  }

  function toggleSeverity(level: SeverityLevel) {
    setVisibleSeverities((current) => {
      const next = new Set(current)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  function resetFilters() {
    setVisibleKinds(new Set(ALL_KINDS))
    setVisibleSeverities(new Set(FILTERABLE_SEVERITY_LEVELS))
  }

  function selectEvent(event: DisasterEvent) {
    setSelectedEventId(event.id)
    acknowledge(event.id)
    // On mobile the events list is a bottom sheet sitting over the map - close it
    // so the newly-opened popup underneath is actually visible. On tablet/desktop
    // the side panel and the popup coexist, so it stays open.
    if (window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />

      {/* overflow-hidden clips the sidebar's closed (translated off-screen)
          state - EventsSidebar is `sm:absolute` within this container rather
          than fixed-to-viewport (so it no longer overlaps the navbar), but
          that means its off-screen translate now counts toward this
          container's scrollable width unless clipped here. */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <DisasterMap
          userLocation={effectiveLocation}
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={selectEvent}
          onDeselectEvent={() => setSelectedEventId(null)}
          newEventIds={newEventIds}
        />

        <SeverityKey sidebarOpen={sidebarOpen} />

        <div className="pointer-events-none absolute top-3 left-1/2 z-[7] flex -translate-x-1/2 flex-col gap-2">
          {visibleToastQueue.map((event) => (
            <NewEventToast
              key={event.id}
              event={event}
              onView={selectEvent}
              onDismiss={acknowledge}
            />
          ))}
        </div>

        <LocationStatus
          address={displayAddress}
          isManualAddress={manualLocation !== null}
          locationError={locationError}
          onSubmitAddress={submitManualAddress}
          onClearManual={clearManualLocation}
          isSubmitting={isSubmitting}
          notFound={notFound}
        />

        <EventsSidebar
          events={filteredEvents}
          isOpen={sidebarOpen}
          selectedEventId={selectedEventId}
          onSelectEvent={selectEvent}
          onClose={() => setSidebarOpen(false)}
          userLocation={effectiveLocation}
          newEventIds={newEventIds}
          isFiltered={isFiltered}
          visibleKinds={visibleKinds}
          visibleSeverities={visibleSeverities}
          onToggleKind={toggleKind}
          onToggleSeverity={toggleSeverity}
          onResetFilters={resetFilters}
        />
      </div>
    </div>
  )
}

export default App
