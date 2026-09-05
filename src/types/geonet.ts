/** Response shapes for GeoNet's public felt-earthquake and volcano-alert-level APIs. */

export interface EarthquakeFeature {
  id: string
  geometry: {
    type: 'Point'
    /** [lng, lat] */
    coordinates: [number, number]
  }
  properties: {
    publicid: string
    origintime: string
    depth: number
    magnitude: number
    /** Lowercase severity word: weak | light | moderate | strong | severe */
    intensity: string
    status: string
    agency: string
    updatetime: string
  }
}

export interface EarthquakeCollection {
  type: 'FeatureCollection'
  features: EarthquakeFeature[]
}

export interface VolcanoFeature {
  geometry: {
    type: 'Point'
    /** [lng, lat] */
    coordinates: [number, number]
  }
  properties: {
    volcanoID: string
    volcanoTitle: string
    /** Volcanic Alert Level, 0 (no unrest) to 5 (severe eruption) */
    level: number
    activity: string
    hazards: string
  }
}

export interface VolcanoCollection {
  type: 'FeatureCollection'
  features: VolcanoFeature[]
}
