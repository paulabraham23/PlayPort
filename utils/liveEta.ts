import type { Order } from '@/types';

/** Minutes still to go, counting down from the last rider location ping. */
export function remainingEtaMinutes(
  order: Pick<Order, 'etaMinutes' | 'riderLocationUpdatedAt'> | null | undefined,
  now = Date.now()
): number | null {
  const base = order?.etaMinutes;
  if (base == null || !Number.isFinite(base) || base <= 0) return null;
  const updated = order?.riderLocationUpdatedAt ? Date.parse(order.riderLocationUpdatedAt) : NaN;
  if (!Number.isFinite(updated)) return Math.max(1, Math.round(base));
  const elapsedMin = Math.floor(Math.max(0, now - updated) / 60000);
  return Math.max(1, Math.round(base) - elapsedMin);
}

export function locationAgeLabel(iso?: string | null, now = Date.now()): string | null {
  if (!iso) return null;
  const updated = Date.parse(iso);
  if (!Number.isFinite(updated)) return null;
  const sec = Math.max(0, Math.floor((now - updated) / 1000));
  if (sec < 10) return 'Updated just now';
  if (sec < 60) return `Updated ${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `Updated ${min} min ago`;
  return 'Location is stale';
}

export function isEnRoute(status?: Order['status'] | null): boolean {
  return status === 'out_for_delivery' || status === 'returning';
}
