import { EARTHQUAKE_ICONS, SEVERITY_COLORS, VOLCANO_ICONS } from '../constants/severity'
import { formatEventTime } from '../lib/events'
import type { DisasterEvent } from '../types/event'

interface EventsSidebarProps {
  events: DisasterEvent[]
  isOpen: boolean
  selectedEventId: string | null
  onSelectEvent: (event: DisasterEvent) => void
  onClose: () => void
}

const ICONS_BY_KIND = {
  earthquake: EARTHQUAKE_ICONS,
  volcano: VOLCANO_ICONS,
} as const

export function EventsSidebar({
  events,
  isOpen,
  selectedEventId,
  onSelectEvent,
  onClose,
}: EventsSidebarProps) {
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

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Recent events"
        className={`fixed inset-x-0 bottom-0 z-20 flex max-h-[65vh] flex-col rounded-t-2xl bg-slate-900/95 text-white shadow-2xl transition-transform duration-300 ease-out sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-80 sm:rounded-none ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'
        }`}
      >
        <div className="flex flex-none items-center justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>

        <div className="flex flex-none items-center justify-between px-4 pt-2 pb-3 sm:pt-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/70 uppercase">
            Recent Events
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recent events"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <ul className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
          {events.length === 0 && (
            <li className="text-sm text-white/60">No events to show right now.</li>
          )}
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelectEvent(event)}
                style={{ borderLeftColor: SEVERITY_COLORS[event.severity] }}
                className={`flex w-full items-center gap-2.5 rounded-lg border-l-4 bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/15 ${
                  event.id === selectedEventId ? 'bg-white/15' : ''
                }`}
              >
                <img
                  src={ICONS_BY_KIND[event.kind][event.severity]}
                  alt=""
                  className="h-7 w-7 flex-none"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{event.title}</span>
                  <span className="text-xs text-white/70">{event.ratingText}</span>
                  <span className="text-xs text-white/70">{formatEventTime(event.time)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
