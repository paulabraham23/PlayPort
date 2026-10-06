/** Pure pricing helpers mirrored for Cloud Functions (keep in sync with utils/rentalPricing.ts). */

export type FnRentalPlan = {
  id: string;
  label: string;
  hours: number;
  price: number;
  popular?: boolean;
};

export type FnHourly = {
  enabled: boolean;
  firstHourPrice: number;
  extraHourPrice: number;
  maxHours?: number;
};

export type FnAddon = {
  id: string;
  name: string;
  maxQuantity: number;
  pricing: {
    perHour: number;
    perHourMaxPlanHours: number;
    flatPrice: number;
    flatMinPlanHours: number;
    tiers?: { upToHours: number; price: number }[];
  };
};

export type FnProduct = {
  id: string;
  plans?: FnRentalPlan[];
  hourly?: FnHourly | null;
  addons?: FnAddon[];
  priceByDuration?: Record<string, number>;
};

export type FnCartAddon = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type FnCartItem = {
  productId?: string;
  experienceId?: string;
  planId?: string;
  durationId?: string;
  hours?: number;
  pricingMode?: 'package' | 'hourly';
  unitPrice: number;
  quantity: number;
  addons?: FnCartAddon[];
  addonsTotal?: number;
  inventoryUnitId?: string;
};

function legacyPlans(map?: Record<string, number>): FnRentalPlan[] {
  if (!map) return [];
  const hoursFor: Record<string, number> = {
    '1h': 1,
    '3h': 3,
    '4h': 4,
    '6h': 6,
    '12h': 12,
    '24h': 24,
    weekend: 48,
  };
  return Object.entries(map).map(([id, price]) => ({
    id,
    label: id,
    hours: hoursFor[id] ?? 12,
    price: Number(price) || 0,
  }));
}

export function normalizeFnProduct(raw: FnProduct): FnProduct & { plans: FnRentalPlan[] } {
  const plans = raw.plans?.length ? raw.plans : legacyPlans(raw.priceByDuration);
  return { ...raw, plans };
}

export function priceForPlan(product: FnProduct, planId: string): number {
  const plan = normalizeFnProduct(product).plans.find((x) => x.id === planId);
  return plan?.price ?? 0;
}

export function priceForHourly(product: FnProduct, hours: number): number {
  const h = product.hourly;
  if (!h?.enabled || hours < 1) return 0;
  const max = h.maxHours ?? 24;
  const n = Math.min(Math.max(1, Math.floor(hours)), max);
  if (n === 1) return h.firstHourPrice;
  return h.firstHourPrice + (n - 1) * h.extraHourPrice;
}

export function priceForAddon(addon: FnAddon, hours: number, quantity = 1): number {
  const q = Math.max(0, quantity);
  if (q <= 0) return 0;
  const tiers = (addon.pricing.tiers ?? [])
    .filter((t) => t.upToHours > 0 && t.price >= 0)
    .sort((a, b) => a.upToHours - b.upToHours);
  if (tiers.length) {
    return ((tiers.find((t) => hours <= t.upToHours) ?? tiers[tiers.length - 1]).price * q);
  }
  const { pricing } = addon;
  const useFlat = pricing.flatPrice > 0 && hours >= pricing.flatMinPlanHours;
  const unit = useFlat ? pricing.flatPrice : pricing.perHour * hours;
  return unit * q;
}

export function expectedLineTotal(product: FnProduct | null, item: FnCartItem): number {
  if (!product || item.experienceId) {
    const base = item.unitPrice * item.quantity;
    const extras = (item.addonsTotal ?? 0) * item.quantity;
    return base + extras;
  }
  const mode = item.pricingMode ?? 'package';
  const hours = item.hours ?? 12;
  const planId = item.planId || item.durationId || '';
  const kit =
    mode === 'hourly' ? priceForHourly(product, hours) : priceForPlan(product, planId);
  const catalog = normalizeFnProduct(product).addons ?? [];
  let extras = 0;
  for (const line of item.addons ?? []) {
    const addon = catalog.find((a) => a.id === line.id);
    if (!addon) continue;
    extras += priceForAddon(addon, hours, line.quantity);
  }
  return (kit + extras) * item.quantity;
}

export function cartItemHours(item: FnCartItem): number {
  if (typeof item.hours === 'number' && item.hours > 0) return item.hours;
  return 12;
}
