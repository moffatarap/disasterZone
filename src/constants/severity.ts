// Severity scale + colours + alert-circle sizing, ported directly from the
// original app's alertCircleColorArray / alertCirlceRadiusArray
// (Disaster Zone/js/api/geoLocationAPI.js) so the map reads the same way it
// always has.

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

// Display order only (severe first) for the filter row and the map key -
// SEVERITY_LEVELS itself must stay ascending since volcanoLevelToSeverity
// indexes into it positionally by GeoNet's 0-5 alert level.
export const FILTERABLE_SEVERITY_LEVELS_DESC = [...FILTERABLE_SEVERITY_LEVELS].reverse()

/**
 * How close together (in km, real-world epicenter distance) two earthquakes
 * need to be for the older one's alert circle to be suppressed in favour of
 * a newer nearby one - see computeStackedCircleSuppressions. Scales with
 * severity (a bigger quake's "this is the same cluster" radius is larger)
 * but capped to realistic distances, unlike the visual alert-circle radius
 * below which balloons past 200km for a severe quake and was previously
 * (wrongly) used as the overlap test itself - two unrelated severe quakes on
 * opposite ends of the country could suppress each other purely because
 * their inflated *visual* circles overlapped on screen.
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

// Darkened from the original palette (weak/light/moderate/strong were all
// near-pastel: e.g. weak was #4ecbf2) after an axe-core color-contrast audit
// found white text/icon glyphs on top of them failing WCAG - as low as
// 1.57:1 for moderate's original yellow, against a 4.5:1 AA text minimum (or
// 3:1 for the graphical icon glyphs). Every value here now clears >=4.5:1
// with white foreground content, so a single white-text/white-glyph
// treatment works uniformly across every severity (see EventDetailPopup,
// which used to need per-severity dark-text overrides for the paler ones).
// Also now shared exactly with the marker SVGs (src/assets/.../event/*/*.svg),
// which previously used very slightly different hex values for the same
// severities - one unintentional inconsistency fixed alongside the audit.
export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  none: '#353535',
  weak: '#097698',
  light: '#157431',
  moderate: '#756100',
  strong: '#ac5e00',
  severe: '#e72101',
}

// The original multiplied the base radius per-hazard-type for visual effect
// (a stylistic choice, not a scientific one) - preserved as-is.
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
