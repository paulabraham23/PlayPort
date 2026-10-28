import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { orderNotBefore } from '@/utils/launch';

/**
 * Earliest allowed start for the cart (plus a product/combo being viewed),
 * so pre-book items can't be scheduled before their launch day.
 */
export function useOrderNotBefore(extra?: { productId?: string; experienceId?: string }): Date | null {
  const cart = useAppStore((s) => s.cart);
  const products = useCatalogStore((s) => s.products);
  const experiences = useCatalogStore((s) => s.experiences);
  const ms = useMemo(() => {
    const lines = extra ? [...cart, extra] : cart;
    return orderNotBefore(lines, products, experiences)?.getTime() ?? null;
  }, [cart, products, experiences, extra?.productId, extra?.experienceId]);
  return useMemo(() => (ms == null ? null : new Date(ms)), [ms]);
}
