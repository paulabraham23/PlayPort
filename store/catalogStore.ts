import { create } from 'zustand';
import {
  CATEGORIES,
  EXPERIENCES,
  HUB,
  PRODUCTS,
} from '@/data/mock';
import {
  fetchCategories,
  fetchExperiences,
  fetchHub,
  fetchInventoryForHub,
  fetchProducts,
} from '@/lib/firestore';
import type { Category, Experience, HubInfo, Product } from '@/types';

type InventoryRow = {
  id: string;
  hubId?: string;
  productId?: string;
  available?: number;
  reserved?: number;
};

interface CatalogState {
  ready: boolean;
  source: 'mock' | 'firestore';
  categories: Category[];
  products: Product[];
  experiences: Experience[];
  hub: HubInfo;
  inventory: InventoryRow[];
  error: string | null;
  hydrate: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  ready: false,
  source: 'mock',
  categories: CATEGORIES,
  products: PRODUCTS,
  experiences: EXPERIENCES,
  hub: HUB,
  inventory: [],
  error: null,

  hydrate: async () => {
    try {
      const [categories, products, experiences, hub, inventory] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchExperiences(),
        fetchHub('indiranagar'),
        fetchInventoryForHub('indiranagar'),
      ]);

      // Prefer local catalog when Firestore still has stale/legacy items.
      const localIds = new Set(PRODUCTS.map((p) => p.id));
      const firestoreMatchesLocal =
        products.length > 0 && products.every((p) => localIds.has(p.id)) && products.length === PRODUCTS.length;

      if (!firestoreMatchesLocal) {
        set({ ready: true, source: 'mock', error: null });
        return;
      }

      set({
        ready: true,
        source: 'firestore',
        categories: categories.length ? categories : CATEGORIES,
        products,
        experiences: experiences.length ? experiences : EXPERIENCES,
        hub: hub ?? HUB,
        inventory: inventory as InventoryRow[],
        error: null,
      });
    } catch (e) {
      set({
        ready: true,
        source: 'mock',
        error: e instanceof Error ? e.message : 'Catalog load failed',
      });
    }
  },
}));
