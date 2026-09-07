import { useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../lib/browserStorage'

export interface UserLocation {
  lat: number
  lng: number
}

interface GeolocationState {
  location: UserLocation | null
  error: string | null
  /** True until the browser has responded (with a position or an error) at least once. */
  loading: boolean
}

/** Watches the browser's geolocation. */
const isGeolocationSupported = 'geolocation' in navigator

// The last successful fix is cached so a fresh load has something to show
// immediately, then replaced when a new fix arrives. A transient error or a
// denial never clears it.
const LAST_GPS_LOCATION_KEY = 'disasterZone.lastGpsLocation'

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => ({
    location: readJSON<UserLocation>(LAST_GPS_LOCATION_KEY),
    error: isGeolocationSupported ? null : "Your browser doesn't support location",
    loading: isGeolocationSupported,
  }))

  useEffect(() => {
    if (!isGeolocationSupported) {
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        writeJSON(LAST_GPS_LOCATION_KEY, location)
        setState({ location, error: null, loading: false })
      },
      (positionError) => {
        setState((current) => ({
          location: current.location,
          error: positionError.message,
          loading: false,
        }))
      },
      { enableHighAccuracy: true, timeout: 20_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}
