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

/**
 * Watches the browser's geolocation, replacing the original app's
 * geoLocateUser/geolocationSuccess/geolocationError trio
 * (Disaster Zone/js/api/geoLocationAPI.js).
 */
const isGeolocationSupported = 'geolocation' in navigator

// Browser-only, per the "remember last known location" request - the most
// recent successful GPS fix is cached here so the map/distances have
// something to show immediately on a fresh page load instead of a blank
// wait, then get silently replaced the moment a fresh fix comes in. A
// transient error never clears this - losing GPS for a moment (or having it
// denied) shouldn't erase a location that was genuinely known a moment ago.
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
