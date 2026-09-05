import { useEffect, useRef, useState } from 'react'
import type { DisasterEvent } from '../types/event'

const MAX_TOASTS = 3

interface NewEventsResult {
  /** Event IDs that appeared after the app's first successful load - not the initial batch. */
  newEventIds: Set<string>
  /** Events to show as toast notifications, most recent first. */
  toastQueue: DisasterEvent[]
  /** Clears the "new" flag and dismisses the toast for one event, e.g. once the user has viewed it. */
  acknowledge: (id: string) => void
}

/**
 * Distinguishes "just arrived while the app was open" from "was already
 * there on first load". Seeding is gated on `isReady` (both underlying
 * queries having resolved at least once) rather than `events.length > 0` -
 * earthquakes and volcanoes load independently, so gating on the combined
 * list being merely non-empty would seed against whichever one happened to
 * respond first, then wrongly flag the other's data as new the moment it
 * arrives a beat later.
 */
export function useNewEvents(events: DisasterEvent[], isReady: boolean): NewEventsResult {
  const knownIds = useRef<Set<string> | null>(null)
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set())
  const [toastQueue, setToastQueue] = useState<DisasterEvent[]>([])

  useEffect(() => {
    if (!isReady) return

    if (knownIds.current === null) {
      knownIds.current = new Set(events.map((event) => event.id))
      return
    }

    const arrived = events.filter((event) => !knownIds.current!.has(event.id))
    if (arrived.length === 0) return

    for (const event of arrived) knownIds.current.add(event.id)
    setNewEventIds((current) => {
      const next = new Set(current)
      for (const event of arrived) next.add(event.id)
      return next
    })
    setToastQueue((current) => [...arrived, ...current].slice(0, MAX_TOASTS))
  }, [events, isReady])

  function acknowledge(id: string) {
    setNewEventIds((current) => {
      if (!current.has(id)) return current
      const next = new Set(current)
      next.delete(id)
      return next
    })
    setToastQueue((current) => current.filter((event) => event.id !== id))
  }

  return { newEventIds, toastQueue, acknowledge }
}
