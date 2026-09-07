import { useQuery } from '@tanstack/react-query'
import { reverseGeocode } from '../api/nominatim'
import type { UserLocation } from './useGeolocation'

// Round to ~100m so small GPS jitter reuses the cached query instead of
// re-hitting Nominatim's rate-limited endpoint every tick.
function roundForCaching(value: number): number {
  return Math.round(value * 1000) / 1000
}

export function useReverseGeocode(location: UserLocation | null) {
  const rounded = location
    ? { lat: roundForCaching(location.lat), lng: roundForCaching(location.lng) }
    : null

  return useQuery({
    queryKey: ['reverseGeocode', rounded?.lat, rounded?.lng],
    queryFn: () => reverseGeocode(rounded!.lat, rounded!.lng),
    enabled: rounded !== null,
    staleTime: Infinity,
  })
}
