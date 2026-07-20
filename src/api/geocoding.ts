import { fetchWithTimeout } from '#/api/fetchWithTimeout';
import { Location } from '#/api/types';

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1';

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string; // state or province
}

interface GeocodingSearchResponse {
  results: GeocodingResult[];
}

function toLocation(r: GeocodingResult): Location {
  return {
    name: r.name,
    country: r.country,
    countryCode: r.country_code,
    state: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  };
}

/**
 * Searches for locations matching a free-text query.
 * Returns up to `limit` results (default 5).
 */
export async function searchLocations(query: string, limit = 5): Promise<Location[]> {
  if (!query.trim()) return [];

  const url = `${GEO_BASE}/search?name=${encodeURIComponent(query)}&count=${limit}`;
  const res = await fetchWithTimeout(url);
  const json: GeocodingSearchResponse = await res.json();

  return (json.results ?? []).map(toLocation);
}
