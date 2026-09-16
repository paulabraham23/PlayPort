import { create } from 'zustand';
import {
  CATEGORIES,
  EXPERIENCES,
  HUB,
  PRODUCTS,
} from '@/data/mock';
import {
  fetchActiveHubs,
  fetchCategories,
  fetchExperiences,
  fetchInventoryUnitsForHub,
  fetchProducts,
  resolveDefaultHub,
} from '@/lib/firestore';
import type { Category, Experience, HubInfo, InventoryUnit, Product } from '@/types';

interface CatalogState {
  ready: boolean;
  source: 'mock' | 'firestore';
  categories: Category[];
  products: Product[];
  experiences: Experience[];
  hub: HubInfo;
  hubs: HubInfo[];
  units: InventoryUnit[];
  error: string | null;
  hydrate: () => Promise<void>;
  setActiveHub: (hubId: string) => Promise<void>;
  unitsForProduct: (productId: string) => InventoryUnit[];
  availabilityLabelFor: (productId: string) => string;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  ready: false,
  source: 'mock',
  categories: CATEGORIES,
  products: PRODUCTS,
  experiences: EXPERIENCES,
  hub: HUB,
  hubs: [HUB],
  units: [],
  error: null,

  unitsForProduct: (productId) => get().units.filter((u) => u.productId === productId && u.status === 'available'),

  availabilityLabelFor: (productId) => {
    const count = get().unitsForProduct(productId).length;
    if (!get().units.length) {
      const product = get().products.find((p) => p.id === productId);
      return product?.availabilityLabel ?? 'Check availability';
    }
    if (count <= 0) return 'No units at hub';
    if (count <= 2) return `${count} units at hub`;
    return `${count} units at hub`;
  },

  setActiveHub: async (hubId) => {
    const hub = get().hubs.find((h) => h.id === hubId) ?? (await resolveDefaultHub(hubId));
    if (!hub) return;
    const units = await fetchInventoryUnitsForHub(hub.id);
    const products = get().products.map((p) => {
      const n = units.filter((u) => u.productId === p.id && u.status === 'available').length;
      return {
        ...p,
        availabilityLabel: n > 0 ? (n <= 2 ? `${n} units at hub` : `${n} units at hub`) : 'No units at hub',
      };
    });
    set({ hub, units, products });
  },

  hydrate: async () => {
    try {
      const [categories, products, experiences, hubs] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchExperiences(),
        fetchActiveHubs(),
      ]);

      const hubList = hubs.length ? hubs : [HUB];
      const hub = hubList[0];
      const units = hubs.length ? await fetchInventoryUnitsForHub(hub.id) : [];

      if (!products.length) {
        set({
          ready: true,
          source: 'mock',
          hubs: hubList,
          hub,
          units,
          error: 'Firestore catalog empty — using local catalog',
        });
        return;
      }

      const enriched = products.map((p) => {
        const n = units.filter((u) => u.productId === p.id && u.status === 'available').length;
        return {
          ...p,
          availabilityLabel: n > 0 ? `${n} units at hub` : 'No units at hub',
        };
      });

      set({
        ready: true,
        source: 'firestore',
        categories: categories.length ? categories : CATEGORIES,
        products: enriched,
        experiences,
        hubs: hubList,
        hub,
        units,
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
