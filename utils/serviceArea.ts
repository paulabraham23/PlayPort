import { distanceKm } from '@/utils/geo';

/** PlayPort delivers in Hyderabad only (Kachiguda hub, ~30 km radius). */
export const SERVICE_CITY = 'Hyderabad';
export const SERVICE_CENTER = { lat: 17.385, lng: 78.4867 };
export const SERVICE_RADIUS_KM = 30;

const CITY_NAMES = /\b(hyderabad|secunderabad|cyberabad)\b/i;

export type ServiceAreaInput = {
  lat?: number | null;
  lng?: number | null;
  pincode?: string | null;
  city?: string | null;
};

/**
 * A map pin decides when present (pins are what riders drive to). Without one,
 * Hyderabad pincodes start with 500; the city name is the last resort.
 */
export function isInServiceArea(place: ServiceAreaInput | null | undefined): boolean {
  if (!place) return false;
  const { lat, lng } = place;
  if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)) {
    return distanceKm(lat, lng, SERVICE_CENTER.lat, SERVICE_CENTER.lng) <= SERVICE_RADIUS_KM;
  }
  const pin = String(place.pincode ?? '').replace(/\D/g, '');
  if (pin.length === 6) return pin.startsWith('500');
  return CITY_NAMES.test(place.city ?? '');
}

export const OUT_OF_AREA_MESSAGE = `We only deliver in ${SERVICE_CITY} right now.`;
