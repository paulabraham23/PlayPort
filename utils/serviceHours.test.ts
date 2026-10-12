import { describe, expect, it } from 'vitest';
import {
  availableDays,
  daySlots,
  formatSlot,
  formatWindow,
  isDispatchable,
  isServiceOpen,
  isValidScheduledStart,
  nextOpenStart,
} from './serviceHours';

// Fixed reference: Monday 2026-10-12. IST = UTC + 5:30.
const T = (utc: string) => new Date(utc);

describe('isServiceOpen (IST 8 AM – midnight)', () => {
  it('is closed just before 8 AM IST', () => {
    expect(isServiceOpen(T('2026-10-12T02:29:00Z'))).toBe(false); // 7:59 IST
  });
  it('opens exactly at 8 AM IST', () => {
    expect(isServiceOpen(T('2026-10-12T02:30:00Z'))).toBe(true);
  });
  it('is open mid-day and late evening', () => {
    expect(isServiceOpen(T('2026-10-12T06:30:00Z'))).toBe(true); // 12:00 IST
    expect(isServiceOpen(T('2026-10-12T18:29:00Z'))).toBe(true); // 23:59 IST
  });
  it('closes exactly at midnight IST', () => {
    expect(isServiceOpen(T('2026-10-12T18:30:00Z'))).toBe(false); // 00:00 IST next day
    expect(isServiceOpen(T('2026-10-12T20:00:00Z'))).toBe(false); // 1:30 AM IST
  });
});

describe('daySlots', () => {
  it('offers 16 hourly slots (8 AM – 11 PM) for a future day', () => {
    const now = T('2026-10-12T06:00:00Z'); // 11:30 AM IST Monday
    const days = availableDays(now);
    const wed = days.find((d) => d.label !== 'Today' && d.label !== 'Tomorrow')!;
    expect(daySlots(wed.date, now)).toHaveLength(16);
  });
  it('hides past + lead-time slots for today', () => {
    const now = T('2026-10-12T10:00:00Z'); // 3:30 PM IST
    const today = availableDays(now)[0];
    const slots = daySlots(today.date, now);
    // 45-min lead → first bookable is the 5 PM slot (16:00 + 45min pushes past 16:00)
    expect(slots[0].toISOString()).toBe(new Date(today.date.getTime() + 17 * 3600 * 1000).toISOString());
    expect(slots.every((s) => s.getTime() >= now.getTime() + 45 * 60 * 1000)).toBe(true);
  });
  it('today disappears from days when no slots remain (late night)', () => {
    const now = T('2026-10-12T18:00:00Z'); // 11:30 PM IST
    expect(availableDays(now)[0].label).not.toBe('Today');
  });
});

describe('isValidScheduledStart', () => {
  const now = T('2026-10-12T06:00:00Z'); // 11:30 AM IST
  it('accepts a valid afternoon slot', () => {
    expect(isValidScheduledStart(T('2026-10-12T10:30:00Z').toISOString(), now)).toBe(true); // 4 PM IST
  });
  it('rejects past and too-soon slots', () => {
    expect(isValidScheduledStart(T('2026-10-12T05:00:00Z').toISOString(), now)).toBe(false);
    expect(isValidScheduledStart(new Date(now.getTime() + 10 * 60 * 1000).toISOString(), now)).toBe(false);
  });
  it('rejects night starts and far-future starts', () => {
    expect(isValidScheduledStart(T('2026-10-12T20:00:00Z').toISOString(), now)).toBe(false); // 1:30 AM
    expect(isValidScheduledStart(T('2026-10-20T10:30:00Z').toISOString(), now)).toBe(false); // +8d
  });
  it('rejects garbage', () => {
    expect(isValidScheduledStart(null, now)).toBe(false);
    expect(isValidScheduledStart('not-a-date', now)).toBe(false);
  });
});

describe('formatting + next opening', () => {
  const now = T('2026-10-12T06:00:00Z');
  it('labels today/tomorrow slots', () => {
    expect(formatSlot(T('2026-10-12T10:30:00Z').toISOString(), now)).toMatch(/^Today, /);
    expect(formatSlot(T('2026-10-13T10:30:00Z').toISOString(), now)).toMatch(/^Tomorrow, /);
  });
  it('renders overnight windows like 4 PM – 4 AM', () => {
    const label = formatWindow(T('2026-10-12T10:30:00Z').toISOString(), 12);
    expect(label).toContain('4');
    expect(label).toContain('–');
  });
  it('nextOpenStart points at 8 AM (same day before, next day after)', () => {
    expect(nextOpenStart(T('2026-10-12T20:00:00Z')).toISOString()).toBe('2026-10-13T02:30:00.000Z');
    expect(nextOpenStart(T('2026-10-12T06:00:00Z')).toISOString()).toBe('2026-10-13T02:30:00.000Z');
  });
});

describe('isDispatchable (rider pool gating, 60-min lead)', () => {
  const now = T('2026-10-12T06:00:00Z'); // 11:30 AM IST
  const iso = (utc: string) => T(utc).toISOString();
  it('shows ASAP and near-term runs', () => {
    expect(isDispatchable({ startAt: iso('2026-10-12T06:30:00Z') }, now)).toBe(true);
    expect(isDispatchable({ startAt: iso('2026-10-12T07:00:00Z') }, now)).toBe(true); // exactly 60 min
  });
  it('hides far-future scheduled runs', () => {
    expect(isDispatchable({ startAt: iso('2026-10-12T10:30:00Z') }, now)).toBe(false); // 4 PM slot
    expect(isDispatchable({ startAt: iso('2026-10-13T10:30:00Z') }, now)).toBe(false);
  });
  it('hides runs whose window already ended', () => {
    expect(
      isDispatchable({ startAt: iso('2026-10-12T00:00:00Z'), endAt: iso('2026-10-12T05:00:00Z') }, now)
    ).toBe(false);
  });
  it('keeps legacy orders without timestamps visible', () => {
    expect(isDispatchable({}, now)).toBe(true);
    expect(isDispatchable({ startAt: 'garbage' }, now)).toBe(true);
    expect(isDispatchable(null, now)).toBe(false);
  });
});
