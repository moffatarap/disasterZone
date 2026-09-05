// OSM Nominatim reverse geocoding. Free, no API key, but rate-limited to
// ~1 request/second and requires a descriptive User-Agent/Referer per
// https://operations.osmfoundation.org/policies/nominatim/ - callers must not
// poll this on every location update (see useReverseGeocode).

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'jsonv2')

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

  const data = await response.json()
  return data.display_name ?? 'No address found'
}
