/**
 * Nominatim (OpenStreetMap) geocoding API client.
 * Used by CityField for autocomplete city/place lookup.
 *
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Max 1 request/second (caller responsible for debouncing).
 * - Identifying User-Agent required.
 * - Cache results client-side; don't proxy bulk traffic.
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_USER_AGENT = 'OmenoraMobile/1.0 (https://omenora.com)'

export interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  hamlet?: string
  county?: string
  state?: string
  country?: string
  country_code?: string
}

export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: NominatimAddress
  type: string
  importance: number
}

/** Place shape used by the app — derived from a NominatimResult. */
export interface Place {
  id: string
  /** Best-effort city name: city → town → village → hamlet → county. */
  name: string
  region?: string
  country: string
  countryCode: string
  lat: number
  lon: number
  /** Full display string for showing in UI. */
  displayName: string
}

const pickCityName = (addr: NominatimAddress): string =>
  addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? addr.county ?? ''

/** Convert a raw Nominatim result into the app's Place shape. */
export const toPlace = (raw: NominatimResult): Place => ({
  id: String(raw.place_id),
  name: pickCityName(raw.address),
  region: raw.address.state,
  country: raw.address.country ?? '',
  countryCode: (raw.address.country_code ?? '').toUpperCase(),
  lat: parseFloat(raw.lat),
  lon: parseFloat(raw.lon),
  displayName: raw.display_name,
})

/**
 * Search Nominatim for places matching the query.
 * Returns up to 5 results, filtered to entries with a resolvable city/town/village name.
 *
 * Caller is responsible for:
 * - Debouncing input (recommended: 400ms).
 * - Aborting in-flight requests when a new query arrives (use AbortController).
 * - Handling errors (network, timeouts, rate limiting).
 */
export const searchPlaces = async (
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> => {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = new URL(NOMINATIM_BASE_URL)
  url.searchParams.set('q', trimmed)
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')
  url.searchParams.set('accept-language', 'en')

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'User-Agent': NOMINATIM_USER_AGENT,
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`)
  }

  const data = (await response.json()) as NominatimResult[]
  return data
    .map(toPlace)
    .filter((p) => p.name.length > 0 && p.country.length > 0)
}
