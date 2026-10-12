import { describe, expect, it } from 'vitest';
import { isDisplayableImage } from './images';
import { isEnRoute, locationAgeLabel, remainingEtaMinutes } from './liveEta';

describe('remainingEtaMinutes', () => {
  it('counts down from the last ping, floored at 1', () => {
    const updated = new Date('2026-10-12T10:00:00Z').toISOString();
    const order = { etaMinutes: 30, riderLocationUpdatedAt: updated };
    expect(remainingEtaMinutes(order, Date.parse('2026-10-12T10:09:00Z'))).toBe(21);
    expect(remainingEtaMinutes(order, Date.parse('2026-10-12T12:00:00Z'))).toBe(1);
  });
  it('returns null without a usable base', () => {
    expect(remainingEtaMinutes(null)).toBeNull();
    expect(remainingEtaMinutes({ etaMinutes: 0 })).toBeNull();
    expect(remainingEtaMinutes({ etaMinutes: NaN })).toBeNull();
  });
  it('uses the base when no ping timestamp exists', () => {
    expect(remainingEtaMinutes({ etaMinutes: 12.6 })).toBe(13);
  });
});

describe('locationAgeLabel', () => {
  const now = Date.parse('2026-10-12T10:00:00Z');
  it('labels fresh, aged, and stale pings', () => {
    expect(locationAgeLabel(new Date(now - 5000).toISOString(), now)).toBe('Updated just now');
    expect(locationAgeLabel(new Date(now - 45000).toISOString(), now)).toBe('Updated 45s ago');
    expect(locationAgeLabel(new Date(now - 5 * 60000).toISOString(), now)).toBe('Updated 5 min ago');
    expect(locationAgeLabel(new Date(now - 3 * 3600000).toISOString(), now)).toBe('Location is stale');
    expect(locationAgeLabel(null, now)).toBeNull();
    expect(locationAgeLabel('garbage', now)).toBeNull();
  });
});

describe('isEnRoute', () => {
  it('is true only while the rider is moving', () => {
    expect(isEnRoute('out_for_delivery')).toBe(true);
    expect(isEnRoute('returning')).toBe(true);
    expect(isEnRoute('delivered')).toBe(false);
    expect(isEnRoute(null)).toBe(false);
  });
});

describe('isDisplayableImage', () => {
  it('accepts direct images and rejects search links/trivia', () => {
    expect(isDisplayableImage('https://images.unsplash.com/photo-1?w=100')).toBe(true);
    expect(isDisplayableImage('data:image/png;base64,abc')).toBe(true);
    expect(isDisplayableImage('https://www.google.com/search?q=ps5')).toBe(false);
    expect(isDisplayableImage('')).toBe(false);
    expect(isDisplayableImage(null)).toBe(false);
    expect(isDisplayableImage('ftp://x/y.jpg')).toBe(false);
  });
});
