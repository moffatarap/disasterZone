import { useEffect, useState } from 'react'
import type { DisasterEvent } from '../types/event'

/**
 * Visiting the site with ?demoNewEvent=1 injects one fake earthquake a few
 * seconds after load, purely client-side (never touches real GeoNet data).
 * Lets the new-event notification feature (toast/pulse/badge) be demonstrated
 * or sanity-checked on demand, without waiting for an actual earthquake.
 */
export function useDemoEvent(): DisasterEvent | null {
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
