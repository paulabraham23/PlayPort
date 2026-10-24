/** Mirrors utils/serviceArea.ts — PlayPort delivers within 15 km of the Kachiguda hub. */
export const SERVICE_CENTER = { lat: 17.386683, lng: 78.4895742 };
export const SERVICE_RADIUS_KM = 15;
export const OUT_OF_AREA_ERROR =
  'Sorry, we are not serviceable here. Delivery is available only within a 15 km radius of Kachiguda.';

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** The dropoff pin decides when present; otherwise the address's 6-digit pincode (500xxx). */
export function isDropoffInServiceArea(opts: {
  lat?: number;
  lng?: number;
  addressFull?: string;
}): boolean {
  const { lat, lng } = opts;
  if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)) {
    return distanceKm(lat, lng, SERVICE_CENTER.lat, SERVICE_CENTER.lng) <= SERVICE_RADIUS_KM;
  }
  const pins = String(opts.addressFull ?? '').match(/\b\d{6}\b/g);
  const pin = pins?.[pins.length - 1];
  if (pin) return pin.startsWith('500');
  return /\b(hyderabad|secunderabad)\b/i.test(opts.addressFull ?? '');
}
