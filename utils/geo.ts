/** Earth distance in km (Haversine). */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Rough urban ETA for bike/scooter delivery.
 * Assumes ~22 km/h average + 3 min buffer for doors/gates.
 */
export function etaMinutesFromKm(km: number): number {
  if (!Number.isFinite(km) || km < 0) return 30;
  const minutes = Math.ceil((km / 22) * 60) + 3;
  return Math.max(5, Math.min(90, minutes));
}

export function formatEtaMinutes(mins?: number | null): string {
  if (mins == null || !Number.isFinite(mins)) return '—';
  if (mins <= 1) return 'About 1 min';
  return `About ${Math.round(mins)} min`;
}
