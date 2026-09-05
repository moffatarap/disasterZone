import { useEffect } from 'react'
import { EARTHQUAKE_ICONS, SEVERITY_COLORS, VOLCANO_ICONS } from '../constants/severity'
import type { DisasterEvent } from '../types/event'

const AUTO_DISMISS_MS = 8000

const ICONS_BY_KIND = {
  earthquake: EARTHQUAKE_ICONS,
  volcano: VOLCANO_ICONS,
} as const

interface NewEventToastProps {
  event: DisasterEvent
  onView: (event: DisasterEvent) => void
  onDismiss: (id: string) => void
}

export function NewEventToast({ event, onView, onDismiss }: NewEventToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(event.id), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [event.id, onDismiss])

  return (
    <div
      role="status"
      style={{ borderLeftColor: SEVERITY_COLORS[event.severity] }}
      className="pointer-events-auto flex w-72 items-center gap-3 rounded-lg border-l-4 bg-slate-900/95 py-2.5 pr-2 pl-3 text-white shadow-xl"
    >
      <img src={ICONS_BY_KIND[event.kind][event.severity]} alt="" className="h-9 w-9 flex-none" />

      <button
        type="button"
        onClick={() => onView(event)}
        className="flex min-w-0 flex-1 flex-col text-left"
      >
        <span className="text-[10px] font-bold tracking-wide text-white/60 uppercase">
          New {event.kind}
        </span>
        <span className="truncate text-sm font-semibold">{event.title}</span>
        <span className="text-xs text-white/70">{event.ratingText}</span>
      </button>

      <button
        type="button"
        onClick={() => onDismiss(event.id)}
        aria-label="Dismiss notification"
        className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}
