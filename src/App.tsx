import { useEffect, useMemo, useState } from 'react'
import { DisasterMap } from './components/DisasterMap'
import { EventsSidebar } from './components/EventsSidebar'
import { Navbar } from './components/Navbar'
import { NewEventToast } from './components/NewEventToast'
import { SeverityKey } from './components/SeverityKey'
import { useEarthquakes } from './hooks/useEarthquakes'
import { useGeolocation } from './hooks/useGeolocation'
import { useNewEvents } from './hooks/useNewEvents'
import { useReverseGeocode } from './hooks/useReverseGeocode'
import { useVolcanoes } from './hooks/useVolcanoes'
import { earthquakeToEvent, volcanoToEvent } from './lib/events'
import type { DisasterEvent } from './types/event'

// Tailwind's `sm:` breakpoint (640px) is also where the events panel switches
// from a mobile bottom sheet to a desktop/tablet side panel - see EventsSidebar.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 639px)'

// TEMPORARY DEMO ONLY - remove after showing the new-event notification
// feature live. Visiting the site with ?demoNewEvent=1 injects one fake
// earthquake a few seconds after load, purely client-side, so the toast/
// pulse/badge can be seen without waiting for (or faking) real GeoNet data.
function useDemoEvent(): DisasterEvent | null {
  const [demoEvent, setDemoEvent] = useState<DisasterEvent | null>(null)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demoNewEvent') !== '1') return

    const timer = setTimeout(() => {
      setDemoEvent({
        id: 'demo-new-event',
        kind: 'earthquake',
        severity: 'strong',
        title: '10km S of Lower Hutt',
        subtitle: 'demo-only, not a real GeoNet event',
        location: { lat: -41.32, lng: 174.95 },
        ratingText: 'Magnitude 5.2',
        time: new Date(),
        detail: 'Depth 15km',
      })
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  return demoEvent
}

function App() {
  const { location, error: locationError } = useGeolocation()
  const { data: address } = useReverseGeocode(location)
  const { data: earthquakes } = useEarthquakes()
  const { data: volcanoes } = useVolcanoes()
  const demoEvent = useDemoEvent()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

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

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null
  // Earthquakes and volcanoes are two independent queries that resolve at
  // different times - seeding "new" tracking off whichever one happens to
  // load first would wrongly flag the other's data as new the moment it
  // arrives a beat later. Wait for both before treating anything as a baseline.
  const initialDataLoaded = earthquakes !== undefined && volcanoes !== undefined
  const { newEventIds, toastQueue, acknowledge } = useNewEvents(events, initialDataLoaded)

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
      <Navbar address={address ?? null} onToggleSidebar={() => setSidebarOpen((open) => !open)} />

      <div className="relative min-h-0 flex-1">
        <DisasterMap
          userLocation={location}
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={selectEvent}
          onDeselectEvent={() => setSelectedEventId(null)}
          newEventIds={newEventIds}
        />

        <SeverityKey />

        <div className="pointer-events-none absolute top-3 left-1/2 z-[7] flex -translate-x-1/2 flex-col gap-2">
          {toastQueue.map((event) => (
            <NewEventToast
              key={event.id}
              event={event}
              onView={selectEvent}
              onDismiss={acknowledge}
            />
          ))}
        </div>

        {locationError && (
          <div className="absolute bottom-4 left-1/2 z-[6] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg bg-slate-900/90 px-4 py-3 text-white shadow-lg">
            <h3 className="text-sm font-semibold">Disaster Zone Needs Your Location.</h3>
            <p className="mt-1 text-xs text-white/85">
              To display realtime information on disasters around you and across New
              Zealand, Disaster Zone needs to access your geolocation. If your browser
              asks you to allow this, please click Allow.
            </p>
          </div>
        )}
      </div>

      <EventsSidebar
        events={events}
        isOpen={sidebarOpen}
        selectedEventId={selectedEventId}
        onSelectEvent={selectEvent}
        onClose={() => setSidebarOpen(false)}
        userLocation={location}
        newEventIds={newEventIds}
      />
    </div>
  )
}

export default App
