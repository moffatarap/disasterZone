import { Marker } from 'react-map-gl/maplibre'
import { EARTHQUAKE_ICONS, VOLCANO_ICONS } from '../constants/severity'
import type { DisasterEvent } from '../types/event'

interface EventMarkerProps {
  event: DisasterEvent
  isSelected: boolean
  onSelect: (event: DisasterEvent) => void
}

const ICONS_BY_KIND = {
  earthquake: EARTHQUAKE_ICONS,
  volcano: VOLCANO_ICONS,
} as const

export function EventMarker({ event, isSelected, onSelect }: EventMarkerProps) {
  const icon = ICONS_BY_KIND[event.kind][event.severity]

  return (
    <Marker
      latitude={event.location.lat}
      longitude={event.location.lng}
      onClick={(clickEvent) => {
        clickEvent.originalEvent.stopPropagation()
        onSelect(event)
      }}
    >
      <img
        src={icon}
        alt={`${event.kind} - ${event.severity}`}
        className={`event-marker-icon${isSelected ? ' event-marker-icon--selected' : ''}`}
      />
    </Marker>
  )
}
