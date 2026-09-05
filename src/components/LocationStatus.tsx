import { useState, type FormEvent } from 'react'
import locationIcon from '../assets/media/img/locationIcon-01.svg'

interface LocationStatusProps {
  address: string | null
  isManualAddress: boolean
  locationError: string | null
  onSubmitAddress: (address: string) => void
  onClearManual: () => void
  isSubmitting: boolean
  notFound: boolean
}

// Shares one screen slot for whichever state applies - showing an address
// pill and the "can't get your location" form at the same time never makes
// sense, so there's no layout conflict to resolve between them.
export function LocationStatus({
  address,
  isManualAddress,
  locationError,
  onSubmitAddress,
  onClearManual,
  isSubmitting,
  notFound,
}: LocationStatusProps) {
  const [inputValue, setInputValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (inputValue.trim()) onSubmitAddress(inputValue.trim())
  }

  if (address) {
    return (
      <div className="absolute bottom-4 left-1/2 z-[6] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-white shadow-lg">
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
      <div className="absolute bottom-4 left-1/2 z-[6] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg bg-slate-900/90 px-4 py-3 text-white shadow-lg">
        <h3 className="text-sm font-semibold">Can't get your location</h3>
        <p className="mt-1 text-xs text-white/85">
          Enter your address instead to see how far events are from you.
        </p>
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="e.g. Lambton Quay, Wellington"
            className="min-w-0 flex-1 rounded-md bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting || !inputValue.trim()}
            className="flex-none rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Use'}
          </button>
        </form>
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
