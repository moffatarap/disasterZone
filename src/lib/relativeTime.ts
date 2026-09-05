import { formatEventTime } from './events'

/**
 * "12 min ago" for the first 24 hours, falling back to an absolute date/time
 * beyond that - relative time answers "did I just feel that", but gets
 * vague and unhelpful for older reference lookups.
 */
export function formatRelativeTime(time: Date | null): string {
  if (!time) return 'Ongoing'

  const diffMs = Date.now() - time.getTime()
  const diffMinutes = Math.round(diffMs / 60_000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  return formatEventTime(time)
}
