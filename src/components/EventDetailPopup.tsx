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

// The lighter severity colors need dark text for contrast; the rest read
// fine in white. Restored after the SEVERITY_COLORS darkening (which had
// let this go uniformly white) was reverted back to the original pale
// palette per request - without this, white text on weak/light/moderate's
// pale backgrounds fails WCAG contrast again (weak measured 1.88:1 against
// a 4.5:1 minimum).
const DARK_TEXT_SEVERITIES: SeverityLevel[] = ['weak', 'light', 'moderate']

// The icons are drawn near-white - no longer inverted now that the card
// itself is dark again (a `invert` step used to flip them near-black for a
// light card; removed along with the light card itself).
const DETAIL_ICON_CLASS = 'h-6 w-6 flex-none opacity-60'

// Popup close button + tip are library-rendered DOM we don't control directly,
// so they're restyled via Tailwind's arbitrary descendant-selector syntax.
// MapLibre calls classList.add() on this string internally, which throws on
// whitespace other than single spaces - so this has to stay one line.
// The close button is sized to a full 44x44px touch target (WCAG 2.5.5 /
// Apple HIG minimum) even though its visible "x" glyph stays small -
// centered inside via flex, so the enlarged tap area doesn't look oversized.
//
// `!` (important) on rounded-2xl/bg/p-0/shadow/ring/close-button-rounded-full:
// maplibre-gl.css ships its own border-radius/background/padding/box-shadow
// for .maplibregl-popup-content (and its own border-radius for the close
// button) as plain unlayered CSS, which beats any Tailwind utility (Tailwind
// wraps utilities in @layer, and unlayered rules always win over layered
// ones regardless of specificity) unless marked important - the same fix
// already used for the map's zoom control size. Without it the card silently
// stayed white with square corners despite rounded-2xl being present in the
// class list, and the close button rendered as a barely-rounded rectangle
// instead of the intended circle. The tip triangle needs the same treatment:
// `anchor="bottom"` (fixed, below) means MapLibre always applies
// `.maplibregl-popup-anchor-bottom`, whose only active tip rule is
// `border-top-color`, so only that one side needs overriding.
const POPUP_CLASSNAME =
  '[&_.maplibregl-popup-content]:w-64 [&_.maplibregl-popup-content]:overflow-hidden [&_.maplibregl-popup-content]:!rounded-2xl [&_.maplibregl-popup-content]:!bg-slate-900 [&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!shadow-xl [&_.maplibregl-popup-content]:!ring-1 [&_.maplibregl-popup-content]:!ring-white/10 [&_.maplibregl-popup-tip]:!border-t-slate-900 [&_.maplibregl-popup-close-button]:right-1 [&_.maplibregl-popup-close-button]:top-1 [&_.maplibregl-popup-close-button]:flex [&_.maplibregl-popup-close-button]:h-11 [&_.maplibregl-popup-close-button]:w-11 [&_.maplibregl-popup-close-button]:items-center [&_.maplibregl-popup-close-button]:justify-center [&_.maplibregl-popup-close-button]:!rounded-full [&_.maplibregl-popup-close-button]:text-base [&_.maplibregl-popup-close-button]:leading-none [&_.maplibregl-popup-close-button]:text-white/60 [&_.maplibregl-popup-close-button]:transition-colors [&_.maplibregl-popup-close-button]:hover:bg-white/10 [&_.maplibregl-popup-close-button]:hover:text-white [&_.maplibregl-popup-close-button]:focus:outline-none [&_.maplibregl-popup-close-button]:focus-visible:ring-2 [&_.maplibregl-popup-close-button]:focus-visible:ring-white/30'

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
      <div className="flex items-start pt-4 pr-14 pl-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${badgeTextClass}`}
          style={{ backgroundColor: SEVERITY_COLORS[event.severity] }}
        >
          {event.severity}
        </span>
      </div>

      <div className="px-4 pt-3">
        {/* h2, not h3 - a floating popup is its own top-level section, a
            sibling to the page's other floating panels, not nested under
            any of them (an axe-core heading-order audit flagged this
            jumping straight from the page's one h1 to h3). */}
        <h2 className="text-sm font-semibold text-white">{event.title}</h2>
        <p className="mt-0.5 text-lg font-bold text-white">{event.ratingText}</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5 text-sm text-white/70">
          <img src={detailIcon} alt="" className={DETAIL_ICON_CLASS} />
          <span>{event.detail}</span>
        </div>
        {/* GeoNet's `hazards` field (volcanoes only) - there's no separate
            "latest bulletins" API to pull from (GeoNet's actual bulletins
            are website content, not exposed via their documented API), so
            this is the closest real, already-fetched data to that request. */}
        {event.hazards && (
          <div className="flex items-center gap-2.5 text-sm text-white/70">
            <img src={epicenterIcon} alt="" className={DETAIL_ICON_CLASS} />
            <span>{event.hazards}</span>
          </div>
        )}
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

      {/* text-white/50, not /40 - the fainter value measured 3.8:1 against
          the card's slate-900 background (needs 4.5:1), found by the same
          axe-core audit as the severity badge fix above. */}
      {event.subtitle && (
        <p className="border-t border-white/10 px-4 py-2 text-[10px] text-white/50">
          Event ID: {event.subtitle}
        </p>
      )}
    </Popup>
  )
}
