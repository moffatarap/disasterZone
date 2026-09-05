import { useState } from 'react'
import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'
import { FILTERABLE_SEVERITY_LEVELS, SEVERITY_COLORS } from '../constants/severity'

// Fire/flood/hurricane/tornado are intentionally left out of the key for now -
// they aren't wired to real data yet (see the placeholder-events phase).
const KIND_ENTRIES = [
  { icon: earthquakeIcon, label: 'Earthquake' },
  { icon: volcanoIcon, label: 'Volcano' },
]

// Button and panel are independently positioned (not nested in a shared
// shrink-to-fit container) on purpose: they used to share one `absolute`
// wrapper sized to fit whichever child was widest, so the button visibly
// shifted sideways whenever the panel toggled open/closed and changed that
// wrapper's width. Each now has its own fixed `right-3` anchor instead.
export function SeverityKey() {
  const [expandedOnMobile, setExpandedOnMobile] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setExpandedOnMobile((expanded) => !expanded)}
        aria-expanded={expandedOnMobile}
        aria-label="Toggle map key"
        className="absolute top-3 right-3 z-[5] flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md sm:hidden"
      >
        i
      </button>

      <div
        className={`absolute top-16 right-3 z-[5] rounded-lg bg-white/95 px-3.5 py-2.5 shadow-md sm:top-3 sm:block ${
          expandedOnMobile ? 'block' : 'hidden'
        }`}
      >
        <h4 className="mb-1.5 text-xs tracking-wide text-slate-500">KEY</h4>
        <ul className="flex flex-col gap-1">
          {KIND_ENTRIES.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-sm">
              <img src={entry.icon} alt="" className="h-8 w-8" />
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>

        <h4 className="mt-3 mb-1.5 border-t border-slate-100 pt-2.5 text-xs tracking-wide text-slate-500">
          INTENSITY
        </h4>
        <ul className="flex flex-col gap-1">
          {FILTERABLE_SEVERITY_LEVELS.map((level) => (
            <li key={level} className="flex items-center gap-1.5 text-sm capitalize">
              <span
                className="h-4 w-4 flex-none rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[level] }}
              />
              <span>{level}</span>
            </li>
          ))}
        </ul>

        <p className="mt-1.5 max-w-[160px] text-[10px] leading-snug text-slate-400">
          Quakes: how strongly it was felt. Volcanoes: official alert level.
        </p>
      </div>
    </>
  )
}
