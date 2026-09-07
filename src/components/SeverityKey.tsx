import { useState } from 'react'
import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'
import { FILTERABLE_SEVERITY_LEVELS_DESC, SEVERITY_COLORS } from '../constants/severity'

// Earthquake and volcano only - the other hazards aren't wired to real data
// yet (see docs/DECISIONS.md).
const KIND_ENTRIES = [
  { icon: earthquakeIcon, label: 'Earthquake' },
  { icon: volcanoIcon, label: 'Volcano' },
]

// Button and panel each anchor to their own `top-3 right-3` / `top-16 right-3`
// rather than a shared wrapper, so the button doesn't shift when the panel
// toggles. It stays put when the events sidebar opens too - the sidebar
// (z-20) simply covers it (z-5). Minimised by default at every breakpoint.
// (See docs/DECISIONS.md.)
interface SeverityKeyProps {
  showFaultLines: boolean
  onToggleFaultLines: () => void
  showInactiveVolcanoes: boolean
  onToggleInactiveVolcanoes: () => void
}

export function SeverityKey({
  showFaultLines,
  onToggleFaultLines,
  showInactiveVolcanoes,
  onToggleInactiveVolcanoes,
}: SeverityKeyProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label="Toggle map key"
        className="absolute top-3 right-3 z-[5] flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/95 text-white/80 shadow-xl ring-1 ring-white/10 transition-colors hover:bg-slate-800"
      >
        i
      </button>

      <div
        className={`absolute top-16 right-3 z-[5] rounded-lg bg-slate-900/95 px-3.5 py-2.5 text-white shadow-xl ring-1 ring-white/10 ${
          expanded ? 'block' : 'hidden'
        }`}
      >
        {/* KEY is a top-level section (h2); INTENSITY nests under it (h3).
            See docs/DECISIONS.md on heading levels. */}
        <h2 className="mb-1.5 text-xs tracking-wide text-white/50">KEY</h2>
        <ul className="flex flex-col gap-1">
          {KIND_ENTRIES.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-sm">
              {/* brightness-0 invert -> flat white silhouette; the icons' own
                  fill is dark-grey, invisible on the slate card otherwise. */}
              <img src={entry.icon} alt="" className="h-8 w-8 brightness-0 invert" />
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-3 mb-1.5 border-t border-white/10 pt-2.5 text-xs tracking-wide text-white/50">
          INTENSITY
        </h3>
        <ul className="flex flex-col gap-1">
          {FILTERABLE_SEVERITY_LEVELS_DESC.map((level) => (
            <li key={level} className="flex items-center gap-1.5 text-sm capitalize">
              <span
                className="h-4 w-4 flex-none rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[level] }}
              />
              <span>{level}</span>
            </li>
          ))}
        </ul>

        <p className="mt-1.5 max-w-[160px] text-[10px] leading-snug text-white/50">
          Quakes: how strongly it was felt. Volcanoes: official alert level.
        </p>

        {/* Optional reference context, not part of the hazard legend, so these
            sit below their own divider. */}
        <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-2.5 text-xs text-white/80">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showFaultLines}
              onChange={onToggleFaultLines}
              className="h-3.5 w-3.5 rounded border-white/25 bg-white/10 text-sky-500 focus:ring-2 focus:ring-sky-400"
            />
            Show fault lines
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showInactiveVolcanoes}
              onChange={onToggleInactiveVolcanoes}
              className="h-3.5 w-3.5 rounded border-white/25 bg-white/10 text-sky-500 focus:ring-2 focus:ring-sky-400"
            />
            Show inactive volcanoes
          </label>
        </div>
      </div>
    </>
  )
}
