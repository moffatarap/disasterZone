import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../lib/browserStorage'

export interface UserLocation {
  lat: number
  lng: number
}

interface PositionState {
  location: UserLocation | null
  error: string | null
  /** True until the browser has responded (with a position or an error) at least once. */
  loading: boolean
}

interface GeolocationState extends PositionState {
  /**
   * Ask the browser for a fresh one-shot fix. `watchPosition` below already
   * keeps `location` live while permission is granted; this is for actively
   * recovering after an earlier timeout, or a permission the user has since
   * granted - it backs the "Use my location" menu item. `onSuccess` runs only
   * if a position actually comes back, so the caller can e.g. drop a manual
   * address override without losing it when the fix fails.
   */
  requestLocation: (onSuccess?: () => void) => void
}

/** Watches the browser's geolocation. */
const isGeolocationSupported = 'geolocation' in navigator

// The last successful fix is cached so a fresh load has something to show
// immediately, then replaced when a new fix arrives. A transient error or a
// denial never clears it.
const LAST_GPS_LOCATION_KEY = 'disasterZone.lastGpsLocation'

const POSITION_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 20_000 }

// GeolocationPositionError codes -> readable text. Note: a page served over
// HTTPS with an untrusted certificate is treated by browsers as insecure, so
// getCurrentPosition fails with code 1 (denied) no matter the OS/site
// permission - install the dev CA on the device to clear it.
const GEOLOCATION_ERROR_TEXT: Record<number, string> = {
  1: 'Location permission denied',
  2: 'Location unavailable right now',
  3: 'Location request timed out',
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<PositionState>(() => ({
    location: readJSON<UserLocation>(LAST_GPS_LOCATION_KEY),
    error: isGeolocationSupported ? null : "Your browser doesn't support location",
    loading: isGeolocationSupported,
  }))

  const applyPosition = useCallback((position: GeolocationPosition) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }
    writeJSON(LAST_GPS_LOCATION_KEY, location)
    setState({ location, error: null, loading: false })
  }, [])

  const applyError = useCallback((positionError: GeolocationPositionError) => {
    setState((current) => ({
      location: current.location,
      error: GEOLOCATION_ERROR_TEXT[positionError.code] ?? positionError.message,
      loading: false,
    }))
  }, [])

  useEffect(() => {
    if (!isGeolocationSupported) {
      return
    }

    const watchId = navigator.geolocation.watchPosition(applyPosition, applyError, POSITION_OPTIONS)
    return () => navigator.geolocation.clearWatch(watchId)
  }, [applyPosition, applyError])

  const requestLocation = useCallback(
    (onSuccess?: () => void) => {
      if (!isGeolocationSupported) return
      if (!window.isSecureContext) {
        setState((current) => ({
          ...current,
          error: 'Location needs a trusted HTTPS connection',
          loading: false,
        }))
        return
      }
      // Clear the previous error as well as flagging the load: the bar's
      // spinner is suppressed while an error is showing, so leaving a stale
      // one here would make this button look completely inert in exactly the
      // denied/timed-out state it exists to recover from.
      setState((current) => ({ ...current, error: null, loading: true }))
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyPosition(position)
          onSuccess?.()
        },
        applyError,
        POSITION_OPTIONS,
      )
    },
    [applyPosition, applyError],
  )

  return { ...state, requestLocation }
}
