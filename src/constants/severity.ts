// Severity scale + colours + alert-circle sizing, ported from the original
// app so the map reads the same way (see docs/DECISIONS.md).

import earthquakeNone from '../assets/media/img/mapKeys/key/earthquake.svg'
import earthquakeWeak from '../assets/media/img/mapKeys/event/weak/earthquakeW.svg'
import earthquakeLight from '../assets/media/img/mapKeys/event/light/earthquakeL.svg'
import earthquakeModerate from '../assets/media/img/mapKeys/event/moderate/earthquakeM.svg'
import earthquakeStrong from '../assets/media/img/mapKeys/event/strong/earthquakeST.svg'
import earthquakeSevere from '../assets/media/img/mapKeys/event/severe/earthquakeS.svg'
import earthquakeExtreme from '../assets/media/img/mapKeys/event/extreme/earthquakeX.svg'

import volcanoNone from '../assets/media/img/mapKeys/key/volcano.svg'
import volcanoWeak from '../assets/media/img/mapKeys/event/weak/volcanoW.svg'
import volcanoLight from '../assets/media/img/mapKeys/event/light/volcanoL.svg'
import volcanoModerate from '../assets/media/img/mapKeys/event/moderate/volcanoM.svg'
import volcanoStrong from '../assets/media/img/mapKeys/event/strong/volcanoST.svg'
import volcanoSevere from '../assets/media/img/mapKeys/event/severe/volcanoS.svg'
import volcanoExtreme from '../assets/media/img/mapKeys/event/extreme/volcanoX.svg'

export const SEVERITY_LEVELS = [
  'none',
  'weak',
  'light',
  'moderate',
  'strong',
  'severe',
  'extreme',
] as const

export type SeverityLevel = (typeof SEVERITY_LEVELS)[number]

/** True if `severity` is at least as severe as `threshold`, per SEVERITY_LEVELS' ascending order. */
export function isSeverityAtLeast(severity: SeverityLevel, threshold: SeverityLevel): boolean {
  return SEVERITY_LEVELS.indexOf(severity) >= SEVERITY_LEVELS.indexOf(threshold)
}

// "none" is never actually shown on the map (volcanoes at level 0 are
// filtered out; an earthquake is either one of the six real tiers or dropped
// entirely, never "none"), so it's excluded from the severity key and from the
// filter's "all severities visible" default.
export const FILTERABLE_SEVERITY_LEVELS = SEVERITY_LEVELS.filter(
  (level): level is Exclude<SeverityLevel, 'none'> => level !== 'none',
)

// Display order (most severe first) for the filter row and map key.
// SEVERITY_LEVELS itself stays ascending - volcanoLevelToSeverity indexes
// into it positionally by GeoNet's 0-5 alert level.
export const FILTERABLE_SEVERITY_LEVELS_DESC = [...FILTERABLE_SEVERITY_LEVELS].reverse()

/**
 * Epicenter-to-epicenter distance (km) within which an older earthquake's
 * alert circle is suppressed in favour of a newer nearby one, scaled by
 * severity. See computeStackedCircleSuppressions and docs/DECISIONS.md.
 */
export const SEVERITY_PROXIMITY_SUPPRESSION_KM: Record<SeverityLevel, number> = {
  none: 20,
  weak: 20,
  light: 27.5,
  moderate: 35,
  strong: 42.5,
  severe: 50,
  extreme: 57.5,
}

/** Base alert-circle radius in metres, per severity level. */
export const SEVERITY_RADIUS_METERS: Record<SeverityLevel, number> = {
  none: 650,
  weak: 1500,
  light: 5000,
  moderate: 20000,
  strong: 40000,
  severe: 50000,
  extreme: 70000,
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  none: '#353535',
  weak: '#4ecbf2',
  light: '#31c95c',
  moderate: '#f2c92d',
  strong: '#f68824',
  severe: '#e52419',
  // Purple, not a darker red - stays distinct from `severe` on the dark
  // basemap (see docs/DECISIONS.md). `extreme` is earthquake-only in practice.
  extreme: '#8b1a9c',
}

// Per-hazard visual multiplier carried over from the original - stylistic,
// not scientific.
export const EARTHQUAKE_RADIUS_MULTIPLIER = 4
export const VOLCANO_RADIUS_MULTIPLIER = 10

export const EARTHQUAKE_ICONS: Record<SeverityLevel, string> = {
  none: earthquakeNone,
  weak: earthquakeWeak,
  light: earthquakeLight,
  moderate: earthquakeModerate,
  strong: earthquakeStrong,
  severe: earthquakeSevere,
  extreme: earthquakeExtreme,
}

export const VOLCANO_ICONS: Record<SeverityLevel, string> = {
  none: volcanoNone,
  weak: volcanoWeak,
  light: volcanoLight,
  moderate: volcanoModerate,
  strong: volcanoStrong,
  severe: volcanoSevere,
  extreme: volcanoExtreme,
}

// Every intensity word we recognise - the six visible tiers, plus `none` and
// `unnoticeable` which map to `none`. Anything outside this set is what the
// console.error below flags.
const KNOWN_INTENSITIES = new Set<string>([...SEVERITY_LEVELS, 'unnoticeable'])
// Unrecognised values already logged this session, so a persistently malformed
// feed row doesn't re-log on every 60s poll.
const loggedUnknownIntensities = new Set<string>()

// GeoNet's felt-intensity vocabulary is seven words; six map onto a visible
// tier. Everything else - `unnoticeable`, a blank/absent value (this is an old,
// loosely-specified endpoint), or a word GeoNet adds later - maps to `none`,
// which App filters out of every view. The event is still built, so it stays in
// the new-event baseline (a later upward intensity revision won't fire a
// spurious "new" toast) - same treatment as a level-0 volcano. An unrecognised
// *word* is also logged once, so a genuine `extreme` doesn't slip past
// unnoticed the way it used to. (docs/DECISIONS.md)
export function earthquakeIntensityToSeverity(intensity: unknown): SeverityLevel {
  const normalized = typeof intensity === 'string' ? intensity.trim().toLowerCase() : ''
  const match = SEVERITY_LEVELS.find((level) => level === normalized && level !== 'none')
  if (match) return match
  if (normalized && !KNOWN_INTENSITIES.has(normalized) && !loggedUnknownIntensities.has(normalized)) {
    loggedUnknownIntensities.add(normalized)
    console.error(`Unrecognised GeoNet earthquake intensity ${JSON.stringify(intensity)} - shown as none`)
  }
  return 'none'
}

/**
 * GeoNet's Volcanic Alert Level is 0-5, aligned with our severity index order.
 * Anything outside that range is treated as no unrest - notably level 6, which
 * would otherwise land on `extreme` (index 6) since that tier was added.
 */
export function volcanoLevelToSeverity(level: number): SeverityLevel {
  // 0-5 only. `extreme` is index 6 now, so an out-of-range level must not land
  // on it; the `?? 'none'` still covers a non-index value (null, 2.5) that slips
  // through this loosely-specified endpoint.
  if (level >= 0 && level <= 5) return SEVERITY_LEVELS[level] ?? 'none'
  return 'none'
}

export function alertRadiusMeters(
  severity: SeverityLevel,
  multiplier: number,
): number {
  return SEVERITY_RADIUS_METERS[severity] * multiplier
}
