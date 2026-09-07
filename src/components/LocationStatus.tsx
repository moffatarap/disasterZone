import { useEffect, useRef, useState, type FormEvent } from 'react'
import locationIcon from '../assets/media/img/locationIcon-01.svg'
import { searchAddresses, type ForwardGeocodeResult } from '../api/nominatim'

interface LocationStatusProps {
  address: string | null
  isManualAddress: boolean
  locationError: string | null
  /** True until the browser's geolocation has responded at least once. */
  isLocating: boolean
  onSubmitAddress: (address: string) => void
  onSelectSuggestion: (result: ForwardGeocodeResult) => void
  onClearManual: () => void
  isSubmitting: boolean
  notFound: boolean
}

// Debounced to stay under Nominatim's ~1 request/second policy.
const SEARCH_DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 3

// A persistent full-width bar pinned to the bottom of the map. It always
// shows the current location state (locating / an address / unavailable) and
// always offers "Change" - a manual address can override a GPS fix, which
// matters for anyone on a VPN whose device location is wrong. The map's zoom
// and attribution controls are lifted clear of it (see DisasterMap).
export function LocationStatus({
  address,
  isManualAddress,
  locationError,
  isLocating,
  onSubmitAddress,
  onSelectSuggestion,
  onClearManual,
  isSubmitting,
  notFound,
}: LocationStatusProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<ForwardGeocodeResult[]>([])
  // Only the response matching the most recent query is applied (guards
  // against out-of-order responses).
  const latestRequestId = useRef(0)
  // Set when a free-text address is submitted, so the effect below can close
  // the editor once the async lookup lands (unless it came back not-found).
  const pendingSubmit = useRef(false)

  const trimmedQuery = inputValue.trim()
  // Derived, not stored - so the effect below never has to clear stale
  // suggestions when the query gets too short.
  const visibleSuggestions = trimmedQuery.length >= MIN_QUERY_LENGTH ? suggestions : []

  useEffect(() => {
    const trimmed = inputValue.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) return

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

  useEffect(() => {
    if (pendingSubmit.current && !isSubmitting) {
      pendingSubmit.current = false
      if (!notFound) closeEditor()
    }
  }, [isSubmitting, notFound])

  function closeEditor() {
    setEditing(false)
    setInputValue('')
    setSuggestions([])
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!inputValue.trim()) return
    pendingSubmit.current = true
    onSubmitAddress(inputValue.trim())
    setSuggestions([])
  }

  function handleSelectSuggestion(result: ForwardGeocodeResult) {
    onSelectSuggestion(result)
    closeEditor()
  }

  function handleUseMyLocation() {
    onClearManual()
    closeEditor()
  }

  const mainText =
    address ??
    (locationError
      ? 'Location unavailable - add an address'
      : isLocating
        ? 'Finding your location…'
        : 'No location set - add an address')

  const showSpinner = isLocating && !address && !locationError && !editing

  return (
    <div className="absolute inset-x-2 bottom-2 z-[6] min-h-12 rounded-2xl bg-slate-900/95 px-4 py-2 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
      {editing ? (
        <div className="relative flex flex-col gap-1.5">
          {visibleSuggestions.length > 0 && (
            <ul className="absolute inset-x-0 bottom-full mb-2 max-h-56 overflow-y-auto rounded-lg bg-slate-900/98 p-1 shadow-xl ring-1 ring-white/10">
              {visibleSuggestions.map((result) => (
                <li key={`${result.lat},${result.lng}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(result)}
                    className="line-clamp-2 w-full rounded-md px-2 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {/* full string here so near-identical candidates are
                        distinguishable, even though we show only the short
                        label once one is picked */}
                    {result.full}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {/* autoFocus is deliberate: the bar only enters this state on an
                explicit "Change" / "Set address" tap. */}
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="e.g. Lambton Quay, Wellington"
              autoComplete="off"
              autoFocus
              className="min-w-0 flex-1 rounded-md bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/55 focus:bg-white/15 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputValue.trim()}
              className="flex-none rounded-md bg-sky-500 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
            >
              {isSubmitting ? '…' : 'Use'}
            </button>
            <button
              type="button"
              onClick={closeEditor}
              aria-label="Cancel address entry"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className={notFound ? 'text-red-300' : 'text-white/50'}>
              {notFound
                ? "Couldn't find that address - try being more specific."
                : 'Type an address, then pick a match above.'}
            </span>
            {isManualAddress && (
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="flex-none font-semibold text-sky-400 hover:underline"
              >
                Use my location
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-8 items-center gap-2.5">
          {showSpinner ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-white/25 border-t-white/80"
            />
          ) : (
            <img src={locationIcon} alt="" className="h-4 w-4 flex-none" />
          )}

          <p className="min-w-0 flex-1 truncate text-sm">
            {isManualAddress && address && (
              <span className="mr-1.5 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                Manual
              </span>
            )}
            <span className={address ? undefined : 'text-white/70'}>{mainText}</span>
          </p>

          <div className="flex flex-none items-center gap-3 text-xs font-semibold">
            {isManualAddress && (
              <button
                type="button"
                onClick={onClearManual}
                className="text-white/55 transition-colors hover:text-white hover:underline"
              >
                Use my location
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sky-400 hover:underline"
            >
              {address ? 'Change' : 'Set address'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
