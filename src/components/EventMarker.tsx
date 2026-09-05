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
      {/* The wrapper's min-h/w-11 is a floor, not a cap - the icon itself is
          already at least 44px, so the tap target and the visual size are
          the same box here (no more invisible-padding gap between them). */}
      <div className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
        <img
          src={icon}
          alt={`${event.kind} - ${event.severity}`}
          className={`drop-shadow-md ${isSelected ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-11 w-11 sm:h-12 sm:w-12'}`}
        />
      </div>
    </Marker>
  )
}
