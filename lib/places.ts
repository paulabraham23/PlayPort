import type { PlacesSuggestion, ResolvedPlaceAddress } from '@/lib/functions';

export type { PlacesSuggestion, ResolvedPlaceAddress };

const PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function assertKey() {
  if (!PLACES_KEY) {
    throw new Error('Address search isn’t configured yet (missing Maps key).');
  }
}

export function newPlacesSessionToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function componentLong(
  components: Array<{ longText?: string; shortText?: string; types?: string[] }> | undefined,
  type: string
): string {
  const hit = components?.find((c) => c.types?.includes(type));
  return hit?.longText || hit?.shortText || '';
}

function parsePlaceDetails(place: Record<string, unknown>): ResolvedPlaceAddress {
  const components = (place.addressComponents || []) as Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
  const streetNumber = componentLong(components, 'street_number');
  const route = componentLong(components, 'route');
  const premise = componentLong(components, 'premise');
  const subpremise = componentLong(components, 'subpremise');
  const neighborhood =
    componentLong(components, 'sublocality_level_1') ||
    componentLong(components, 'sublocality') ||
    componentLong(components, 'neighborhood') ||
    componentLong(components, 'sublocality_level_2');
  const city =
    componentLong(components, 'locality') ||
    componentLong(components, 'administrative_area_level_2') ||
    componentLong(components, 'postal_town');
  const pincode = componentLong(components, 'postal_code');
  const state = componentLong(components, 'administrative_area_level_1');
  const lineParts = [subpremise, premise, streetNumber, route].filter(Boolean);
  const line1 =
    lineParts.join(', ') || (place.formattedAddress as string)?.split(',')[0]?.trim() || '';
  const location = place.location as { latitude?: number; longitude?: number } | undefined;

  return {
    placeId: (place.id as string) || '',
    formattedAddress: (place.formattedAddress as string) || '',
    line1,
    line2: undefined,
    area: neighborhood || city,
    city: city || 'Bengaluru',
    pincode,
    state: state || undefined,
    lat: location?.latitude,
    lng: location?.longitude,
  };
}

export async function searchPlaces(
  input: string,
  sessionToken: string,
  bias?: { latitude: number; longitude: number; radiusMeters?: number }
): Promise<PlacesSuggestion[]> {
  assertKey();
  const q = input.trim();
  if (q.length < 2) return [];

  const body: Record<string, unknown> = {
    input: q,
    includedRegionCodes: ['in'],
    languageCode: 'en',
    regionCode: 'IN',
    sessionToken,
  };
  if (bias) {
    body.locationBias = {
      circle: {
        center: { latitude: bias.latitude, longitude: bias.longitude },
        radius: bias.radiusMeters ?? 45000,
      },
    };
  } else {
    body.locationBias = {
      circle: {
        center: { latitude: 12.9716, longitude: 77.5946 },
        radius: 50000,
      },
    };
  }

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(/REQUEST_DENIED|API_KEY/i.test(text) ? 'Places API key denied' : 'Places search failed');
  }
  const data = (await res.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  return (data.suggestions || [])
    .map((s) => {
      const p = s.placePrediction;
      if (!p?.placeId) return null;
      return {
        placeId: p.placeId,
        primaryText: p.structuredFormat?.mainText?.text || p.text?.text || '',
        secondaryText: p.structuredFormat?.secondaryText?.text || '',
        fullText: p.text?.text || '',
      };
    })
    .filter((s): s is PlacesSuggestion => Boolean(s));
}

export type ReverseGeocodedAddress = {
  formattedAddress: string;
  line1: string;
  area: string;
  city: string;
  pincode: string;
  state?: string;
};

/**
 * Zepto-style pin → address: turn confirmed map coords into address text.
 * Uses the legacy Geocoding API (same key as forward geocoding).
 */
export async function reverseGeocodeLatLng(
  lat: number,
  lng: number
): Promise<ReverseGeocodedAddress | null> {
  if (!PLACES_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&region=in&language=en&key=${PLACES_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{
        formatted_address?: string;
        address_components?: Array<{ long_name?: string; short_name?: string; types?: string[] }>;
      }>;
    };
    const best = data.results?.[0];
    if (!best) return null;
    const comp = (type: string) =>
      best.address_components?.find((c) => c.types?.includes(type))?.long_name ?? '';
    const premise = comp('premise');
    const streetNumber = comp('street_number');
    const route = comp('route');
    const neighborhood =
      comp('sublocality_level_1') || comp('sublocality') || comp('neighborhood');
    const city = comp('locality') || comp('administrative_area_level_2') || comp('postal_town');
    const pincode = comp('postal_code').replace(/\D/g, '').slice(0, 6);
    const lineParts = [premise, streetNumber, route].filter(Boolean);
    return {
      formattedAddress: best.formatted_address ?? '',
      line1: lineParts.join(', ') || best.formatted_address?.split(',')[0]?.trim() || '',
      area: neighborhood || city,
      city: city || 'Bengaluru',
      pincode,
      state: comp('administrative_area_level_1') || undefined,
    };
  } catch {
    return null;
  }
}

export async function resolvePlace(
  placeId: string,
  sessionToken: string
): Promise<ResolvedPlaceAddress> {
  assertKey();
  const id = placeId.replace(/^places\//, '');
  const params = new URLSearchParams({ sessionToken });
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?${params}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': 'id,formattedAddress,addressComponents,location,displayName',
      },
    }
  );
  if (!res.ok) {
    throw new Error('Couldn’t load that place');
  }
  const place = (await res.json()) as Record<string, unknown>;
  return parsePlaceDetails(place);
}
