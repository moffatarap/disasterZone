import { useCallback, useEffect, useRef, useState } from 'react'
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
   * address override without losing it when the fix fails; `onError` runs on
   * every failure path, so the caller can report one.
   */
  requestLocation: (options?: { onSuccess?: () => void; onError?: () => void }) => void
}

/** Watches the browser's geolocation. */
const isGeolocationSupported = 'geolocation' in navigator

// The last successful fix is cached so a fresh load has something to show
// immediately, then replaced when a new fix arrives. A transient error or a
// denial never clears it.
const LAST_GPS_LOCATION_KEY = 'disasterZone.lastGpsLocation'

const POSITION_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 20_000 }

// Client-side backstop for the initial watchPosition. `POSITION_OPTIONS.timeout`
// only starts counting once a request is in flight; while the permission prompt
// sits unanswered it does nothing, and some engines (notably Firefox under
// automation) never invoke either callback in that state, so without this the
// bar can sit on "Finding your location…" forever with no way to reach "add an
// address". Comfortably past the 20s in-flight timeout so a spec-compliant
// browser's own error wins first. requestLocation ("Use my location") isn't
// backstopped here - getCurrentPosition honours its own `timeout`. See
// docs/DECISIONS.md.
//
// `window.__dzGeoTimeoutMs` overrides it - the only reader is scripts/visual-audit.mjs,
// which sets it (via addInitScript, before this module loads) so the audit can
// exercise the backstop without a 40-second wait. Unset in production.
function geoTimeoutMs(): number {
  const override = (globalThis as { __dzGeoTimeoutMs?: unknown }).__dzGeoTimeoutMs
  return typeof override === 'number' && override > 0 ? override : 40_000
}
const GEOLOCATION_TIMEOUT_MS = geoTimeoutMs()

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

  // The mount backstop timer. The first watch result cancels it (applyPosition /
  // applyError), so once the watch is working it can never fire.
  const startupTimeoutRef = useRef<number | null>(null)
  const clearStartupTimeout = useCallback(() => {
    if (startupTimeoutRef.current !== null) {
      window.clearTimeout(startupTimeoutRef.current)
      startupTimeoutRef.current = null
    }
  }, [])

  const applyPosition = useCallback(
    (position: GeolocationPosition) => {
      clearStartupTimeout()
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      writeJSON(LAST_GPS_LOCATION_KEY, location)
      setState({ location, error: null, loading: false })
    },
    [clearStartupTimeout],
  )

  const applyError = useCallback(
    (positionError: GeolocationPositionError) => {
      clearStartupTimeout()
      setState((current) => ({
        location: current.location,
        error: GEOLOCATION_ERROR_TEXT[positionError.code] ?? positionError.message,
        loading: false,
      }))
    },
    [clearStartupTimeout],
  )

  useEffect(() => {
    if (!isGeolocationSupported) {
      return
    }

    const watchId = navigator.geolocation.watchPosition(applyPosition, applyError, POSITION_OPTIONS)
    // Fires only if the initial watch never produces a result - the permission
    // prompt sits unanswered and the engine calls back on neither path. Guarded
    // on `loading` so a result landing in the same tick still wins.
    startupTimeoutRef.current = window.setTimeout(() => {
      startupTimeoutRef.current = null
      setState((current) =>
        current.loading ? { ...current, error: GEOLOCATION_ERROR_TEXT[3], loading: false } : current,
      )
    }, GEOLOCATION_TIMEOUT_MS)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearStartupTimeout()
    }
  }, [applyPosition, applyError, clearStartupTimeout])

  const requestLocation = useCallback(
    (options?: { onSuccess?: () => void; onError?: () => void }) => {
      if (!isGeolocationSupported) {
        options?.onError?.()
        return
      }
      if (!window.isSecureContext) {
        setState((current) => ({
          ...current,
          error: 'Location needs a trusted HTTPS connection',
          loading: false,
        }))
        options?.onError?.()
        return
      }
      // Clear the previous error as well as flagging the load: the bar's
      // spinner is suppressed while an error is showing, so leaving a stale
      // one here would make this button look completely inert in exactly the
      // denied/timed-out state it exists to recover from.
      setState((current) => ({ ...current, error: null, loading: true }))
      // No custom backstop: getCurrentPosition honours POSITION_OPTIONS.timeout,
      // so a stalled one-shot lands in the error callback (code 3) on its own.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyPosition(position)
          options?.onSuccess?.()
        },
        (positionError) => {
          applyError(positionError)
          options?.onError?.()
        },
        POSITION_OPTIONS,
      )
    },
    [applyPosition, applyError],
  )

  return { ...state, requestLocation }
}
