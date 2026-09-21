import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { riderPingLocation } from '@/lib/riderFirestore';
import type { Order, Rider } from '@/types';

const TRACKING_STATUSES = new Set(['out_for_delivery', 'returning']);
const PING_MS = 15000;

/**
 * While the rider has an active en-route job, stream GPS into the order doc
 * so customers can see ETA minutes (not a map).
 */
export function useRiderLocationTracking(rider: Rider | null, mine: Order[]) {
  const activeIds = mine
    .filter((o) => TRACKING_STATUSES.has(o.status))
    .map((o) => o.id)
    .sort()
    .join(',');
  const lastPing = useRef(0);

  useEffect(() => {
    if (!rider || !activeIds) return;
    const orderIds = activeIds.split(',').filter(Boolean);
    let cancelled = false;
    let watchSub: Location.LocationSubscription | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const ping = async (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastPing.current < 8000) return;
      lastPing.current = now;
      await Promise.all(
        orderIds.map((id) =>
          riderPingLocation(id, rider.id, lat, lng).catch(() => undefined)
        )
      );
    };

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      watchSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: PING_MS,
          distanceInterval: 40,
        },
        (pos) => {
          void ping(pos.coords.latitude, pos.coords.longitude);
        }
      );

      // Also interval fallback (web watchers can be flaky)
      interval = setInterval(() => {
        void Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
          .then((pos) => ping(pos.coords.latitude, pos.coords.longitude))
          .catch(() => undefined);
      }, PING_MS);
    })();

    return () => {
      cancelled = true;
      watchSub?.remove();
      if (interval) clearInterval(interval);
    };
  }, [rider, activeIds]);
}
