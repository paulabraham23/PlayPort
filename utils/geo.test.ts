import { describe, expect, it } from 'vitest';
import { distanceKm, etaMinutesFromKm, formatEtaMinutes } from './geo';

describe('distanceKm (Haversine)', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(12.9716, 77.5946, 12.9716, 77.5946)).toBe(0);
  });
  it('is symmetric', () => {
    const a = distanceKm(12.9716, 77.5946, 13.0827, 80.2707);
    const b = distanceKm(13.0827, 80.2707, 12.9716, 77.5946);
    expect(a).toBeCloseTo(b, 9);
  });
  it('matches known city distances (Bengaluru → Chennai ≈ 290 km)', () => {
    expect(distanceKm(12.9716, 77.5946, 13.0827, 80.2707)).toBeGreaterThan(280);
    expect(distanceKm(12.9716, 77.5946, 13.0827, 80.2707)).toBeLessThan(300);
  });
  it('resolves a doorstep walk (~100 m)', () => {
    expect(distanceKm(12.9716, 77.5946, 12.9725, 77.5946)).toBeGreaterThan(0.05);
    expect(distanceKm(12.9716, 77.5946, 12.9725, 77.5946)).toBeLessThan(0.2);
  });
});

describe('etaMinutesFromKm', () => {
  it('adds the doorstep buffer and clamps the floor', () => {
    expect(etaMinutesFromKm(0)).toBe(5); // max(5, 0 + 3)
    expect(etaMinutesFromKm(10)).toBe(Math.ceil((10 / 22) * 60) + 3);
  });
  it('caps runaway ETAs and rejects garbage', () => {
    expect(etaMinutesFromKm(500)).toBe(90);
    expect(etaMinutesFromKm(NaN)).toBe(30);
    expect(etaMinutesFromKm(-4)).toBe(30);
  });
});

describe('formatEtaMinutes', () => {
  it('handles nulls and rounding', () => {
    expect(formatEtaMinutes(null)).toBe('—');
    expect(formatEtaMinutes(0.4)).toBe('About 1 min');
    expect(formatEtaMinutes(12.4)).toBe('About 12 min');
  });
});
