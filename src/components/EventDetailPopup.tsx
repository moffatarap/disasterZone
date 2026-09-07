import { Popup } from 'react-map-gl/maplibre'
import depthIcon from '../assets/media/img/mapKeys/eventDetails/detailIconsEQDepth.svg'
import epicenterIcon from '../assets/media/img/mapKeys/eventDetails/detailIconsEQEpicenter.svg'
import timeIcon from '../assets/media/img/mapKeys/eventDetails/detailIconsTime.svg'
import { SEVERITY_COLORS, type SeverityLevel } from '../constants/severity'
import { CITY_IMAGES } from '../constants/cityImages'
import { VOLCANO_IMAGES } from '../constants/volcanoImages'
import type { UserLocation } from '../hooks/useGeolocation'
import { haversineDistanceKm, formatDistanceKm } from '../lib/geo'
import { formatRelativeTime } from '../lib/relativeTime'
import type { DisasterEvent } from '../types/event'

interface EventDetailPopupProps {
  event: DisasterEvent
  userLocation: UserLocation | null
  onClose: () => void
}

// White text on the pale weak/light/moderate backgrounds fails WCAG contrast
// (weak measured 1.88:1, needs 4.5:1), so those three get dark text - see
// docs/DECISIONS.md for the palette history.
const DARK_TEXT_SEVERITIES: SeverityLevel[] = ['weak', 'light', 'moderate']

// Near-white, to sit on the dark card.
const DETAIL_ICON_CLASS = 'h-6 w-6 flex-none opacity-60'

// GeoNet's "Latest Volcanic Activity Bulletins" are website content with no
// API/feed behind them, and no per-volcano URL, so this links to the general
// hub (see docs/DECISIONS.md).
const VOLCANO_BULLETINS_URL = 'https://www.geonet.org.nz/volcano/vab'

// Restyles the library-rendered popup content, tip and close button. Must
// stay one line (MapLibre calls classList.add() on it, which throws on
// non-space whitespace). `!` overrides maplibre-gl.css's unlayered rules,
// which outrank Tailwind's @layer utilities (see docs/DECISIONS.md). The
// close button is grown to a 44x44px touch target with a small centred glyph.
const POPUP_CLASSNAME =
  '[&_.maplibregl-popup-content]:w-64 [&_.maplibregl-popup-content]:overflow-hidden [&_.maplibregl-popup-content]:!rounded-2xl [&_.maplibregl-popup-content]:!bg-slate-900 [&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!shadow-xl [&_.maplibregl-popup-content]:!ring-1 [&_.maplibregl-popup-content]:!ring-white/10 [&_.maplibregl-popup-tip]:!border-t-slate-900 [&_.maplibregl-popup-close-button]:right-1 [&_.maplibregl-popup-close-button]:top-1 [&_.maplibregl-popup-close-button]:flex [&_.maplibregl-popup-close-button]:h-11 [&_.maplibregl-popup-close-button]:w-11 [&_.maplibregl-popup-close-button]:items-center [&_.maplibregl-popup-close-button]:justify-center [&_.maplibregl-popup-close-button]:!rounded-full [&_.maplibregl-popup-close-button]:text-base [&_.maplibregl-popup-close-button]:leading-none [&_.maplibregl-popup-close-button]:text-white/60 [&_.maplibregl-popup-close-button]:transition-colors [&_.maplibregl-popup-close-button]:hover:bg-white/10 [&_.maplibregl-popup-close-button]:hover:text-white [&_.maplibregl-popup-close-button]:focus:outline-none [&_.maplibregl-popup-close-button]:focus-visible:ring-2 [&_.maplibregl-popup-close-button]:focus-visible:ring-white/30'

export function EventDetailPopup({ event, userLocation, onClose }: EventDetailPopupProps) {
  const badgeTextClass = DARK_TEXT_SEVERITIES.includes(event.severity)
    ? 'text-slate-800'
    : 'text-white'
  // Volcanoes key off the GeoNet volcanoID; earthquakes off the nearest
  // locality name (see events.ts). A miss returns undefined - the common
  // case for earthquakes.
  const eventImage =
    event.kind === 'volcano'
      ? VOLCANO_IMAGES[event.id]
      : event.nearestLocalityName
        ? CITY_IMAGES[event.nearestLocalityName]
        : undefined
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
      {/* Illustrative, not live (see docs/DECISIONS.md). Full-bleed, so no
          padding here - the close button sits on top of it. */}
      {eventImage && (
        <div>
          <img
            src={eventImage.src}
            alt={event.kind === 'volcano' ? `${event.title} volcano` : `${event.nearestLocalityName}`}
            className="h-32 w-full object-cover"
          />
          <p className="px-4 pt-1.5 text-[9px] text-white/50">
            Photo: {eventImage.credit} ·{' '}
            {eventImage.licenseUrl ? (
              <a href={eventImage.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {eventImage.licenseName}
              </a>
            ) : (
              eventImage.licenseName
            )}
          </p>
        </div>
      )}

      <div className="flex items-start pt-4 pr-14 pl-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${badgeTextClass}`}
          style={{ backgroundColor: SEVERITY_COLORS[event.severity] }}
        >
          {event.severity}
        </span>
      </div>

      <div className="px-4 pt-3">
        {/* h2: a floating popup is its own top-level section, not nested
            under anything (see docs/DECISIONS.md). */}
        <h2 className="text-sm font-semibold text-white">{event.title}</h2>
        <p className="mt-0.5 text-lg font-bold text-white">{event.ratingText}</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5 text-sm text-white/70">
          <img src={detailIcon} alt="" className={DETAIL_ICON_CLASS} />
          <span>{event.detail}</span>
        </div>
        {distanceFromUserKm !== null && (
          <div className="flex items-center gap-2.5 text-sm text-white/70">
            <img src={epicenterIcon} alt="" className={DETAIL_ICON_CLASS} />
            <span>{formatDistanceKm(distanceFromUserKm)} from you</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-sm text-white/70">
          <img src={timeIcon} alt="" className={DETAIL_ICON_CLASS} />
          <span>{formatRelativeTime(event.time)}</span>
        </div>
      </div>

      {event.kind === 'volcano' && (
        <div className="border-t border-white/10 px-4 py-2.5">
          <a
            href={VOLCANO_BULLETINS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-sky-400 hover:underline"
          >
            View latest bulletins on GeoNet ↗
          </a>
        </div>
      )}

      {/* white/50, not /40: /40 measured 3.8:1 on slate-900 (needs 4.5:1). */}
      {event.subtitle && (
        <p className="border-t border-white/10 px-4 py-2 text-[10px] text-white/50">
          Event ID: {event.subtitle}
        </p>
      )}
    </Popup>
  )
}
