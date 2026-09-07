import { useQuery } from '@tanstack/react-query'
import { fetchFeltEarthquakes } from '../api/geonet'

// GeoNet publishes on its own schedule; a minute is responsive enough and
// polling faster just wastes requests.
const REFRESH_INTERVAL_MS = 60_000

export function useEarthquakes() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchFeltEarthquakes,
    refetchInterval: REFRESH_INTERVAL_MS,
    select: (data) => data.features,
  })
}
