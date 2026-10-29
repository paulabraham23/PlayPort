import type { CartItem, Product } from '@/types';
import { normalizeProduct } from '@/utils/rentalPricing';
import { launchStart } from '@/utils/serviceHours';

/** When a product's scheduled price change kicks in; null when it has none. */
export function priceChangeStart(product: Pick<Product, 'priceChange'> | null | undefined): Date | null {
  const change = product?.priceChange;
  if (!change?.plans?.length) return null;
  return launchStart(change.from);
}

/**
 * The product as priced for a rental starting at `startIso` (null = ASAP, i.e. now).
 * Rentals starting on/after the change day use the new plans.
 */
export function productForStart<T extends Product>(product: T, startIso: string | null | undefined, now = new Date()): T {
  const from = priceChangeStart(product);
  if (!from) return product;
  const start = startIso ? new Date(startIso) : now;
  if (!Number.isFinite(start.getTime()) || start.getTime() < from.getTime()) return product;
  return { ...product, plans: product.priceChange!.plans };
}

/** A price change that hasn't started yet (for "new prices from …" hints). */
export function upcomingPriceChange(product: Product, now = new Date()): Date | null {
  const from = priceChangeStart(product);
  return from && from.getTime() > now.getTime() ? from : null;
}

/**
 * Re-price package lines for the chosen start time. Hourly and combo lines are
 * untouched. Returns the same array when nothing changed.
 */
export function repriceCartForStart(
  cart: CartItem[],
  products: Product[],
  startIso: string | null | undefined,
  now = new Date()
): CartItem[] {
  let changed = false;
  const next = cart.map((line) => {
    if (!line.productId || line.experienceId || line.pricingMode === 'hourly') return line;
    const raw = products.find((p) => p.id === line.productId);
    if (!raw) return line;
    const plan = normalizeProduct(productForStart(raw, startIso, now)).plans.find((p) => p.id === line.planId);
    if (!plan || (plan.price === line.unitPrice && plan.label === line.durationLabel)) return line;
    changed = true;
    return { ...line, unitPrice: plan.price, durationLabel: plan.label };
  });
  return changed ? next : cart;
}
