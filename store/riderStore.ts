import { create } from 'zustand';
import {
  resolveRiderProfile,
  riderAcceptOrder,
  riderUpdateOrderStatus,
  watchRiderOrders,
} from '@/lib/riderFirestore';
import type { Order, OrderStatus, Rider } from '@/types';
import type { Unsubscribe } from 'firebase/firestore';

interface RiderState {
  ready: boolean;
  rider: Rider | null;
  available: Order[];
  mine: Order[];
  error: string | null;
  bootstrap: () => Promise<() => void>;
  accept: (orderId: string) => Promise<void>;
  setStatus: (orderId: string, status: OrderStatus, otp?: string) => Promise<void>;
}

let unsub: Unsubscribe | null = null;

export const useRiderStore = create<RiderState>((set, get) => ({
  ready: false,
  rider: null,
  available: [],
  mine: [],
  error: null,

  bootstrap: async () => {
    unsub?.();
    unsub = null;
    set({ ready: false, error: null });
    try {
      const rider = await resolveRiderProfile();
      if (!rider || !rider.active) {
        set({ ready: true, rider: null, available: [], mine: [] });
        return () => undefined;
      }
      set({ rider, ready: true });
      unsub = watchRiderOrders(rider.id, (available, mine) => {
        const hubFiltered = rider.hubId
          ? available.filter((o) => !o.hubId || o.hubId === rider.hubId)
          : available;
        set({ available: hubFiltered, mine });
      });
      return () => {
        unsub?.();
        unsub = null;
      };
    } catch (e) {
      set({
        ready: true,
        error: e instanceof Error ? e.message : 'Could not load rider portal',
      });
      return () => undefined;
    }
  },

  accept: async (orderId) => {
    const rider = get().rider;
    if (!rider) throw new Error('Not signed in as rider');
    await riderAcceptOrder(orderId, rider);
  },

  setStatus: async (orderId, status, otp) => {
    const rider = get().rider;
    if (!rider) throw new Error('Not signed in as rider');
    await riderUpdateOrderStatus(orderId, status, rider.id, otp);
  },
}));
