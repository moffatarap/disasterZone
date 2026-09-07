// Severity scale + colours + alert-circle sizing, ported from the original
// app so the map reads the same way (see docs/DECISIONS.md).

import earthquakeNone from '../assets/media/img/mapKeys/key/earthquake.svg'
import earthquakeWeak from '../assets/media/img/mapKeys/event/weak/earthquakeW.svg'
import earthquakeLight from '../assets/media/img/mapKeys/event/light/earthquakeL.svg'
import earthquakeModerate from '../assets/media/img/mapKeys/event/moderate/earthquakeM.svg'
import earthquakeStrong from '../assets/media/img/mapKeys/event/strong/earthquakeST.svg'
import earthquakeSevere from '../assets/media/img/mapKeys/event/severe/earthquakeS.svg'

import volcanoNone from '../assets/media/img/mapKeys/key/volcano.svg'
import volcanoWeak from '../assets/media/img/mapKeys/event/weak/volcanoW.svg'
import volcanoLight from '../assets/media/img/mapKeys/event/light/volcanoL.svg'
import volcanoModerate from '../assets/media/img/mapKeys/event/moderate/volcanoM.svg'
import volcanoStrong from '../assets/media/img/mapKeys/event/strong/volcanoST.svg'
import volcanoSevere from '../assets/media/img/mapKeys/event/severe/volcanoS.svg'

export const SEVERITY_LEVELS = [
  'none',
  'weak',
  'light',
  'moderate',
  'strong',
  'severe',
] as const

export type SeverityLevel = (typeof SEVERITY_LEVELS)[number]

/** True if `severity` is at least as severe as `threshold`, per SEVERITY_LEVELS' ascending order. */
export function isSeverityAtLeast(severity: SeverityLevel, threshold: SeverityLevel): boolean {
  return SEVERITY_LEVELS.indexOf(severity) >= SEVERITY_LEVELS.indexOf(threshold)
}

// "none" is never actually shown on the map (volcanoes at level 0 are
// filtered out, quakes are never classed "none"), so it's excluded from the
// severity key and from the filter's "all severities visible" default.
export const FILTERABLE_SEVERITY_LEVELS = SEVERITY_LEVELS.filter(
  (level): level is Exclude<SeverityLevel, 'none'> => level !== 'none',
)

// Display order (severe first) for the filter row and map key.
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
}

/** Base alert-circle radius in metres, indexed by severity level (0-5). */
export const SEVERITY_RADIUS_METERS: Record<SeverityLevel, number> = {
  none: 650,
  weak: 1500,
  light: 5000,
  moderate: 20000,
  strong: 40000,
  severe: 50000,
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  none: '#353535',
  weak: '#4ecbf2',
  light: '#31c95c',
  moderate: '#f2c92d',
  strong: '#f68824',
  severe: '#e52419',
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
}

export const VOLCANO_ICONS: Record<SeverityLevel, string> = {
  none: volcanoNone,
  weak: volcanoWeak,
  light: volcanoLight,
  moderate: volcanoModerate,
  strong: volcanoStrong,
  severe: volcanoSevere,
}

/** GeoNet's `intensity` string already matches our severity scale 1:1. */
export function earthquakeIntensityToSeverity(intensity: string): SeverityLevel {
  const normalized = intensity.toLowerCase()
  return (SEVERITY_LEVELS as readonly string[]).includes(normalized)
    ? (normalized as SeverityLevel)
    : 'none'
}

/** GeoNet's Volcanic Alert Level is 0-5, aligned with our severity index order. */
export function volcanoLevelToSeverity(level: number): SeverityLevel {
  return SEVERITY_LEVELS[level] ?? 'none'
}

export function alertRadiusMeters(
  severity: SeverityLevel,
  multiplier: number,
): number {
  return SEVERITY_RADIUS_METERS[severity] * multiplier
}
