// Illustrative (not live) photos for a curated shortlist of major/seismically
// notable NZ cities, shown on an earthquake's popup for its nearest locality
// when available - same idea as constants/volcanoImages.ts, scoped down
// deliberately: nzLocalities.ts has 65 towns total, and sourcing/vetting a
// photo for every one of them is a much bigger effort than the volcanoes'
// fixed set of 12, for a weaker payoff (this depicts the nearest *town*, not
// the actual epicenter - GeoNet's felt-quake data has no image field at all).
// A quake near a town not in this list simply shows no image, same as
// Northland does for volcanoes.
export interface CityImage {
  src: string
  credit: string
  licenseName: string
  licenseUrl: string | null
}

import auckland from '../assets/media/img/cities/auckland.jpg'
import christchurch from '../assets/media/img/cities/christchurch.jpg'
import dunedin from '../assets/media/img/cities/dunedin.jpg'
import gisborne from '../assets/media/img/cities/gisborne.jpg'
import hamilton from '../assets/media/img/cities/hamilton.jpg'
import hastings from '../assets/media/img/cities/hastings.jpg'
import kaikoura from '../assets/media/img/cities/kaikoura.jpg'
import napier from '../assets/media/img/cities/napier.jpg'
import nelson from '../assets/media/img/cities/nelson.jpg'
import palmerstonNorth from '../assets/media/img/cities/palmerston_north.jpg'
import queenstown from '../assets/media/img/cities/queenstown.jpg'
import rotoruaCity from '../assets/media/img/cities/rotorua_city.jpg'
import tauranga from '../assets/media/img/cities/tauranga.jpg'
import timaru from '../assets/media/img/cities/timaru.jpg'
import wellington from '../assets/media/img/cities/wellington.jpg'
import whanganui from '../assets/media/img/cities/whanganui.jpg'

// Keyed by the exact `name` strings used in data/nzLocalities.ts.
export const CITY_IMAGES: Record<string, CityImage> = {
  Auckland: {
    src: auckland,
    credit: 'elpinto007',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
  },
  Tauranga: {
    src: tauranga,
    credit: 'Schwede66',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Rotorua: {
    src: rotoruaCity,
    credit: 'Krzysztof Golik',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Napier: {
    src: napier,
    credit: 'Jakob | TheLoyalOrder',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
  },
  Hastings: {
    src: hastings,
    credit: 'Pseudopanax',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Wellington: {
    src: wellington,
    credit: 'Phillip Capper',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Nelson: {
    src: nelson,
    credit: 'Markus Koljonen',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Kaikoura: {
    src: kaikoura,
    credit: 'Clilly4',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Christchurch: {
    src: christchurch,
    credit: 'Bernard Spragg',
    licenseName: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  Timaru: {
    src: timaru,
    credit: 'Thomei08',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Queenstown: {
    src: queenstown,
    credit: 'Bernard Spragg',
    licenseName: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  Hamilton: {
    src: hamilton,
    credit: 'Pseudopanax',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Gisborne: {
    src: gisborne,
    credit: 'Wikimedia Commons',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Whanganui: {
    src: whanganui,
    credit: 'Ang Wickham',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  'Palmerston North': {
    src: palmerstonNorth,
    credit: 'Michal Klajban',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Dunedin: {
    src: dunedin,
    credit: 'Diego Delso',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
}
