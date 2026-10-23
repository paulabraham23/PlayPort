import { describe, expect, it } from 'vitest';
import { deliveryFeeForKm } from '../functions/src/delivery';
import { calcCartTotals } from './format';

describe('deliveryFeeForKm (free ≤ 5 km, then ₹7/km on all 4 trips)', () => {
  it('is free inside 5 km', () => {
    expect(deliveryFeeForKm(0)).toBe(0);
    expect(deliveryFeeForKm(3.4)).toBe(0);
    expect(deliveryFeeForKm(5)).toBe(0);
    expect(deliveryFeeForKm(5.04)).toBe(0); // rounds to 5.0 km
  });

  it('charges the km past 5 on drop-off and pickup, both ways (₹28 per extra km)', () => {
    expect(deliveryFeeForKm(5.1)).toBe(28);
    expect(deliveryFeeForKm(6)).toBe(28);
    expect(deliveryFeeForKm(8)).toBe(84);
    expect(deliveryFeeForKm(8.2)).toBe(112);
    expect(deliveryFeeForKm(16)).toBe(308); // Kachiguda → HITEC City by road
  });

  it('treats bad distances as free', () => {
    expect(deliveryFeeForKm(Number.NaN)).toBe(0);
  });
});

describe('calcCartTotals with delivery', () => {
  it('adds delivery after tax and skips it for an empty cart', () => {
    const t = calcCartTotals([{ unitPrice: 499, quantity: 1 }], 21);
    expect(t.taxes).toBe(25);
    expect(t.delivery).toBe(21);
    expect(t.total).toBe(499 + 25 + 21);
    expect(calcCartTotals([], 21).total).toBe(0);
  });
});
