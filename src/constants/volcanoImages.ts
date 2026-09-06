// Illustrative (not live) photos of each volcano, sourced from Wikimedia
// Commons and bundled locally rather than hotlinked. GeoNet itself doesn't
// expose volcano photos via its API - the closest thing, live crater-camera
// snapshots, only exist for a couple of volcanoes (Ruapehu, Whakaari) and
// their filenames are timestamped every 10 minutes with no "latest" alias
// or documented lookup endpoint, so reliably embedding the live image
// wasn't feasible from a static frontend with no backend proxy. A bundled
// photo per volcano works consistently for all of them instead.
//
// Northland has no entry - no suitable photo found (it's a diffuse field of
// small scoria cones, not a single distinct landmark), and the popup simply
// omits the image for it rather than force an unrelated one.
//
// Attribution (required by the CC licenses; included for the public-domain
// ones too as good practice) is shown as a caption under the image.
export interface VolcanoImage {
  src: string
  credit: string
  licenseName: string
  licenseUrl: string | null
}

import aucklandvolcanicfield from '../assets/media/img/volcanoes/aucklandvolcanicfield.jpg'
import kermadecislands from '../assets/media/img/volcanoes/kermadecislands.jpg'
import mayorisland from '../assets/media/img/volcanoes/mayorisland.jpg'
import ngauruhoe from '../assets/media/img/volcanoes/ngauruhoe.jpg'
import okataina from '../assets/media/img/volcanoes/okataina.jpg'
import rotorua from '../assets/media/img/volcanoes/rotorua.jpg'
import ruapehu from '../assets/media/img/volcanoes/ruapehu.jpg'
import taranakiegmont from '../assets/media/img/volcanoes/taranakiegmont.jpg'
import taupo from '../assets/media/img/volcanoes/taupo.jpg'
import tongariro from '../assets/media/img/volcanoes/tongariro.jpg'
import whiteisland from '../assets/media/img/volcanoes/whiteisland.jpg'

export const VOLCANO_IMAGES: Record<string, VolcanoImage> = {
  taupo: {
    src: taupo,
    credit: 'Bo-deh',
    licenseName: 'CC BY-SA 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5',
  },
  tongariro: {
    src: tongariro,
    credit: 'Phil Whitehouse',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  aucklandvolcanicfield: {
    src: aucklandvolcanicfield,
    credit: 'Bruce Hayward',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  kermadecislands: {
    src: kermadecislands,
    credit: 'NASA',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  mayorisland: {
    src: mayorisland,
    credit: 'Schwede66',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  ngauruhoe: {
    src: ngauruhoe,
    credit: 'Eusebius',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  okataina: {
    src: okataina,
    credit: 'Richard Waitt, USGS',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  rotorua: {
    src: rotorua,
    credit: 'Unknown author',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  whiteisland: {
    src: whiteisland,
    credit: 'gérard, Nouméa',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
  },
  ruapehu: {
    src: ruapehu,
    credit: 'Geoff McKay',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  taranakiegmont: {
    src: taranakiegmont,
    credit: 'Wikimedia Commons',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
}
