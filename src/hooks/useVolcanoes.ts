import { useQuery } from '@tanstack/react-query'
import { fetchVolcanoAlertLevels } from '../api/geonet'

const REFRESH_INTERVAL_MS = 60_000

export function useVolcanoes() {
  return useQuery({
    queryKey: ['volcanoes'],
    queryFn: fetchVolcanoAlertLevels,
    refetchInterval: REFRESH_INTERVAL_MS,
    select: (data) => data.features,
  })
}
