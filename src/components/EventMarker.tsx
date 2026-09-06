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
      {/* The wrapper's min-h/w-11 is a floor, not a cap - the icon itself is
          already at least 44px, so the tap target and the visual size are
          the same box here (no more invisible-padding gap between them).
          `animate-[marker-drop-in...]` (keyframes defined in index.css) is
          only applied to a brand-new arrival, and only plays once - the
          class stays on the element for as long as `isNew` is true, but a
          CSS animation on an element that never remounts doesn't replay on
          later re-renders, it just holds at its final frame. */}
      <div
        className={`relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center ${
          isNew ? 'animate-[marker-drop-in_500ms_ease-out]' : ''
        }`}
      >
        {/* White + dark outline rather than the event's severity color, so
            the pulse stays visible even against a same-hue alert-radius
            circle underneath it (which would otherwise blend right in). */}
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
