import { useState } from 'react'
import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'

// Fire/flood/hurricane/tornado are intentionally left out of the key for now -
// they aren't wired to real data yet (see the placeholder-events phase).
const KEY_ENTRIES = [
  { icon: earthquakeIcon, label: 'Earthquake' },
  { icon: volcanoIcon, label: 'Volcano' },
]

export function SeverityKey() {
  const [expandedOnMobile, setExpandedOnMobile] = useState(false)

  return (
    <div className="absolute top-3 right-3 z-[5]">
      <button
        type="button"
        onClick={() => setExpandedOnMobile((expanded) => !expanded)}
        aria-expanded={expandedOnMobile}
        aria-label="Toggle map key"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md sm:hidden"
      >
        i
      </button>

      <div
        className={`mt-2 rounded-lg bg-white/95 px-3.5 py-2.5 shadow-md sm:mt-0 sm:block ${
          expandedOnMobile ? 'block' : 'hidden'
        }`}
      >
        <h4 className="mb-1.5 text-xs tracking-wide text-slate-500">KEY</h4>
        <ul className="flex flex-col gap-1">
          {KEY_ENTRIES.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-sm">
              <img src={entry.icon} alt="" className="h-[18px] w-[18px]" />
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
