// Illustrative (not live) photos for every town/city this app tracks (all 65
// in data/nzLocalities.ts), shown on an earthquake's popup for its nearest
// locality when available - same idea as constants/volcanoImages.ts. This
// depicts the nearest *town*, not the actual epicenter - GeoNet's felt-quake
// data has no image field at all.
//
// Sourced Wikipedia-first (a town's own Wikipedia article usually has a
// clean, CC-licensed lead photo); a handful needed a second look because
// the default thumbnail was a multi-panel collage or genuinely the wrong
// subject entirely (Te Awamutu's original pick was a collage of war
// memorial photos; Waiouru's was a passing train, not the town) - replaced
// with a better Commons photo in those cases, same vetting as the original
// curated 19. All CC-licensed or public domain; attribution shown in the
// popup itself.
export interface CityImage {
  src: string
  credit: string
  licenseName: string
  licenseUrl: string | null
}

import alexandra from '../assets/media/img/cities/alexandra.jpg'
import ashburton from '../assets/media/img/cities/ashburton.jpg'
import auckland from '../assets/media/img/cities/auckland.jpg'
import blenheim_existing from '../assets/media/img/cities/blenheim.jpg'
import cambridge from '../assets/media/img/cities/cambridge.jpg'
import christchurch from '../assets/media/img/cities/christchurch.jpg'
import cromwell from '../assets/media/img/cities/cromwell.jpg'
import dannevirke from '../assets/media/img/cities/dannevirke.jpg'
import dunedin_existing from '../assets/media/img/cities/dunedin.jpg'
import fairlie from '../assets/media/img/cities/fairlie.jpg'
import feilding from '../assets/media/img/cities/feilding.jpg'
import franzjosef from '../assets/media/img/cities/franzjosef.jpg'
import gisborne_existing from '../assets/media/img/cities/gisborne.jpg'
import gore from '../assets/media/img/cities/gore.jpg'
import greatbarrier from '../assets/media/img/cities/greatbarrier.jpg'
import greymouth from '../assets/media/img/cities/greymouth.jpg'
import hamilton_existing from '../assets/media/img/cities/hamilton.jpg'
import hastings from '../assets/media/img/cities/hastings.jpg'
import hawera from '../assets/media/img/cities/hawera.jpg'
import hokitika from '../assets/media/img/cities/hokitika.jpg'
import invercargill_existing from '../assets/media/img/cities/invercargill.jpg'
import kaikoura from '../assets/media/img/cities/kaikoura.jpg'
import kaitaia from '../assets/media/img/cities/kaitaia.jpg'
import kawerau from '../assets/media/img/cities/kawerau.jpg'
import levin from '../assets/media/img/cities/levin.jpg'
import lowerhutt from '../assets/media/img/cities/lowerhutt.jpg'
import manukau from '../assets/media/img/cities/manukau.jpg'
import masterton from '../assets/media/img/cities/masterton.jpg'
import milfordsound from '../assets/media/img/cities/milfordsound.jpg'
import motueka from '../assets/media/img/cities/motueka.jpg'
import napier from '../assets/media/img/cities/napier.jpg'
import nelson from '../assets/media/img/cities/nelson.jpg'
import newPlymouth from '../assets/media/img/cities/new_plymouth.jpg'
import oamaru from '../assets/media/img/cities/oamaru.jpg'
import ohakune from '../assets/media/img/cities/ohakune.jpg'
import opotiki from '../assets/media/img/cities/opotiki.jpg'
import palmerstonNorth from '../assets/media/img/cities/palmerston_north.jpg'
import paraparaumu from '../assets/media/img/cities/paraparaumu.jpg'
import picton from '../assets/media/img/cities/picton.jpg'
import porirua from '../assets/media/img/cities/porirua.jpg'
import pukekohe from '../assets/media/img/cities/pukekohe.jpg'
import queenstown from '../assets/media/img/cities/queenstown.jpg'
import rangiora from '../assets/media/img/cities/rangiora.jpg'
import rotoruaCity from '../assets/media/img/cities/rotorua_city.jpg'
import stratford from '../assets/media/img/cities/stratford.jpg'
import taumarunui from '../assets/media/img/cities/taumarunui.jpg'
import taupo from '../assets/media/img/cities/taupo.jpg'
import tauranga from '../assets/media/img/cities/tauranga.jpg'
import teanau from '../assets/media/img/cities/teanau.jpg'
import teawamutu from '../assets/media/img/cities/teawamutu.jpg'
import thames from '../assets/media/img/cities/thames.jpg'
import timaru from '../assets/media/img/cities/timaru.jpg'
import tokoroa from '../assets/media/img/cities/tokoroa.jpg'
import turangi from '../assets/media/img/cities/turangi.jpg'
import upperhutt from '../assets/media/img/cities/upperhutt.jpg'
import waiouru from '../assets/media/img/cities/waiouru.jpg'
import wairoa from '../assets/media/img/cities/wairoa.jpg'
import waitangichathams from '../assets/media/img/cities/waitangichathams.jpg'
import wanaka from '../assets/media/img/cities/wanaka.jpg'
import wellington from '../assets/media/img/cities/wellington.jpg'
import westport from '../assets/media/img/cities/westport.jpg'
import whakatane from '../assets/media/img/cities/whakatane.jpg'
import whanganui_existing from '../assets/media/img/cities/whanganui.jpg'
import whangarei from '../assets/media/img/cities/whangarei.jpg'
import whitianga from '../assets/media/img/cities/whitianga.jpg'

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
    src: hamilton_existing,
    credit: 'Pseudopanax',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Gisborne: {
    src: gisborne_existing,
    credit: 'Wikimedia Commons',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Whanganui: {
    src: whanganui_existing,
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
    src: dunedin_existing,
    credit: 'Diego Delso',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  'New Plymouth': {
    src: newPlymouth,
    credit: 'Mknz24',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Blenheim: {
    src: blenheim_existing,
    credit: 'Chris Hadfield',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Invercargill: {
    src: invercargill_existing,
    credit: 'Phillip Capper',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Whangarei: {
    src: whangarei,
    credit: 'Uarangi',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Kaitaia: {
    src: kaitaia,
    credit: 'Phillip Capper',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Manukau: {
    src: manukau,
    credit: 'Ingolfson',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Pukekohe: {
    src: pukekohe,
    credit: 'Skyviewphotography',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Thames: {
    src: thames,
    credit: 'Ulrich Lange',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  Whitianga: {
    src: whitianga,
    credit: 'Ulrich Lange',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  'Te Awamutu': {
    src: teawamutu,
    credit: 'Krzysztof Golik',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Cambridge: {
    src: cambridge,
    credit: 'Brian Gratwicke',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Tokoroa: {
    src: tokoroa,
    credit: 'Ingolfson',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Taupo: {
    src: taupo,
    credit: 'Phillip Capper',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Whakatane: {
    src: whakatane,
    credit: 'Chris Thompson',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Kawerau: {
    src: kawerau,
    credit: 'Air55',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Opotiki: {
    src: opotiki,
    credit: 'Ulrich Lange',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Wairoa: {
    src: wairoa,
    credit: 'Pseudopanax',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Dannevirke: {
    src: dannevirke,
    credit: 'Michal Klajban',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Turangi: {
    src: turangi,
    credit: 'Krzysztof Golik',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Ohakune: {
    src: ohakune,
    credit: 'Stagking',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Taumarunui: {
    src: taumarunui,
    credit: 'Bgabel',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Waiouru: {
    src: waiouru,
    credit: 'Krzysztof Golik',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Stratford: {
    src: stratford,
    credit: 'MSeses',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Hawera: {
    src: hawera,
    credit: 'Karora',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  Feilding: {
    src: feilding,
    credit: 'Cody Cooper',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Levin: {
    src: levin,
    credit: 'IdiotSavant',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Masterton: {
    src: masterton,
    credit: 'Matthew25187',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  Paraparaumu: {
    src: paraparaumu,
    credit: 'Gurtej Singh',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
  },
  Porirua: {
    src: porirua,
    credit: 'Phillip Capper',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  'Upper Hutt': {
    src: upperhutt,
    credit: 'Rudolph89',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  'Lower Hutt': {
    src: lowerhutt,
    credit: 'Greater Wellington Regional Council',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
  },
  'Waitangi (Chathams)': {
    src: waitangichathams,
    credit: 'Vk2cz',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  Motueka: {
    src: motueka,
    credit: 'Alex Proimos',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  Picton: {
    src: picton,
    credit: 'Mr Bullitt',
    licenseName: 'CC BY 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5',
  },
  Westport: {
    src: westport,
    credit: 'Mattinbgn',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Greymouth: {
    src: greymouth,
    credit: 'Stewart Nimmo',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
  },
  Hokitika: {
    src: hokitika,
    credit: 'Juergen Schacke',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  Rangiora: {
    src: rangiora,
    credit: 'Hugho226',
    licenseName: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  Ashburton: {
    src: ashburton,
    credit: 'Andrew Cooper',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Fairlie: {
    src: fairlie,
    credit: 'Mattinbgn',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  Oamaru: {
    src: oamaru,
    credit: 'Jamie Wang',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
  },
  Alexandra: {
    src: alexandra,
    credit: 'Sebthedev',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Cromwell: {
    src: cromwell,
    credit: 'Mattinbgn',
    licenseName: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  Wanaka: {
    src: wanaka,
    credit: 'Hagai Agmon-Snir',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  Gore: {
    src: gore,
    credit: 'Mr Bungle',
    licenseName: 'CC BY 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5',
  },
  'Te Anau': {
    src: teanau,
    credit: 'Tim Burgess',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  'Milford Sound': {
    src: milfordsound,
    credit: 'Maros Mraz',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  'Franz Josef': {
    src: franzjosef,
    credit: 'Pseudopanax',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
  'Great Barrier Island': {
    src: greatbarrier,
    credit: 'Ingolfson',
    licenseName: 'Public domain',
    licenseUrl: null,
  },
}
