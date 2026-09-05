import { useMemo, useState } from 'react'
import { DisasterMap } from './components/DisasterMap'
import { EventsSidebar } from './components/EventsSidebar'
import { Navbar } from './components/Navbar'
import { SeverityKey } from './components/SeverityKey'
import { useEarthquakes } from './hooks/useEarthquakes'
import { useGeolocation } from './hooks/useGeolocation'
import { useReverseGeocode } from './hooks/useReverseGeocode'
import { useVolcanoes } from './hooks/useVolcanoes'
import { earthquakeToEvent, volcanoToEvent } from './lib/events'
import type { DisasterEvent } from './types/event'

// Tailwind's `sm:` breakpoint (640px) is also where the events panel switches
// from a mobile bottom sheet to a desktop/tablet side panel - see EventsSidebar.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 639px)'

function App() {
  const { location, error: locationError } = useGeolocation()
  const { data: address } = useReverseGeocode(location)
  const { data: earthquakes } = useEarthquakes()
  const { data: volcanoes } = useVolcanoes()

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

    return [...earthquakeEvents, ...volcanoEvents]
  }, [earthquakes, volcanoes])

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null

  function selectEvent(event: DisasterEvent) {
    setSelectedEventId(event.id)
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
        />

        <SeverityKey />

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
      />
    </div>
  )
}

export default App
