import { useEffect, useRef, useState, type FormEvent } from 'react'
import locationIcon from '../assets/media/img/locationIcon-01.svg'
import { searchAddresses, type ForwardGeocodeResult } from '../api/nominatim'

interface LocationStatusProps {
  address: string | null
  isManualAddress: boolean
  locationError: string | null
  onSubmitAddress: (address: string) => void
  onSelectSuggestion: (result: ForwardGeocodeResult) => void
  onClearManual: () => void
  isSubmitting: boolean
  notFound: boolean
}

// Debounced rather than firing per-keystroke - Nominatim's usage policy caps
// this at ~1 request/second, and a debounce that only fires once typing
// pauses stays well under that regardless of typing speed.
const SEARCH_DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 3

// Shares one screen slot for whichever state applies - showing an address
// pill and the "can't get your location" form at the same time never makes
// sense, so there's no layout conflict to resolve between them.
export function LocationStatus({
  address,
  isManualAddress,
  locationError,
  onSubmitAddress,
  onSelectSuggestion,
  onClearManual,
  isSubmitting,
  notFound,
}: LocationStatusProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<ForwardGeocodeResult[]>([])
  // Guards against a slower, earlier request's results landing after a
  // faster, later one's - only the response matching the most recent query
  // is ever applied.
  const latestRequestId = useRef(0)

  const trimmedQuery = inputValue.trim()
  // Rendered instead of stored: short-circuiting here means the effect below
  // never needs to synchronously clear `suggestions` itself when the query
  // gets too short, just skip firing a new search.
  const visibleSuggestions = trimmedQuery.length >= MIN_QUERY_LENGTH ? suggestions : []

  useEffect(() => {
    const trimmed = inputValue.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return
    }

    const requestId = ++latestRequestId.current
    const timer = setTimeout(() => {
      searchAddresses(trimmed)
        .then((results) => {
          if (latestRequestId.current === requestId) setSuggestions(results)
        })
        .catch(() => {
          if (latestRequestId.current === requestId) setSuggestions([])
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [inputValue])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (inputValue.trim()) onSubmitAddress(inputValue.trim())
    setSuggestions([])
  }

  function handleSelectSuggestion(result: ForwardGeocodeResult) {
    onSelectSuggestion(result)
    setInputValue('')
    setSuggestions([])
  }

  if (address) {
    return (
      // bottom-16, not bottom-4 - at bottom-4 this card sat on top of
      // MapLibre's own attribution control at the bottom of the map,
      // making the required attribution link unreadable underneath it
      // (found via an accessibility audit's bounding-box check, confirmed
      // with a screenshot). bottom-16 clears its ~44px height with margin.
      // left-20/right-4 (not centered) - a centered card at that height
      // extends into the bottom-left zoom control's ~54px-wide column,
      // partially obscuring it (another audit finding, this one a target-
      // size violation). Insetting the left edge past that column, then
      // letting mx-auto center the card within the remaining space, clears
      // it without needing to push the card even higher.
      <div className="absolute bottom-16 left-20 right-4 z-[6] mx-auto flex max-w-sm items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-white shadow-lg">
        <img src={locationIcon} alt="" className="h-4 w-4 flex-none" />
        <span className="min-w-0 flex-1 truncate text-xs">{address}</span>
        {isManualAddress && (
          <button
            type="button"
            onClick={onClearManual}
            className="flex-none text-xs font-semibold text-sky-400 hover:underline"
          >
            Change
          </button>
        )}
      </div>
    )
  }

  if (locationError) {
    return (
      // See the bottom-16/left-20 notes on the address-pill branch above -
      // same attribution-overlap and zoom-control-overlap fixes apply here.
      <div className="absolute bottom-16 left-20 right-4 z-[6] mx-auto max-w-sm rounded-lg bg-slate-900/90 px-4 py-3 text-white shadow-lg">
        {/* h2, not h3 - see the matching note in EventDetailPopup.tsx: this
            floating card is its own top-level section, not nested under
            anything else on the page. */}
        <h2 className="text-sm font-semibold">Can't get your location</h2>
        <p className="mt-1 text-xs text-white/85">
          Enter your address instead to see how far events are from you.
        </p>
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="e.g. Lambton Quay, Wellington"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-md bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/55 focus:bg-white/15 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting || !inputValue.trim()}
            className="flex-none rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Use'}
          </button>
        </form>
        {visibleSuggestions.length > 0 && (
          <ul className="mt-2 flex max-h-40 flex-col gap-0.5 overflow-y-auto border-t border-white/10 pt-2">
            {visibleSuggestions.map((result) => (
              <li key={`${result.lat},${result.lng}`}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(result)}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {result.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
        {notFound && (
          <p className="mt-1.5 text-xs text-red-300">
            Couldn't find that address - try being more specific.
          </p>
        )}
      </div>
    )
  }

  return null
}
