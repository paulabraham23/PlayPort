import { create } from 'zustand';
import {
  fetchActiveHubs,
  fetchCategories,
  fetchExperiences,
  fetchInventoryUnitsForHub,
  fetchProducts,
  resolveDefaultHub,
} from '@/lib/firestore';
import type { Category, Experience, HubInfo, InventoryUnit, Product } from '@/types';
import { normalizeProduct } from '@/utils/rentalPricing';

const EMPTY_HUB: HubInfo = {
  id: 'pending',
  name: 'PlayPort',
  city: '—',
  state: '',
  etaMinutes: 30,
  active: true,
};

interface CatalogState {
  ready: boolean;
  source: 'firestore' | 'empty' | 'error';
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

const DISALLOWED_TAGS = /deposit|digilocker|kyc/i;

function sanitizeProduct(p: Product): Product {
  return {
    ...p,
    tags: (p.tags ?? []).filter((t) => !DISALLOWED_TAGS.test(t)),
  };
}

function enrichProducts(products: Product[], units: InventoryUnit[]): Product[] {
  return products.map((raw) => {
    const p = normalizeProduct(sanitizeProduct(raw));
    const n = units.filter((u) => u.productId === p.id && u.status === 'available').length;
    return {
      ...p,
      availabilityLabel: n > 0 ? `${n} units at hub` : 'No units at hub',
    };
  });
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  ready: false,
  source: 'empty',
  categories: [],
  products: [],
  experiences: [],
  hub: EMPTY_HUB,
  hubs: [],
  units: [],
  error: null,

  unitsForProduct: (productId) =>
    get().units.filter((u) => u.productId === productId && u.status === 'available'),

  availabilityLabelFor: (productId) => {
    const count = get().unitsForProduct(productId).length;
    if (!get().units.length) {
      const product = get().products.find((p) => p.id === productId);
      return product?.availabilityLabel ?? 'Check availability';
    }
    if (count <= 0) return 'No units at hub';
    return `${count} units at hub`;
  },

  setActiveHub: async (hubId) => {
    const hub = get().hubs.find((h) => h.id === hubId) ?? (await resolveDefaultHub(hubId));
    if (!hub) return;
    const units = await fetchInventoryUnitsForHub(hub.id);
    set({ hub, units, products: enrichProducts(get().products, units) });
  },

  hydrate: async () => {
    try {
      const [categories, products, experiences, hubs] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchExperiences(),
        fetchActiveHubs(),
      ]);

      const hubList = hubs.length ? hubs : [];
      const hub = hubList[0] ?? EMPTY_HUB;
      const units = hubList.length ? await fetchInventoryUnitsForHub(hub.id) : [];

      set({
        ready: true,
        source: products.length || experiences.length ? 'firestore' : 'empty',
        categories,
        products: enrichProducts(products, units),
        experiences,
        hubs: hubList,
        hub,
        units,
        error: products.length
          ? null
          : 'No products in the store yet. Add them in Admin → Products.',
      });
    } catch (e) {
      // Never ship mock SKUs — show empty catalog + error.
      set({
        ready: true,
        source: 'error',
        categories: [],
        products: [],
        experiences: [],
        hubs: [],
        hub: EMPTY_HUB,
        units: [],
        error:
          e instanceof Error
            ? e.message
            : 'Could not load catalog. Check your connection and try again.',
      });
    }
  },
}));
