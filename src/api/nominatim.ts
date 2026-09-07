// OSM Nominatim reverse geocoding. Free, no API key, but rate-limited to
// ~1 request/second and requires a descriptive User-Agent/Referer per
// https://operations.osmfoundation.org/policies/nominatim/ - callers must not
// poll this on every location update (see useReverseGeocode).

/** Partial - Nominatim returns a variable subset depending on the point. */
interface NominatimAddress {
  neighbourhood?: string
  quarter?: string
  suburb?: string
  city_district?: string
  hamlet?: string
  locality?: string
  village?: string
  town?: string
  city?: string
  municipality?: string
  county?: string
  state?: string
  country?: string
}

// A deliberately coarse label - a local area plus its settlement, e.g.
// "City Centre, Auckland". We geocode the exact address the user types (so
// distances are accurate) but only ever show this much of it. Degrades to
// whatever Nominatim returned - down to just region or country for a point
// out at sea.
function formatShortAddress(address: NominatimAddress, fallback: string): string {
  const area =
    address.suburb ??
    address.neighbourhood ??
    address.quarter ??
    address.city_district ??
    address.hamlet ??
    address.locality
  const place =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.state
  const parts = [...new Set([area, place].filter(Boolean))] as string[]
  return parts.join(', ') || address.state || address.country || fallback
}

function shortFromResponse(data: { address?: NominatimAddress; display_name?: string }): string {
  const fallback = data.display_name?.split(',')[0]?.trim() || 'your area'
  return data.address ? formatShortAddress(data.address, fallback) : (data.display_name ?? fallback)
}

/** Coordinates -> a coarse "Suburb, City" label (see formatShortAddress). */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')

  const response = await fetch(url, {
    headers: {
      // Nominatim's usage policy asks for an identifying value here; the
      // browser sets Referer automatically, this covers the User-Agent side
      // as far as a browser fetch allows.
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Nominatim reverse geocode failed: ${response.status}`)
  }

  return shortFromResponse(await response.json())
}

export interface ForwardGeocodeResult {
  lat: number
  lng: number
  /** Coarse "Suburb, City" label - what the app displays. */
  label: string
  /** Full Nominatim string - only used to tell candidates apart in the picker. */
  full: string
}

function toResult(raw: {
  lat: string
  lon: string
  display_name: string
  address?: NominatimAddress
}): ForwardGeocodeResult {
  return {
    lat: Number(raw.lat),
    lng: Number(raw.lon),
    full: raw.display_name,
    label: shortFromResponse(raw),
  }
}

/**
 * Address -> coordinates, for the "type an address instead" fallback when
 * geolocation isn't available/permitted. Biased to NZ results since this is
 * an NZ-only app - a bare street name is otherwise ambiguous worldwide.
 */
export async function forwardGeocode(query: string): Promise<ForwardGeocodeResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('countrycodes', 'nz')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '1')

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Nominatim forward geocode failed: ${response.status}`)
  }

  const results = await response.json()
  return results[0] ? toResult(results[0]) : null
}

/**
 * Multiple candidate matches for an in-progress address, for an
 * autocomplete-style dropdown - callers are responsible for debouncing
 * (Nominatim's usage policy caps this at ~1 request/second) and for not
 * firing on very short queries.
 */
export async function searchAddresses(query: string): Promise<ForwardGeocodeResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('countrycodes', 'nz')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Nominatim address search failed: ${response.status}`)
  }

  const results = await response.json()
  return (results as Parameters<typeof toResult>[0][]).map(toResult)
}
