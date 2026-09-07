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

// Debounced to stay under Nominatim's ~1 request/second policy.
const SEARCH_DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 3

// One screen slot, one state at a time: the address pill and the "can't get
// your location" form never show together.
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
  // Only the response matching the most recent query is applied (guards
  // against out-of-order responses).
  const latestRequestId = useRef(0)

  const trimmedQuery = inputValue.trim()
  // Derived, not stored - so the effect below never has to clear stale
  // suggestions when the query gets too short.
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
      // bottom-16 / left-20 keep this card clear of MapLibre's attribution
      // control and the bottom-left zoom control (see docs/DECISIONS.md).
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
      // Same bottom-16 / left-20 positioning as the address-pill branch.
      <div className="absolute bottom-16 left-20 right-4 z-[6] mx-auto max-w-sm rounded-lg bg-slate-900/90 px-4 py-3 text-white shadow-lg">
        {/* h2: its own top-level section (see docs/DECISIONS.md). */}
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
