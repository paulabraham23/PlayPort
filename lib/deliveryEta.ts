import { distanceKm, etaMinutesFromKm } from '@/utils/geo';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

/** Doorstep / building access buffer on top of Google travel time. */
const DOORSTEP_BUFFER_MIN = 3;

/** Reuse last road ETA if rider has barely moved (cuts Routes API cost). */
const CACHE_TTL_MS = 40_000;
const CACHE_MOVE_KM = 0.08; // ~80 m

type RouteEta = {
  distanceKm: number;
  etaMinutes: number;
  /** road = Google Routes; straight = Haversine fallback */
  source: 'road' | 'straight';
};

type CacheEntry = {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  at: number;
  result: RouteEta;
};

let lastRoadCache: CacheEntry | null = null;

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const q = address.trim();
  if (!q || !MAPS_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&region=in&key=${MAPS_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
    };
    const loc = data.results?.[0]?.geometry?.location;
    if (!loc || typeof loc.lat !== 'number') return null;
    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
}

/**
 * Road-based ETA via Google Routes API (two-wheeler + traffic when available).
 * Falls back to straight-line estimate if Routes fails.
 */
export async function computeDeliveryEta(
  riderLat: number,
  riderLng: number,
  dropoffLat: number,
  dropoffLng: number
): Promise<RouteEta> {
  if (
    lastRoadCache &&
    Date.now() - lastRoadCache.at < CACHE_TTL_MS &&
    distanceKm(riderLat, riderLng, lastRoadCache.originLat, lastRoadCache.originLng) <
      CACHE_MOVE_KM &&
    distanceKm(dropoffLat, dropoffLng, lastRoadCache.destLat, lastRoadCache.destLng) < 0.01
  ) {
    return lastRoadCache.result;
  }

  const road = await fetchRoadEta(riderLat, riderLng, dropoffLat, dropoffLng);
  if (road) {
    lastRoadCache = {
      originLat: riderLat,
      originLng: riderLng,
      destLat: dropoffLat,
      destLng: dropoffLng,
      at: Date.now(),
      result: road,
    };
    return road;
  }

  const km = distanceKm(riderLat, riderLng, dropoffLat, dropoffLng);
  return {
    distanceKm: Math.round(km * 10) / 10,
    etaMinutes: etaMinutesFromKm(km),
    source: 'straight',
  };
}

async function fetchRoadEta(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<RouteEta | null> {
  if (!MAPS_KEY) return null;

  // Prefer TWO_WHEELER (India scooter/bike). Fall back to DRIVE if unsupported.
  for (const travelMode of ['TWO_WHEELER', 'DRIVE'] as const) {
    try {
      const res = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': MAPS_KEY,
            'X-Goog-FieldMask':
              'routes.duration,routes.staticDuration,routes.distanceMeters',
          },
          body: JSON.stringify({
            origin: {
              location: { latLng: { latitude: originLat, longitude: originLng } },
            },
            destination: {
              location: { latLng: { latitude: destLat, longitude: destLng } },
            },
            travelMode,
            routingPreference: 'TRAFFIC_AWARE',
            languageCode: 'en-IN',
            regionCode: 'IN',
          }),
        }
      );

      if (!res.ok) continue;
      const data = (await res.json()) as {
        routes?: Array<{
          duration?: string;
          staticDuration?: string;
          distanceMeters?: number;
        }>;
      };
      const route = data.routes?.[0];
      if (!route?.distanceMeters) continue;

      const durationSec =
        parseDurationSeconds(route.duration) ?? parseDurationSeconds(route.staticDuration);
      if (durationSec == null) continue;

      const distanceKmVal = Math.round((route.distanceMeters / 1000) * 10) / 10;
      const etaMinutes = Math.max(
        1,
        Math.min(120, Math.ceil(durationSec / 60) + DOORSTEP_BUFFER_MIN)
      );

      return { distanceKm: distanceKmVal, etaMinutes, source: 'road' };
    } catch {
      /* try next mode */
    }
  }
  return null;
}

/** Parse protobuf Duration string like "123s" or "123.45s". */
function parseDurationSeconds(value?: string): number | null {
  if (!value) return null;
  const m = /^(\d+(?:\.\d+)?)s$/.exec(value.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}
