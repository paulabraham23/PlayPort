import { describe, expect, it } from 'vitest';
import { isInServiceArea } from './serviceArea';

describe('isInServiceArea (Hyderabad only)', () => {
  it('accepts pins across Hyderabad and Secunderabad', () => {
    expect(isInServiceArea({ lat: 17.3867, lng: 78.4896 })).toBe(true); // Kachiguda hub
    expect(isInServiceArea({ lat: 17.4486, lng: 78.3908 })).toBe(true); // HITEC City
    expect(isInServiceArea({ lat: 17.4635, lng: 78.5196 })).toBe(true); // Karkhana, Secunderabad
  });

  it('rejects pins in other cities and far outside the ring road', () => {
    expect(isInServiceArea({ lat: 12.9716, lng: 77.5946 })).toBe(false); // Bengaluru
    expect(isInServiceArea({ lat: 17.9689, lng: 79.5941 })).toBe(false); // Warangal
    expect(isInServiceArea({ lat: 17.24, lng: 78.43 })).toBe(true); // Shamshabad side, inside 30 km
  });

  it('lets the pin win over a typed Hyderabad city', () => {
    expect(isInServiceArea({ lat: 12.9716, lng: 77.5946, city: 'Hyderabad', pincode: '500027' })).toBe(false);
  });

  it('falls back to the pincode, then the city name', () => {
    expect(isInServiceArea({ pincode: '500027' })).toBe(true);
    expect(isInServiceArea({ pincode: '560038', city: 'Hyderabad' })).toBe(false);
    expect(isInServiceArea({ city: 'Secunderabad' })).toBe(true);
    expect(isInServiceArea({ city: 'Bengaluru' })).toBe(false);
    expect(isInServiceArea(null)).toBe(false);
  });
});
