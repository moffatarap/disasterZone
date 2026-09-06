import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { forwardGeocode, type ForwardGeocodeResult } from '../api/nominatim'
import { readJSON, removeItem, writeJSON } from '../lib/browserStorage'
import type { UserLocation } from './useGeolocation'

export interface ManualLocation {
  coords: UserLocation
  displayName: string
}

// Browser-only, per the "remember last known location" request - a manually
// entered address is already "sticky" for the rest of a session (see below);
// persisting it here makes that stick across reloads/visits too, until the
// user explicitly clears it via `clear`.
const LAST_MANUAL_LOCATION_KEY = 'disasterZone.lastManualLocation'

interface ManualLocationResult {
  manualLocation: ManualLocation | null
  /** Looks up an address and, if found, sets it as the manual location. */
  submit: (address: string) => void
  /**
   * Applies an already-resolved autocomplete suggestion directly, skipping
   * a redundant re-geocode of the same text (and avoiding any mismatch if a
   * second lookup happened to return a different top result).
   */
  selectResult: (result: ForwardGeocodeResult) => void
  /** Reverts to relying on geolocation again. */
  clear: () => void
  isSubmitting: boolean
  /** Set when the address couldn't be resolved to a location at all. */
  notFound: boolean
}

/**
 * Manual "type an address instead" fallback for when geolocation fails or
 * is denied. Once set, a manual location is sticky - it doesn't get
 * silently overridden if geolocation later succeeds (the user made a
 * deliberate choice); reverting requires explicitly calling `clear`.
 */
export function useManualLocation(): ManualLocationResult {
  const [manualLocation, setManualLocation] = useState<ManualLocation | null>(() =>
    readJSON<ManualLocation>(LAST_MANUAL_LOCATION_KEY),
  )

  function applyResult(result: ForwardGeocodeResult) {
    const next = { coords: { lat: result.lat, lng: result.lng }, displayName: result.displayName }
    writeJSON(LAST_MANUAL_LOCATION_KEY, next)
    setManualLocation(next)
  }

  const mutation = useMutation({
    mutationFn: forwardGeocode,
    onSuccess: (result) => {
      if (result) applyResult(result)
    },
  })

  return {
    manualLocation,
    submit: (address: string) => mutation.mutate(address),
    selectResult: applyResult,
    clear: () => {
      removeItem(LAST_MANUAL_LOCATION_KEY)
      setManualLocation(null)
      mutation.reset()
    },
    isSubmitting: mutation.isPending,
    notFound: mutation.isSuccess && mutation.data === null,
  }
}
