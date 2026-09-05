import { useEffect, useState } from 'react'

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

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: isGeolocationSupported ? null : "Your browser doesn't support location",
    loading: isGeolocationSupported,
  })

  useEffect(() => {
    if (!isGeolocationSupported) {
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (positionError) => {
        setState({
          location: null,
          error: positionError.message,
          loading: false,
        })
      },
      { enableHighAccuracy: true, timeout: 20_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}
