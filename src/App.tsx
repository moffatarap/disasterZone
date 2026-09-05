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
import './App.css'

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

  return (
    <div className="app">
      <Navbar address={address ?? null} onToggleSidebar={() => setSidebarOpen((open) => !open)} />

      <div className="app__map-area">
        <DisasterMap
          userLocation={location}
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={(event) => setSelectedEventId(event.id)}
          onDeselectEvent={() => setSelectedEventId(null)}
        />

        <SeverityKey />

        {locationError && (
          <div className="app__location-error">
            <h3>Disaster Zone Needs Your Location.</h3>
            <p>
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
        onSelectEvent={(event) => setSelectedEventId(event.id)}
      />
    </div>
  )
}

export default App
