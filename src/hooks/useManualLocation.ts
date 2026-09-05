import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { forwardGeocode } from '../api/nominatim'
import type { UserLocation } from './useGeolocation'

export interface ManualLocation {
  coords: UserLocation
  displayName: string
}

interface ManualLocationResult {
  manualLocation: ManualLocation | null
  /** Looks up an address and, if found, sets it as the manual location. */
  submit: (address: string) => void
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
  const [manualLocation, setManualLocation] = useState<ManualLocation | null>(null)

  const mutation = useMutation({
    mutationFn: forwardGeocode,
    onSuccess: (result) => {
      if (result) {
        setManualLocation({ coords: { lat: result.lat, lng: result.lng }, displayName: result.displayName })
      }
    },
  })

  return {
    manualLocation,
    submit: (address: string) => mutation.mutate(address),
    clear: () => {
      setManualLocation(null)
      mutation.reset()
    },
    isSubmitting: mutation.isPending,
    notFound: mutation.isSuccess && mutation.data === null,
  }
}
