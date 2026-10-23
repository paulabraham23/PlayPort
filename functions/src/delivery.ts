import { logger } from 'firebase-functions';
import { distanceKm } from './serviceArea';

/**
 * Free inside 5 km of the hub (one way). Past that, every extra km costs ₹7 on
 * each of the 4 trips an order needs: drop-off out and back, pickup out and back.
 */
export const FREE_DELIVERY_KM = 5;
export const DELIVERY_RATE_PER_KM = 7;
export const TRIPS_PER_ORDER = 4;

export function deliveryFeeForKm(km: number): number {
  if (!Number.isFinite(km) || km <= FREE_DELIVERY_KM) return 0;
  // Tenth-of-a-km rounding first so 5.02 km stays free instead of billing a whole km.
  const extra = Math.round((km - FREE_DELIVERY_KM) * 10) / 10;
  return extra <= 0 ? 0 : Math.ceil(extra) * DELIVERY_RATE_PER_KM * TRIPS_PER_ORDER;
}

export type DeliveryQuote = {
  km: number;
  fee: number;
  /** road = Google Routes two-wheeler distance; straight = fallback when Routes is unavailable. */
  method: 'road' | 'straight';
};

type LatLng = { lat: number; lng: number };

async function roadKm(from: LatLng, to: LatLng, apiKey: string): Promise<number | null> {
  if (!apiKey) return null;
  try {
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters',
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
        destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
        travelMode: 'TWO_WHEELER',
        regionCode: 'IN',
      }),
    });
    if (!res.ok) {
      logger.warn('Routes API unavailable, using straight-line distance', {
        status: res.status,
        body: (await res.text()).slice(0, 200),
      });
      return null;
    }
    const data = (await res.json()) as { routes?: Array<{ distanceMeters?: number }> };
    const meters = data.routes?.[0]?.distanceMeters;
    return typeof meters === 'number' && meters >= 0 ? meters / 1000 : null;
  } catch (err) {
    logger.warn('Routes API call failed, using straight-line distance', err);
    return null;
  }
}

export async function quoteDeliveryFee(hub: LatLng, dropoff: LatLng, apiKey: string): Promise<DeliveryQuote> {
  const road = await roadKm(hub, dropoff, apiKey);
  const km = road ?? distanceKm(hub.lat, hub.lng, dropoff.lat, dropoff.lng);
  const rounded = Math.round(km * 10) / 10;
  return { km: rounded, fee: deliveryFeeForKm(rounded), method: road == null ? 'straight' : 'road' };
}
