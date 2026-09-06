import type { SeverityLevel } from '../constants/severity'

export type HazardKind = 'earthquake' | 'volcano'

/** A common shape both hazard types get normalized into for the map, sidebar, and popup. */
export interface DisasterEvent {
  id: string
  kind: HazardKind
  severity: SeverityLevel
  title: string
  /** Raw GeoNet ID, shown as fine print for looking the event up on GeoNet's own site. */
  subtitle?: string
  location: { lat: number; lng: number }
  /** e.g. "Magnitude 4.2" or "Alert Level 2" */
  ratingText: string
  /** e.g. quake origin time; omitted for volcanoes (GeoNet doesn't timestamp alert-level changes) */
  time: Date | null
  detail: string
  /** GeoNet's `hazards` field for volcanoes (e.g. "Volcanic unrest hazards, potential for eruption hazards."); absent for earthquakes. */
  hazards?: string
}
