import { describe, expect, it } from 'vitest';
import {
  calcCartTotals,
  formatAddressLine,
  formatINR,
  orderStatusLabel,
  searchProducts,
} from './format';

describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(249)).toBe('₹249');
    expect(formatINR(1000)).toBe('₹1,000');
    expect(formatINR(100000)).toBe('₹1,00,000');
  });
});

describe('formatAddressLine', () => {
  it('joins parts and skips line2 when absent', () => {
    expect(
      formatAddressLine({ line1: 'Flat 302', area: 'Indiranagar', city: 'Bengaluru', pincode: '560038' })
    ).toBe('Flat 302, Indiranagar, Bengaluru - 560038');
  });
});

describe('orderStatusLabel', () => {
  it('maps known statuses and uppercases unknown ones', () => {
    expect(orderStatusLabel('out_for_delivery')).toBe('OUT FOR DELIVERY');
    expect(orderStatusLabel('pending_payment')).toBe('AWAITING PAYMENT');
    expect(orderStatusLabel('whatever')).toBe('WHATEVER');
  });
});

describe('searchProducts', () => {
  const catalog = [
    { name: 'PlayStation 5', shortName: 'PS5', tags: ['CONSOLE'], description: 'Sony console', categoryId: 'gaming' },
    { name: 'Meta Quest 2', shortName: 'Quest', tags: ['VR'], description: 'headset', categoryId: 'vr' },
  ];
  it('matches across name/tags/category and all tokens', () => {
    expect(searchProducts('ps5', catalog)).toHaveLength(1);
    expect(searchProducts('vr headset', catalog)).toHaveLength(1);
    expect(searchProducts('ps5 vr', catalog)).toHaveLength(0);
    expect(searchProducts('', catalog)).toHaveLength(0);
  });
});

describe('calcCartTotals', () => {
  it('sums lines with addons, adds no tax, counts quantity', () => {
    const t = calcCartTotals([
      { unitPrice: 449, quantity: 1 },
      { unitPrice: 150, quantity: 2, addons: [{ unitPrice: 100, quantity: 1 }] },
    ]);
    // (449) + ((150 + 100) * 2) = 949 items
    expect(t.itemsTotal).toBe(949);
    expect(t.taxes).toBe(0);
    expect(t.total).toBe(949);
    expect(t.count).toBe(3);
  });
  it('prefers explicit addonsTotal and handles empty carts', () => {
    expect(calcCartTotals([{ unitPrice: 100, quantity: 1, addonsTotal: 40 }]).itemsTotal).toBe(140);
    expect(calcCartTotals([])).toMatchObject({ itemsTotal: 0, taxes: 0, total: 0, count: 0 });
  });
});
