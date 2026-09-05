import { useQuery } from '@tanstack/react-query'
import { fetchFeltEarthquakes } from '../api/geonet'

// GeoNet publishes felt-earthquake data on its own schedule; polling every
// few seconds (as the original app's setInterval loop did) just wastes
// requests. A minute is plenty responsive for this data source.
const REFRESH_INTERVAL_MS = 60_000

export function useEarthquakes() {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchFeltEarthquakes,
    refetchInterval: REFRESH_INTERVAL_MS,
    select: (data) => data.features,
  })
}
