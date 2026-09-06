import { useState } from 'react'
import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'
import { FILTERABLE_SEVERITY_LEVELS_DESC, SEVERITY_COLORS } from '../constants/severity'

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
//
// Minimised by default on every breakpoint - it used to stay permanently
// expanded on tablet/desktop with no way to collapse it there at all.
interface SeverityKeyProps {
  sidebarOpen: boolean
  showFaultLines: boolean
  onToggleFaultLines: () => void
}

export function SeverityKey({ sidebarOpen, showFaultLines, onToggleFaultLines }: SeverityKeyProps) {
  const [expanded, setExpanded] = useState(false)

  // The events sidebar is a `sm:w-80` (320px) panel anchored to the same
  // right edge as this button/panel - now that the button renders at every
  // breakpoint (not just mobile, where the sidebar is a bottom sheet that
  // doesn't reach this corner), it needs to step aside on tablet/desktop
  // whenever that panel is open, or it ends up covered and unclickable.
  const rightOffsetClass = sidebarOpen ? 'sm:right-[332px]' : 'sm:right-3'

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label="Toggle map key"
        className={`absolute top-3 right-3 z-[5] flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md transition-[right] duration-300 ease-out ${rightOffsetClass}`}
      >
        i
      </button>

      <div
        className={`absolute top-16 right-3 z-[5] rounded-lg bg-white/95 px-3.5 py-2.5 shadow-md transition-[right] duration-300 ease-out ${rightOffsetClass} ${
          expanded ? 'block' : 'hidden'
        }`}
      >
        {/* h2/h3, not h4 - this panel's headings previously jumped straight
            from the page's one h1 (the navbar title) to h4, skipping levels
            (flagged by an axe-core heading-order audit). KEY is a top-level
            sibling section to the page's other floating panels (h2);
            INTENSITY nests one level under it (h3). */}
        <h2 className="mb-1.5 text-xs tracking-wide text-slate-500">KEY</h2>
        <ul className="flex flex-col gap-1">
          {KIND_ENTRIES.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-sm">
              <img src={entry.icon} alt="" className="h-8 w-8" />
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-3 mb-1.5 border-t border-slate-100 pt-2.5 text-xs tracking-wide text-slate-500">
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

        <p className="mt-1.5 max-w-[160px] text-[10px] leading-snug text-slate-400">
          Quakes: how strongly it was felt. Volcanoes: official alert level.
        </p>

        {/* The one interactive control in an otherwise plain legend -
            fault lines are optional reference context (off by default, see
            App.tsx) rather than part of the hazard legend itself, so it's
            set apart with its own divider rather than folded into the lists
            above. */}
        <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={showFaultLines}
            onChange={onToggleFaultLines}
            className="h-3.5 w-3.5 rounded border-slate-300 text-sky-500 focus:ring-2 focus:ring-sky-400"
          />
          Show fault lines
        </label>
      </div>
    </>
  )
}
