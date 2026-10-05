import type {
  CartAddonLine,
  CartItem,
  PricingMode,
  Product,
  ProductAddon,
  RentalPlan,
} from '@/types';
import { formatINR } from '@/utils/format';

/** Flyer-style default empty plans for admin “Load defaults”. */
export const DEFAULT_PLAN_TEMPLATES: Omit<RentalPlan, 'price'>[] = [
  { id: '1h', label: '1 Hour', hours: 1 },
  { id: '3h', label: '3 Hours', hours: 3, popular: true },
  { id: '6h', label: '6 Hours', hours: 6 },
  { id: '12h', label: '12 Hours', hours: 12 },
  { id: '24h', label: '24 Hours', hours: 24 },
];

export function defaultExtraControllerAddon(): ProductAddon {
  return {
    id: 'extra-controller',
    name: 'Extra Controller',
    description: '₹20/hr for short sessions · ₹150 flat for 12h/24h packages',
    maxQuantity: 3,
    pricing: {
      perHour: 20,
      perHourMaxPlanHours: 6,
      flatPrice: 150,
      flatMinPlanHours: 12,
    },
  };
}

/** Migrate legacy priceByDuration docs into plans. */
export function normalizeProduct(raw: Product): Product {
  const plans =
    raw.plans?.length > 0
      ? [...raw.plans].sort((a, b) => a.hours - b.hours)
      : legacyPlansFromPriceByDuration(raw.priceByDuration);
  return {
    ...raw,
    plans,
    hourly: raw.hourly ?? null,
    addons: raw.addons ?? [],
  };
}

function legacyPlansFromPriceByDuration(
  map?: Record<string, number>
): RentalPlan[] {
  if (!map || !Object.keys(map).length) {
    return DEFAULT_PLAN_TEMPLATES.map((t) => ({ ...t, price: 0 }));
  }
  const hoursFor: Record<string, number> = {
    '1h': 1,
    '3h': 3,
    '4h': 4,
    '6h': 6,
    '12h': 12,
    '24h': 24,
    weekend: 48,
  };
  const labels: Record<string, string> = {
    '1h': '1 Hour',
    '3h': '3 Hours',
    '4h': '4 Hours',
    '6h': '6 Hours',
    '12h': '12 Hours',
    '24h': '24 Hours',
    weekend: 'Weekend Pass',
  };
  return Object.entries(map)
    .map(([id, price]) => ({
      id,
      label: labels[id] ?? id,
      hours: hoursFor[id] ?? (parseInt(id, 10) || 12),
      price: Number(price) || 0,
      popular: id === '12h' || id === '3h',
    }))
    .sort((a, b) => a.hours - b.hours);
}

export function defaultPlan(product: Product): RentalPlan | null {
  const p = normalizeProduct(product);
  if (!p.plans.length) return null;
  return p.plans.find((x) => x.popular) ?? p.plans[0];
}

export function cheapestPlanPrice(product: Product): number | null {
  const p = normalizeProduct(product);
  const priced = p.plans.filter((x) => x.price > 0);
  if (!priced.length) return null;
  return Math.min(...priced.map((x) => x.price));
}

export function priceForPlan(product: Product, planId: string): number {
  const plan = normalizeProduct(product).plans.find((x) => x.id === planId);
  return plan?.price ?? 0;
}

export function priceForHourly(product: Product, hours: number): number {
  const h = product.hourly;
  if (!h?.enabled || hours < 1) return 0;
  const max = h.maxHours ?? 24;
  const n = Math.min(Math.max(1, Math.floor(hours)), max);
  if (n === 1) return h.firstHourPrice;
  return h.firstHourPrice + (n - 1) * h.extraHourPrice;
}

export function isControllerAddon(addon: { id: string; name: string }): boolean {
  return addon.id === 'extra-controller' || /controller/i.test(addon.name);
}

/** How this product charges for one extra controller, in plain language. */
export function describeControllerPrice(addon: ProductAddon): string {
  const { perHour, perHourMaxPlanHours, flatPrice, flatMinPlanHours } = addon.pricing;
  const hourly = perHour > 0;
  const flat = flatPrice > 0;
  if (flat && flatMinPlanHours <= 1 && !hourly) return `${formatINR(flatPrice)} each`;
  if (hourly && flat) {
    return `${formatINR(perHour)}/hr up to ${perHourMaxPlanHours}h · ${formatINR(flatPrice)} flat from ${flatMinPlanHours}h`;
  }
  if (hourly) return `${formatINR(perHour)}/hr`;
  if (flat) return `${formatINR(flatPrice)} flat from ${flatMinPlanHours}h`;
  return 'No charge';
}

export function priceForAddon(
  addon: ProductAddon,
  hours: number,
  quantity = 1
): number {
  const q = Math.max(0, quantity);
  if (q <= 0) return 0;
  const { pricing } = addon;
  const useFlat = pricing.flatPrice > 0 && hours >= pricing.flatMinPlanHours;
  const unit = useFlat ? pricing.flatPrice : pricing.perHour * hours;
  return unit * q;
}

export function kitUnitPrice(
  product: Product,
  mode: PricingMode,
  planId: string,
  hours: number
): number {
  if (mode === 'hourly') return priceForHourly(product, hours);
  return priceForPlan(product, planId);
}

export function computeAddonLines(
  product: Product,
  hours: number,
  selected: { id: string; quantity: number }[]
): CartAddonLine[] {
  const catalog = normalizeProduct(product).addons ?? [];
  return selected
    .filter((s) => s.quantity > 0)
    .map((s) => {
      const addon = catalog.find((a) => a.id === s.id);
      if (!addon) return null;
      const qty = Math.min(s.quantity, addon.maxQuantity);
      const total = priceForAddon(addon, hours, qty);
      return {
        id: addon.id,
        name: addon.name,
        quantity: qty,
        unitPrice: qty > 0 ? Math.round(total / qty) : 0,
      } satisfies CartAddonLine;
    })
    .filter(Boolean) as CartAddonLine[];
}

export function addonsTotal(lines?: CartAddonLine[]): number {
  if (!lines?.length) return 0;
  return lines.reduce((sum, a) => sum + a.unitPrice * a.quantity, 0);
}

export function cartLineTotal(item: CartItem): number {
  const base = item.unitPrice * item.quantity;
  const extras = (item.addonsTotal ?? addonsTotal(item.addons)) * item.quantity;
  return base + extras;
}

export function resolveHours(
  product: Product,
  mode: PricingMode,
  planId: string,
  hourlyHours?: number
): number {
  if (mode === 'hourly') {
    const max = product.hourly?.maxHours ?? 24;
    return Math.min(Math.max(1, hourlyHours ?? 1), max);
  }
  const plan = normalizeProduct(product).plans.find((p) => p.id === planId);
  return plan?.hours ?? 12;
}
