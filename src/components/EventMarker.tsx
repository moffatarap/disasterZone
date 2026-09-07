import { Marker } from 'react-map-gl/maplibre'
import { EARTHQUAKE_ICONS, VOLCANO_ICONS } from '../constants/severity'
import type { DisasterEvent } from '../types/event'

interface EventMarkerProps {
  event: DisasterEvent
  isSelected: boolean
  isNew: boolean
  onSelect: (event: DisasterEvent) => void
}

const ICONS_BY_KIND = {
  earthquake: EARTHQUAKE_ICONS,
  volcano: VOLCANO_ICONS,
} as const

export function EventMarker({ event, isSelected, isNew, onSelect }: EventMarkerProps) {
  const icon = ICONS_BY_KIND[event.kind][event.severity]
  const sizeClass = isSelected ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-11 w-11 sm:h-12 sm:w-12'

  return (
    <Marker
      latitude={event.location.lat}
      longitude={event.location.lng}
      onClick={(clickEvent) => {
        clickEvent.originalEvent.stopPropagation()
        onSelect(event)
      }}
    >
      {/* min-h/w-11 is the 44px touch-target floor. The drop-in animation
          (keyframes in index.css) plays once on a new arrival and holds - it
          doesn't replay on re-render since the element never remounts. */}
      <div
        className={`relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center ${
          isNew ? 'animate-[marker-drop-in_500ms_ease-out]' : ''
        }`}
      >
        {/* White + dark outline, not the severity colour, so the pulse stays
            visible over a same-hue alert circle. */}
        {isNew && (
          <span
            aria-hidden="true"
            className={`absolute animate-ping rounded-full bg-white opacity-90 ring-1 ring-slate-900/30 ${sizeClass}`}
          />
        )}
        <img
          src={icon}
          alt={`${event.kind} - ${event.severity}${isNew ? ' - new' : ''}`}
          className={`relative drop-shadow-md ${sizeClass}`}
        />
      </div>
    </Marker>
  )
}
