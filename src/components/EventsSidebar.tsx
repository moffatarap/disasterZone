import { EARTHQUAKE_ICONS, SEVERITY_COLORS, VOLCANO_ICONS } from '../constants/severity'
import { formatEventTime } from '../lib/events'
import type { DisasterEvent } from '../types/event'
import './EventsSidebar.css'

interface EventsSidebarProps {
  events: DisasterEvent[]
  isOpen: boolean
  selectedEventId: string | null
  onSelectEvent: (event: DisasterEvent) => void
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
}: EventsSidebarProps) {
  return (
    <aside className={`events-sidebar${isOpen ? ' events-sidebar--open' : ''}`}>
      <h2 className="events-sidebar__title">Recent Events</h2>
      <ul className="events-sidebar__list">
        {events.length === 0 && (
          <li className="events-sidebar__empty">No events to show right now.</li>
        )}
        {events.map((event) => (
          <li key={event.id}>
            <button
              type="button"
              className={`events-sidebar__item${
                event.id === selectedEventId ? ' events-sidebar__item--selected' : ''
              }`}
              style={{ borderLeftColor: SEVERITY_COLORS[event.severity] }}
              onClick={() => onSelectEvent(event)}
            >
              <img
                src={ICONS_BY_KIND[event.kind][event.severity]}
                alt=""
                className="events-sidebar__icon"
              />
              <span className="events-sidebar__details">
                <span className="events-sidebar__location">{event.title}</span>
                <span className="events-sidebar__rating">{event.ratingText}</span>
                <span className="events-sidebar__time">{formatEventTime(event.time)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
