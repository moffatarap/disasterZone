import {
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'
import {
  EARTHQUAKE_ICONS,
  FILTERABLE_SEVERITY_LEVELS_DESC,
  SEVERITY_COLORS,
  VOLCANO_ICONS,
  type SeverityLevel,
} from '../constants/severity'
import type { UserLocation } from '../hooks/useGeolocation'
import { formatDistanceKm, haversineDistanceKm } from '../lib/geo'
import { formatRelativeTime } from '../lib/relativeTime'
import type { DisasterEvent, HazardKind } from '../types/event'

interface EventsSidebarProps {
  events: DisasterEvent[]
  isOpen: boolean
  selectedEventId: string | null
  onSelectEvent: (event: DisasterEvent) => void
  onClose: () => void
  userLocation: UserLocation | null
  newEventIds: Set<string>
  /** id -> 1-based recency rank for the newest few felt quakes. */
  latestQuakeRanks: Map<string, number>
  isFiltered: boolean
  visibleKinds: Set<HazardKind>
  visibleSeverities: Set<SeverityLevel>
  onToggleKind: (kind: HazardKind) => void
  onToggleSeverity: (level: SeverityLevel) => void
  onResetFilters: () => void
}

const ICONS_BY_KIND = {
  earthquake: EARTHQUAKE_ICONS,
  volcano: VOLCANO_ICONS,
} as const

const KIND_ENTRIES: { kind: HazardKind; icon: string; label: string }[] = [
  { kind: 'earthquake', icon: earthquakeIcon, label: 'Earthquake' },
  { kind: 'volcano', icon: volcanoIcon, label: 'Volcano' },
]

// `flex-none` keeps each chip full-size in the horizontal-scroll row rather
// than shrinking to fit (see docs/DECISIONS.md).
const CHIP_CLASS =
  'flex flex-none items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold capitalize transition-colors'

// Mobile bottom-sheet height, as a % of the map area. Draggable between a
// compact size (handle + filters + a row or two) and full height, where the
// top edge meets the navbar. Ignored at >= sm, where the panel is a fixed-
// width side rail.
const SHEET_MIN_PX = 210
const SHEET_DEFAULT_PCT = 62
const SHEET_KEYBOARD_STEP_PCT = 8

export function EventsSidebar({
  events,
  isOpen,
  selectedEventId,
  onSelectEvent,
  onClose,
  userLocation,
  newEventIds,
  latestQuakeRanks,
  isFiltered,
  visibleKinds,
  visibleSeverities,
  onToggleKind,
  onToggleSeverity,
  onResetFilters,
}: EventsSidebarProps) {
  const asideRef = useRef<HTMLElement>(null)
  const dragRef = useRef<{ startY: number; startPct: number; mapH: number } | null>(null)
  const [sheetPct, setSheetPct] = useState(SHEET_DEFAULT_PCT)

  // The panel is absolutely positioned inside <main>, so its parent's height
  // is the space between the navbar and the bottom of the screen - i.e. the
  // ceiling for "full height".
  function mapHeight() {
    return asideRef.current?.parentElement?.getBoundingClientRect().height ?? window.innerHeight
  }

  function clampPct(pct: number, mapH: number) {
    const minPct = Math.min(100, (SHEET_MIN_PX / mapH) * 100)
    return Math.max(minPct, Math.min(100, pct))
  }

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { startY: event.clientY, startPct: sheetPct, mapH: mapHeight() }
  }

  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    // Dragging up (clientY decreasing) grows the sheet.
    const deltaPct = ((drag.startY - event.clientY) / drag.mapH) * 100
    setSheetPct(clampPct(drag.startPct + deltaPct, drag.mapH))
  }

  function onHandlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function onHandleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const mapH = mapHeight()
    if (event.key === 'ArrowUp') setSheetPct((p) => clampPct(p + SHEET_KEYBOARD_STEP_PCT, mapH))
    else if (event.key === 'ArrowDown') setSheetPct((p) => clampPct(p - SHEET_KEYBOARD_STEP_PCT, mapH))
    else if (event.key === 'Home') setSheetPct(100)
    else if (event.key === 'End') setSheetPct(clampPct(0, mapH))
    else return
    event.preventDefault()
  }

  return (
    <>
      {/* Backdrop: only relevant to the mobile bottom-sheet layout */}
      <div
        aria-hidden={!isOpen}
        onClick={onClose}
        className={`fixed inset-0 z-10 bg-black/40 transition-opacity sm:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* <aside>, not a dialog: this is a persistent panel with no focus trap
          or Escape handling, not a modal (see docs/DECISIONS.md). */}
      <aside
        ref={asideRef}
        aria-label="Recent events"
        style={{ '--sheet-h': `${sheetPct}%` } as CSSProperties}
        className={`absolute inset-x-0 bottom-0 z-20 flex h-[var(--sheet-h)] flex-col bg-slate-900/95 text-white shadow-2xl transition-transform duration-300 ease-out sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:top-0 sm:h-full sm:w-80 sm:rounded-none ${
          sheetPct > 98 ? '' : 'rounded-t-2xl'
        } ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'
        }`}
      >
        <div
          role="slider"
          aria-label="Resize recent events panel"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sheetPct)}
          tabIndex={0}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          onLostPointerCapture={() => {
            dragRef.current = null
          }}
          onKeyDown={onHandleKeyDown}
          className="flex flex-none touch-none cursor-grab items-center justify-center py-3 select-none active:cursor-grabbing sm:hidden"
        >
          <div className="h-1.5 w-10 rounded-full bg-white/30" />
        </div>

        <div className="flex flex-none items-center justify-between px-4 pt-2 pb-3 sm:pt-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/70 uppercase">
            Recent Events
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recent events"
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-none flex-col gap-2 border-b border-white/10 px-4 pb-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {KIND_ENTRIES.map(({ kind, icon, label }) => {
              const active = visibleKinds.has(kind)
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => onToggleKind(kind)}
                  aria-pressed={active}
                  className={`${CHIP_CLASS} ${active ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50'}`}
                >
                  <img src={icon} alt="" className="h-5 w-5" />
                  {label}
                </button>
              )
            })}
          </div>
          {/* Single row, severe-to-weak (matching the map key); scrolls
              horizontally on a narrow screen rather than wrapping. */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERABLE_SEVERITY_LEVELS_DESC.map((level) => {
              const active = visibleSeverities.has(level)
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onToggleSeverity(level)}
                  aria-pressed={active}
                  className={`${CHIP_CLASS} ${active ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50'}`}
                >
                  <span
                    className="h-3 w-3 flex-none rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[level] }}
                  />
                  {level}
                </button>
              )
            })}
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="self-start text-xs font-semibold text-sky-400 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        <ul className="flex flex-col gap-2 overflow-y-auto px-4 py-3">
          {events.length === 0 && (
            <li className="text-sm text-white/60">
              {isFiltered
                ? 'No events match your filters.'
                : 'No events to show right now.'}
            </li>
          )}
          {events.map((event, index) => {
            const distanceFromUserKm =
              event.kind === 'earthquake' && userLocation
                ? haversineDistanceKm(event.location, userLocation)
                : null
            const timeLine =
              distanceFromUserKm !== null
                ? `${formatRelativeTime(event.time)} · ${formatDistanceKm(distanceFromUserKm)} from you`
                : formatRelativeTime(event.time)

            const rank = latestQuakeRanks.get(event.id)
            // Ranked rows are contiguous at the top (quakes sorted newest-
            // first), so the divider drops in once, before the first row that
            // isn't ranked while the previous one was.
            const showOlderDivider =
              rank == null && index > 0 && latestQuakeRanks.has(events[index - 1].id)

            return (
              <Fragment key={event.id}>
                {showOlderDivider && (
                  <li
                    aria-hidden="true"
                    className="flex items-center gap-2 px-1 pt-1 text-[10px] font-semibold tracking-widest text-white/30 uppercase"
                  >
                    <span className="h-px flex-1 bg-white/10" />
                    older
                    <span className="h-px flex-1 bg-white/10" />
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    style={{ borderLeftColor: SEVERITY_COLORS[event.severity] }}
                    className={`flex w-full items-center gap-2.5 rounded-lg border-l-4 bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/15 ${
                      event.id === selectedEventId ? 'bg-white/15' : ''
                    }`}
                  >
                    <span className="relative flex-none">
                      <img
                        src={ICONS_BY_KIND[event.kind][event.severity]}
                        alt=""
                        className="h-11 w-11"
                      />
                      {rank != null && (
                        <span className="absolute -top-1 -left-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-slate-900 ring-2 ring-slate-900">
                          {rank}
                        </span>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">{event.title}</span>
                        {newEventIds.has(event.id) && (
                          <span className="flex-none rounded-full bg-sky-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                            New
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-white/70">{event.ratingText}</span>
                      <span className="truncate text-xs text-white/70">{timeLine}</span>
                    </span>
                  </button>
                </li>
              </Fragment>
            )
          })}
        </ul>
      </aside>
    </>
  )
}
