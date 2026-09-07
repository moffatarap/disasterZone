import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  /**
   * Ask the browser for a fresh one-shot GPS fix (the "Use my location" item).
   * `onSuccess` runs only if a position comes back.
   */
  onRequestLocation: (options?: { onSuccess?: () => void; onError?: () => void }) => void
  isSubmitting: boolean
  notFound: boolean
  /**
   * The events panel is a full-height rail at >= sm (z-20, 20rem wide) and
   * this bar sits under it, so the bar has to end short of the rail or its
   * only control - "Change" - is unreachable.
   */
  isSidebarOpen: boolean
}

// Debounced so the box doesn't fire per keystroke. Note this is a ceiling of
// one request per window, i.e. ~3/s from someone typing at a steady 300ms -
// above Nominatim's ~1 req/s guideline, which is written for bulk clients. In
// practice a human types in bursts, MIN_QUERY_LENGTH drops the first two
// characters, and picking a suggestion ends the run early. A throttled 429 is
// handled: it counts as not-found, so the editor stays open (see
// useManualLocation). Revisit if we ever actually see them.
const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3

const NO_SUGGESTIONS = { query: '', results: [] as ForwardGeocodeResult[] }

// How long a failed "Use my location" is reported before the bar goes back to
// showing the address it kept. Long enough to read, short enough that the bar
// returns to its job.
const LOCATION_ERROR_VISIBLE_MS = 5000

const ICON_CLASS = 'h-4 w-4 flex-none'

