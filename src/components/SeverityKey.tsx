import { useState } from 'react'
import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'
import { FILTERABLE_SEVERITY_LEVELS, SEVERITY_COLORS, type SeverityLevel } from '../constants/severity'
import type { HazardKind } from '../types/event'

// Fire/flood/hurricane/tornado are intentionally left out of the key for now -
// they aren't wired to real data yet (see the placeholder-events phase).
const KIND_ENTRIES: { kind: HazardKind; icon: string; label: string }[] = [
  { kind: 'earthquake', icon: earthquakeIcon, label: 'Earthquake' },
  { kind: 'volcano', icon: volcanoIcon, label: 'Volcano' },
]

interface SeverityKeyProps {
  visibleKinds: Set<HazardKind>
  visibleSeverities: Set<SeverityLevel>
  onToggleKind: (kind: HazardKind) => void
  onToggleSeverity: (level: SeverityLevel) => void
  onReset: () => void
  isFiltered: boolean
}

const ROW_CLASS =
  'flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm transition-opacity hover:bg-slate-100'

export function SeverityKey({
  visibleKinds,
  visibleSeverities,
  onToggleKind,
  onToggleSeverity,
  onReset,
  isFiltered,
}: SeverityKeyProps) {
  const [expandedOnMobile, setExpandedOnMobile] = useState(false)

  return (
    <div className="absolute top-3 right-3 z-[5]">
      <button
        type="button"
        onClick={() => setExpandedOnMobile((expanded) => !expanded)}
        aria-expanded={expandedOnMobile}
        aria-label="Toggle map key"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md sm:hidden"
      >
        i
      </button>

      <div
        className={`mt-2 rounded-lg bg-white/95 px-3.5 py-2.5 shadow-md sm:mt-0 sm:block ${
          expandedOnMobile ? 'block' : 'hidden'
        }`}
      >
        <h4 className="mb-1.5 text-xs tracking-wide text-slate-500">KEY (tap to filter)</h4>
        <ul className="flex flex-col gap-1">
          {KIND_ENTRIES.map(({ kind, icon, label }) => {
            const active = visibleKinds.has(kind)
            return (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => onToggleKind(kind)}
                  aria-pressed={active}
                  className={`${ROW_CLASS} ${active ? '' : 'opacity-40'}`}
                >
                  <img src={icon} alt="" className="h-8 w-8" />
                  <span>{label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <h4 className="mt-3 mb-1.5 border-t border-slate-100 pt-2.5 text-xs tracking-wide text-slate-500">
          INTENSITY
        </h4>
        <ul className="flex flex-col gap-1">
          {FILTERABLE_SEVERITY_LEVELS.map((level) => {
            const active = visibleSeverities.has(level)
            return (
              <li key={level}>
                <button
                  type="button"
                  onClick={() => onToggleSeverity(level)}
                  aria-pressed={active}
                  className={`${ROW_CLASS} capitalize ${active ? '' : 'opacity-40'}`}
                >
                  <span
                    className="h-4 w-4 flex-none rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[level] }}
                  />
                  <span>{level}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-1.5 max-w-[160px] text-[10px] leading-snug text-slate-400">
          Quakes: how strongly it was felt. Volcanoes: official alert level.
        </p>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  )
}
