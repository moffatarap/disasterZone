import { Popup } from 'react-map-gl/maplibre'
import { SEVERITY_COLORS, type SeverityLevel } from '../constants/severity'
import { formatEventTime } from '../lib/events'
import type { DisasterEvent } from '../types/event'

interface EventDetailPopupProps {
  event: DisasterEvent
  onClose: () => void
}

// The lighter severity colors (light/moderate) need dark text for contrast; the rest read fine in white.
const DARK_TEXT_SEVERITIES: SeverityLevel[] = ['light', 'moderate']

export function EventDetailPopup({ event, onClose }: EventDetailPopupProps) {
  const badgeTextClass = DARK_TEXT_SEVERITIES.includes(event.severity)
    ? 'text-slate-800'
    : 'text-white'

  return (
    <Popup
      latitude={event.location.lat}
      longitude={event.location.lng}
      onClose={onClose}
      closeOnClick={false}
      offset={20}
      anchor="bottom"
      maxWidth="calc(100vw - 2rem)"
      className="[&_.maplibregl-popup-content]:min-w-[200px] [&_.maplibregl-popup-content]:overflow-hidden [&_.maplibregl-popup-content]:rounded-xl [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-content]:shadow-xl"
    >
      <div className="flex items-center justify-between px-3 py-1.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase ${badgeTextClass}`}
          style={{ backgroundColor: SEVERITY_COLORS[event.severity] }}
        >
          {event.severity}
        </span>
      </div>
      <h3 className="px-3 pt-1 text-base font-semibold">{event.title}</h3>
      <p className="px-3 pt-1 text-sm font-semibold">{event.ratingText}</p>
      <p className="px-3 pt-1 pb-3 text-xs text-slate-500">{event.detail}</p>
      <p className="px-3 pb-3 text-xs text-slate-500">{formatEventTime(event.time)}</p>
    </Popup>
  )
}
