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
      {/* min-h/w-11 gives a 44x44px tap target (WCAG 2.5.5) without visually
          enlarging the pin itself - a bigger icon here would clutter dense
          marker clusters, so the extra hit area is invisible padding instead. */}
      <div className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
        <img
          src={icon}
          alt={`${event.kind} - ${event.severity}`}
          className={`drop-shadow-md ${isSelected ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-9 w-9 sm:h-10 sm:w-10'}`}
        />
      </div>
    </Marker>
  )
}
