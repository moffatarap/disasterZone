// A bundled set of NZ towns/cities for offline "nearest town" lookups - no
// geocoding API, no rate limits, works instantly for every event at once.
// Not exhaustive; picks reasonable regional coverage across both islands.

export interface Locality {
  name: string
  lat: number
  lng: number
}

export const NZ_LOCALITIES: Locality[] = [
  // Upper North Island
  { name: 'Whangarei', lat: -35.7275, lng: 174.3237 },
  { name: 'Kaitaia', lat: -35.1132, lng: 173.2634 },
  { name: 'Auckland', lat: -36.8485, lng: 174.7633 },
  { name: 'Manukau', lat: -36.9928, lng: 174.8797 },
  { name: 'Pukekohe', lat: -37.2004, lng: 174.9018 },
  { name: 'Thames', lat: -37.1376, lng: 175.5320 },
  { name: 'Whitianga', lat: -36.8309, lng: 175.7027 },
  { name: 'Hamilton', lat: -37.7870, lng: 175.2793 },
  { name: 'Te Awamutu', lat: -38.0086, lng: 175.3236 },
  { name: 'Cambridge', lat: -37.8886, lng: 175.4696 },
  { name: 'Tokoroa', lat: -38.2333, lng: 175.8667 },
  { name: 'Taupo', lat: -38.6857, lng: 176.0702 },
  { name: 'Rotorua', lat: -38.1368, lng: 176.2497 },
  { name: 'Tauranga', lat: -37.6878, lng: 176.1651 },
  { name: 'Whakatane', lat: -37.9614, lng: 176.9840 },
  { name: 'Kawerau', lat: -38.0865, lng: 176.6994 },
  { name: 'Opotiki', lat: -38.0086, lng: 177.2856 },

  // East Coast / Hawke's Bay
  { name: 'Gisborne', lat: -38.6623, lng: 178.0176 },
  { name: 'Wairoa', lat: -39.0333, lng: 177.4167 },
  { name: 'Napier', lat: -39.4928, lng: 176.9120 },
  { name: 'Hastings', lat: -39.6390, lng: 176.8480 },
  { name: 'Dannevirke', lat: -40.2167, lng: 176.1000 },

  // Central North Island / volcanic plateau
  { name: 'Turangi', lat: -38.9903, lng: 175.8083 },
  { name: 'Ohakune', lat: -39.4189, lng: 175.4106 },
  { name: 'Taumarunui', lat: -38.8814, lng: 175.2731 },
  { name: 'Waiouru', lat: -39.4667, lng: 175.6667 },

  // Lower North Island
  { name: 'New Plymouth', lat: -39.0556, lng: 174.0752 },
  { name: 'Stratford', lat: -39.3400, lng: 174.2833 },
  { name: 'Hawera', lat: -39.5900, lng: 174.2833 },
  { name: 'Whanganui', lat: -39.9301, lng: 175.0500 },
  { name: 'Palmerston North', lat: -40.3523, lng: 175.6082 },
  { name: 'Feilding', lat: -40.2281, lng: 175.5619 },
  { name: 'Levin', lat: -40.6222, lng: 175.2864 },
  { name: 'Masterton', lat: -40.9597, lng: 175.6564 },
  { name: 'Paraparaumu', lat: -40.9167, lng: 175.0167 },
  { name: 'Porirua', lat: -41.1333, lng: 174.8417 },
  { name: 'Upper Hutt', lat: -41.1256, lng: 175.0700 },
  { name: 'Lower Hutt', lat: -41.2100, lng: 174.9061 },
  { name: 'Wellington', lat: -41.2865, lng: 174.7762 },

  // Chatham Islands
  { name: 'Waitangi (Chathams)', lat: -43.9500, lng: -176.5667 },

  // Upper South Island
  { name: 'Nelson', lat: -41.2706, lng: 173.2840 },
  { name: 'Motueka', lat: -41.1167, lng: 173.0000 },
  { name: 'Blenheim', lat: -41.5134, lng: 173.9612 },
  { name: 'Picton', lat: -41.2900, lng: 174.0000 },
  { name: 'Kaikoura', lat: -42.4000, lng: 173.6817 },
  { name: 'Westport', lat: -41.7545, lng: 171.6039 },
  { name: 'Greymouth', lat: -42.4500, lng: 171.2100 },
  { name: 'Hokitika', lat: -42.7167, lng: 170.9667 },

  // Canterbury
  { name: 'Christchurch', lat: -43.5321, lng: 172.6362 },
  { name: 'Rangiora', lat: -43.3042, lng: 172.5967 },
  { name: 'Ashburton', lat: -43.9033, lng: 171.7500 },
  { name: 'Timaru', lat: -44.3904, lng: 171.2545 },
  { name: 'Fairlie', lat: -44.0967, lng: 170.8317 },

  // Otago / Southland
  { name: 'Oamaru', lat: -45.0967, lng: 170.9700 },
  { name: 'Alexandra', lat: -45.2500, lng: 169.3833 },
  { name: 'Cromwell', lat: -45.0333, lng: 169.2000 },
  { name: 'Queenstown', lat: -45.0312, lng: 168.6626 },
  { name: 'Wanaka', lat: -44.7000, lng: 169.1500 },
  { name: 'Dunedin', lat: -45.8788, lng: 170.5028 },
  { name: 'Gore', lat: -46.1000, lng: 168.9333 },
  { name: 'Invercargill', lat: -46.4132, lng: 168.3538 },
  { name: 'Te Anau', lat: -45.4167, lng: 167.7167 },

  // Sparsely-populated regions, so distant events resolve honestly
  { name: 'Milford Sound', lat: -44.6710, lng: 167.9250 },
  { name: 'Franz Josef', lat: -43.3875, lng: 170.1830 },
  { name: 'Great Barrier Island', lat: -36.2000, lng: 175.4000 },
]
