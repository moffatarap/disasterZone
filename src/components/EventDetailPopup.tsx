import { Popup } from 'react-map-gl/maplibre'
import { formatEventTime } from '../lib/events'
import type { DisasterEvent } from '../types/event'
import './EventDetailPopup.css'

interface EventDetailPopupProps {
  event: DisasterEvent
  onClose: () => void
}

export function EventDetailPopup({ event, onClose }: EventDetailPopupProps) {
  return (
    <Popup
      latitude={event.location.lat}
      longitude={event.location.lng}
      onClose={onClose}
      closeOnClick={false}
      offset={20}
      anchor="bottom"
      className="event-detail-popup"
    >
      <div className={`event-detail-popup__header event-detail-popup__header--${event.severity}`}>
        {event.severity.toUpperCase()}
      </div>
      <h3 className="event-detail-popup__title">{event.title}</h3>
      <p className="event-detail-popup__rating">{event.ratingText}</p>
      <p className="event-detail-popup__detail">{event.detail}</p>
      <p className="event-detail-popup__time">{formatEventTime(event.time)}</p>
    </Popup>
  )
}
