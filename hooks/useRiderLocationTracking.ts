import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { riderPingLocation } from '@/lib/riderFirestore';
import type { Order, Rider } from '@/types';

const TRACKING_STATUSES = new Set(['out_for_delivery', 'returning']);
const PING_MS = 10000;

export type RiderLocationState = 'idle' | 'watching' | 'denied' | 'unavailable';

/**
 * While the rider has an en-route job, stream GPS into the order so the
 * customer countdown updates. Pings immediately, then on movement and on a timer.
 */
export function useRiderLocationTracking(rider: Rider | null, mine: Order[]): RiderLocationState {
  const activeIds = mine
    .filter((o) => TRACKING_STATUSES.has(o.status))
    .map((o) => o.id)
    .sort()
    .join(',');
  const [state, setState] = useState<RiderLocationState>(activeIds ? 'idle' : 'idle');

  useEffect(() => {
    if (!rider || !activeIds) {
      setState('idle');
      return;
    }
    const orderIds = activeIds.split(',').filter(Boolean);
    let cancelled = false;
    const handle: {
      watch: Location.LocationSubscription | null;
      interval: ReturnType<typeof setInterval> | null;
    } = { watch: null, interval: null };
    let lastPing = 0;

    const ping = async (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastPing < 5000) return;
      lastPing = now;
      await Promise.all(
        orderIds.map((id) => riderPingLocation(id, rider.id, lat, lng).catch(() => undefined))
      );
    };

    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (perm.status !== 'granted') {
        setState('denied');
        return;
      }

      const readOnce = async () => {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!cancelled) await ping(pos.coords.latitude, pos.coords.longitude);
      };

      try {
        await readOnce();
      } catch {
        if (!cancelled) setState('unavailable');
      }
      if (cancelled) return;
      setState('watching');

      handle.watch = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: PING_MS,
          distanceInterval: 15,
        },
        (pos) => {
          void ping(pos.coords.latitude, pos.coords.longitude);
        }
      );

      handle.interval = setInterval(() => {
        void readOnce().catch(() => undefined);
      }, PING_MS);
    })();

    return () => {
      cancelled = true;
      handle.watch?.remove();
      if (handle.interval) clearInterval(handle.interval);
    };
  }, [rider, activeIds]);

  return state;
}