// A crosshair - the address came from the device's geolocation. A pin - the
// address was typed by hand. Same weight and colour; the shape is the only
// difference, which replaces the old "Manual" word tag.
function CrosshairIcon({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      className={`${ICON_CLASS} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="7" />
      <line x1="12" y1="1" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="1" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="23" y2="12" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PinIcon({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      className={`${ICON_CLASS} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`${ICON_CLASS} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

// A persistent full-width bar pinned to the bottom of the map. It always
// shows the current location state (locating / an address / unavailable) and
// always offers "Change", which opens a two-item menu: re-request the device
// location, or type an address. A typed address can override a working GPS
// fix, which matters for anyone on a VPN whose device location is wrong. The
// map's zoom and attribution controls are lifted clear of it (see DisasterMap).
export function LocationStatus({
  address,
  isManualAddress,
  locationError,
  isLocating,
  onSubmitAddress,
  onSelectSuggestion,
  onClearManual,
  onRequestLocation,
  isSubmitting,
  notFound,
  isSidebarOpen,
}: LocationStatusProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  // Status of an explicit "Use my location" request. Tracked separately from
  // the ambient geolocation state because that state can't express it: a
  // failed request deliberately keeps the existing address, so `address` stays
  // truthy and both the spinner and the error would be hidden behind it.
  const [locationRequest, setLocationRequest] = useState<'idle' | 'pending' | 'failed'>('idle')
  const [inputValue, setInputValue] = useState('')
  // Results carry the query that produced them, so a list fetched for an
  // earlier query is never rendered against what's in the box now.
  const [suggestions, setSuggestions] = useState(NO_SUGGESTIONS)
  // Only the response matching the most recent query is applied (guards
  // against out-of-order responses).
  const latestRequestId = useRef(0)
  // Set when a free-text address is submitted, so the effect below can close
  // the editor once the async lookup lands (unless it came back not-found).
  const pendingSubmit = useRef(false)
  const changeButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  // Set when the editor is dismissed by keyboard, so focus can be put back on
  // the "Change" button once it re-renders.
  const refocusChangeButton = useRef(false)

  const trimmedQuery = inputValue.trim()
  // Derived, not stored - the dropdown shows results only while their tag
  // matches what's in the box, so nothing appears until this query's own
  // results land, and an earlier query's list is never passed off as an answer.
  const visibleSuggestions =
    trimmedQuery.length >= MIN_QUERY_LENGTH && suggestions.query === trimmedQuery
      ? suggestions.results
      : []

  useEffect(() => {
    const trimmed = inputValue.trim()
    // Bumped before the length guard too, so a query abandoned by deleting
    // back below the minimum can't still land and repopulate the list.
    const requestId = ++latestRequestId.current
    if (trimmed.length < MIN_QUERY_LENGTH) return

    const timer = setTimeout(() => {
      searchAddresses(trimmed)
        .then((results) => {
          if (latestRequestId.current === requestId) setSuggestions({ query: trimmed, results })
        })
        .catch(() => {
          if (latestRequestId.current === requestId) setSuggestions({ query: trimmed, results: [] })
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

  // Both the menu and the editor are dismissed by clicking away (including on
  // the map) or pressing Escape - the same lightweight, non-modal pattern used
  // elsewhere in the app. Escape returns focus to the "Change" button.
  useEffect(() => {
    if (!menuOpen && !editing) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      // Let the "Change" button's own click handle the toggle - otherwise a
      // pointerdown here closes the menu and the click immediately reopens it.
      if (!editing && changeButtonRef.current?.contains(target)) return
      const root = editing ? editorRef.current : menuRef.current
      if (root && !root.contains(target)) {
        if (editing) closeEditor()
        else setMenuOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (editing) {
        // The "Change" button isn't rendered in the editing branch, so its ref
        // is null right now - focus it from the effect below, once closing the
        // editor has brought it back.
        refocusChangeButton.current = true
        closeEditor()
      } else {
        setMenuOpen(false)
        changeButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, editing])

  // A reported failure is transient: the address the request kept is what the
  // bar is for, so hand it back after a few seconds. If there's no address the
  // ambient locationError keeps the message up anyway.
  useEffect(() => {
    if (locationRequest !== 'failed') return
    const timer = setTimeout(() => setLocationRequest('idle'), LOCATION_ERROR_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [locationRequest])

  // Move focus into the menu when it opens so it's keyboard-operable.
  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
  }, [menuOpen])

  // Escape out of the editor puts focus back on "Change", which only exists
  // again once `editing` is false.
  useEffect(() => {
    if (editing || !refocusChangeButton.current) return
    refocusChangeButton.current = false
    changeButtonRef.current?.focus()
  }, [editing])

  // Declared below the effects on purpose: keeps the async-submit effect above
  // from tripping the "no setState in an effect body" lint rule.
  function closeEditor() {
    setEditing(false)
    setInputValue('')
    setSuggestions(NO_SUGGESTIONS)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!inputValue.trim()) return
    pendingSubmit.current = true
    // Invalidate any in-flight search, or its response lands mid-submit and
    // reopens the dropdown over the bar.
    latestRequestId.current += 1
    onSubmitAddress(inputValue.trim())
    setSuggestions(NO_SUGGESTIONS)
  }

  function handleSelectSuggestion(result: ForwardGeocodeResult) {
    onSelectSuggestion(result)
    closeEditor()
  }

  function handleUseMyLocation() {
    setMenuOpen(false)
    setLocationRequest('pending')
    onRequestLocation({
      // Drop the manual override only once a real fix lands - if geolocation
      // fails, the typed address stays put rather than falling back to nothing.
      onSuccess: () => {
        setLocationRequest('idle')
        onClearManual()
      },
      onError: () => setLocationRequest('failed'),
    })
  }

  function handleEnterAddress() {
    setMenuOpen(false)
    setEditing(true)
  }

  const isRequestingLocation = locationRequest === 'pending'
  const requestFailed = locationRequest === 'failed'

  // An explicit request reports itself over the top of whatever address is
  // showing; otherwise fall back to the ambient state.
  const mainText = isRequestingLocation
    ? 'Finding your location…'
    : requestFailed
      ? (locationError ?? 'Could not get your location')
      : (address ??
        (locationError
          ? `${locationError} - add an address`
          : isLocating
            ? 'Finding your location…'
            : 'No location set - add an address'))

  const showAddressText = address !== null && !isRequestingLocation && !requestFailed
  const showSpinner =
    !editing && (isRequestingLocation || (isLocating && !address && !locationError))

  const menuItemClass =
    'flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-normal text-white/90 transition-colors hover:bg-white/10 hover:text-white'

  return (
    <div
      className={`absolute inset-x-2 bottom-2 z-[6] min-h-12 rounded-2xl bg-slate-900/95 px-4 py-2 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-sm ${
        // 20rem rail + the bar's own 0.5rem gutter.
        isSidebarOpen ? 'sm:right-[20.5rem]' : ''
      }`}
    >
      {editing ? (
        <div ref={editorRef} className="relative">
          {visibleSuggestions.length > 0 && (
            /* -left-4/-right-4 cancels the card's px-4 so the dropdown spans
               the full width of the bar. Rows carry a deep left indent (pl-6)
               so their text lines up with the input's text below (bar px-4 +
               input p-3). */
            <ul className="absolute -left-4 -right-4 bottom-full mb-2 max-h-56 overflow-y-auto rounded-lg bg-slate-900/98 p-1 shadow-xl ring-1 ring-white/10">
              {visibleSuggestions.map((result) => (
                <li key={`${result.lat},${result.lng}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(result)}
                    className="block w-full rounded-md py-3 pr-3 pl-6 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {/* full string here so near-identical candidates are
                        distinguishable, even though we show only the short
                        label once one is picked. line-clamp goes on this span,
                        not the button - -webkit-box on the button itself
                        fights its own box and the clamp silently no-ops. */}
                    <span className="line-clamp-2">{result.full}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* No placeholder or hint text. autoFocus is deliberate: the bar only
              enters this state from an explicit "Enter address" menu pick.
              notFound shows as a red ring rather than a second line. There's no
              cancel button - click away or press Escape. */}
          <form onSubmit={handleSubmit} className="flex min-h-8 items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              aria-label="Address"
              aria-invalid={notFound || undefined}
              autoComplete="off"
              autoFocus
              className={`min-w-0 flex-1 rounded-lg bg-white/5 p-3 text-sm text-white transition-colors focus:bg-white/10 focus:outline-none ${
                notFound ? 'ring-1 ring-red-400' : ''
              }`}
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputValue.trim()}
              className="flex-none rounded-lg bg-sky-500 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
            >
              {isSubmitting ? '…' : 'Submit'}
            </button>
          </form>
        </div>
      ) : (
        <div className="relative flex min-h-8 items-center gap-2.5">
          {showSpinner ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-white/25 border-t-white/80"
            />
          ) : isManualAddress && address ? (
            <PinIcon className="text-white" title="Address you entered" />
          ) : address ? (
            <CrosshairIcon className="text-white" title="Address from your device location" />
          ) : (
            <PinIcon className="text-white/70" />
          )}

          <p className="min-w-0 flex-1 truncate text-sm">
            <span className={showAddressText ? undefined : 'text-white/70'}>{mainText}</span>
          </p>

          <button
            ref={changeButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex-none text-xs font-semibold text-sky-400 hover:underline"
          >
            {address ? 'Change' : 'Set address'}
          </button>

          {/* Sized to its content, right edge flush with the bar (like the
              autocomplete's -right-4 edge). bottom-full mb-2 gives it the same
              gap above the bar as the autocomplete list has above the input. */}
          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Location options"
              className="absolute -right-4 bottom-full mb-2 w-max min-w-[12rem] rounded-lg bg-slate-900/98 p-1 shadow-xl ring-1 ring-white/10"
            >
              <button type="button" role="menuitem" onClick={handleUseMyLocation} className={menuItemClass}>
                <CrosshairIcon className="text-white/70" />
                Use my location
              </button>
              <button type="button" role="menuitem" onClick={handleEnterAddress} className={menuItemClass}>
                <PencilIcon className="text-white/70" />
                Enter address
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
