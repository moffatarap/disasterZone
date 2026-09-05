import { Popup } from 'react-map-gl/maplibre'
import depthIcon from '../assets/media/img/mapKeys/eventDetails/detailIconsEQDepth.svg'
import epicenterIcon from '../assets/media/img/mapKeys/eventDetails/detailIconsEQEpicenter.svg'
import timeIcon from '../assets/media/img/mapKeys/eventDetails/detailIconsTime.svg'
import { SEVERITY_COLORS, type SeverityLevel } from '../constants/severity'
import type { UserLocation } from '../hooks/useGeolocation'
import { haversineDistanceKm, formatDistanceKm } from '../lib/geo'
import { formatRelativeTime } from '../lib/relativeTime'
import type { DisasterEvent } from '../types/event'

interface EventDetailPopupProps {
  event: DisasterEvent
  userLocation: UserLocation | null
  onClose: () => void
}

// The lighter severity colors (light/moderate) need dark text for contrast; the rest read fine in white.
const DARK_TEXT_SEVERITIES: SeverityLevel[] = ['light', 'moderate']

// The original detail icons are drawn near-white for a dark card that never
// shipped - `invert` maps that to near-black so they read on our light card.
const DETAIL_ICON_CLASS = 'h-4 w-4 flex-none opacity-50 invert'

// Popup close button + tip are library-rendered DOM we don't control directly,
// so they're restyled via Tailwind's arbitrary descendant-selector syntax.
// MapLibre calls classList.add() on this string internally, which throws on
// whitespace other than single spaces - so this has to stay one line.
const POPUP_CLASSNAME =
  '[&_.maplibregl-popup-content]:w-64 [&_.maplibregl-popup-content]:overflow-hidden [&_.maplibregl-popup-content]:rounded-2xl [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-content]:shadow-xl [&_.maplibregl-popup-content]:ring-1 [&_.maplibregl-popup-content]:ring-black/5 [&_.maplibregl-popup-close-button]:right-2.5 [&_.maplibregl-popup-close-button]:top-2.5 [&_.maplibregl-popup-close-button]:flex [&_.maplibregl-popup-close-button]:h-6 [&_.maplibregl-popup-close-button]:w-6 [&_.maplibregl-popup-close-button]:items-center [&_.maplibregl-popup-close-button]:justify-center [&_.maplibregl-popup-close-button]:rounded-full [&_.maplibregl-popup-close-button]:text-base [&_.maplibregl-popup-close-button]:leading-none [&_.maplibregl-popup-close-button]:text-slate-400 [&_.maplibregl-popup-close-button]:transition-colors [&_.maplibregl-popup-close-button]:hover:bg-slate-100 [&_.maplibregl-popup-close-button]:hover:text-slate-600 [&_.maplibregl-popup-close-button]:focus:outline-none [&_.maplibregl-popup-close-button]:focus-visible:ring-2 [&_.maplibregl-popup-close-button]:focus-visible:ring-slate-300'

export function EventDetailPopup({ event, userLocation, onClose }: EventDetailPopupProps) {
  const badgeTextClass = DARK_TEXT_SEVERITIES.includes(event.severity)
    ? 'text-slate-800'
    : 'text-white'
  const detailIcon = event.kind === 'earthquake' ? depthIcon : epicenterIcon
  const distanceFromUserKm =
    event.kind === 'earthquake' && userLocation
      ? haversineDistanceKm(event.location, userLocation)
      : null

  return (
    <Popup
      latitude={event.location.lat}
      longitude={event.location.lng}
      onClose={onClose}
      closeOnClick={false}
      offset={24}
      anchor="bottom"
      maxWidth="calc(100vw - 2rem)"
      className={POPUP_CLASSNAME}
    >
      <div className="flex items-start pt-4 pr-8 pl-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${badgeTextClass}`}
          style={{ backgroundColor: SEVERITY_COLORS[event.severity] }}
        >
          {event.severity}
        </span>
      </div>

      <div className="px-4 pt-3">
        <h3 className="text-sm font-semibold text-slate-900">{event.title}</h3>
        <p className="mt-0.5 text-lg font-bold text-slate-800">{event.ratingText}</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <img src={detailIcon} alt="" className={DETAIL_ICON_CLASS} />
          <span>{event.detail}</span>
        </div>
        {distanceFromUserKm !== null && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <img src={epicenterIcon} alt="" className={DETAIL_ICON_CLASS} />
            <span>{formatDistanceKm(distanceFromUserKm)} from you</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <img src={timeIcon} alt="" className={DETAIL_ICON_CLASS} />
          <span>{formatRelativeTime(event.time)}</span>
        </div>
      </div>

      {event.subtitle && (
        <p className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">
          Event ID: {event.subtitle}
        </p>
      )}
    </Popup>
  )
}
