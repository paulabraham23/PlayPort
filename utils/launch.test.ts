import { describe, expect, it } from 'vitest';
import type { Experience, Product } from '@/types';
import { orderNotBefore, upcomingLaunch } from './launch';
import {
  calendarMonths,
  daySlots,
  isAsapAvailable,
  isValidScheduledStart,
  launchStart,
} from './serviceHours';

// Wed 28 Oct 2026, 4:48 PM IST.
const now = new Date('2026-10-28T11:18:00Z');
const launch = launchStart('2026-11-19')!;

describe('launchStart', () => {
  it('reads a day as 12:00 AM IST', () => {
    expect(launch.toISOString()).toBe('2026-11-18T18:30:00.000Z');
  });
  it('ignores empty and junk values', () => {
    expect(launchStart('')).toBeNull();
    expect(launchStart(undefined)).toBeNull();
    expect(launchStart('soon')).toBeNull();
  });
});

describe('pre-book scheduling', () => {
  it('turns ASAP off before launch', () => {
    expect(isAsapAvailable(now, 3)).toBe(true);
    expect(isAsapAvailable(now, 3, launch)).toBe(false);
  });
  it('rejects starts before launch and accepts launch day from 8 AM', () => {
    expect(isValidScheduledStart('2026-11-18T10:30:00Z', now, 3, launch)).toBe(false); // 18 Nov 4 PM
    expect(isValidScheduledStart('2026-11-19T02:30:00Z', now, 3, launch)).toBe(true); // 19 Nov 8 AM
  });
  it('greys out every calendar day before launch', () => {
    const cells = calendarMonths(now, launch).flatMap((m) => m.cells).filter((c) => c?.available);
    expect(cells[0]?.key).toBe(launch.toISOString());
    expect(daySlots(launch, now, launch)).toHaveLength(16);
  });
});

describe('orderNotBefore', () => {
  const gta = { id: 'ps5-gta-6', availableFrom: '2026-11-19' } as Product;
  const ps5 = { id: 'ps5-slim-digital' } as Product;
  const combo = { id: 'gta-night', productIds: ['ps5-gta-6'] } as Experience;

  it('is null for normal carts and once launched', () => {
    expect(orderNotBefore([{ productId: 'ps5-slim-digital' }], [gta, ps5], [], now)).toBeNull();
    expect(upcomingLaunch(gta, new Date('2026-11-20T00:00:00Z'))).toBeNull();
  });
  it('follows pre-book products directly or inside a combo', () => {
    expect(orderNotBefore([{ productId: 'ps5-slim-digital' }, { productId: 'ps5-gta-6' }], [gta, ps5], [], now)).toEqual(launch);
    expect(orderNotBefore([{ experienceId: 'gta-night' }], [gta, ps5], [combo], now)).toEqual(launch);
  });
});
