import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = 'playport-wishlist';

interface WishlistState {
  ids: string[];
  ready: boolean;
  hydrate: () => Promise<void>;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  ready: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      set({ ids: Array.isArray(ids) ? ids : [], ready: true });
    } catch {
      set({ ready: true });
    }
  },
  toggle: (productId) => {
    const ids = get().ids.includes(productId)
      ? get().ids.filter((id) => id !== productId)
      : [...get().ids, productId];
    set({ ids });
    void AsyncStorage.setItem(KEY, JSON.stringify(ids));
  },
  has: (productId) => get().ids.includes(productId),
}));
