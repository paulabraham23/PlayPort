/** Service-hours + scheduling rules (IST). Open 8 AM – midnight, closed 12–8 AM. */

export const SERVICE_OPEN_HOUR = 8;
export const SERVICE_CLOSE_HOUR = 24; // midnight
export const SCHEDULE_LEAD_MINUTES = 45;
export const MAX_ADVANCE_DAYS = 7;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istDate(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

export function istHour(date: Date): number {
  return istDate(date).getUTCHours();
}

/** True when dropoffs are running right now (8:00 AM – 12:00 AM IST). */
export function isServiceOpen(now = new Date()): boolean {
  const h = istHour(now);
  return h >= SERVICE_OPEN_HOUR && h < SERVICE_CLOSE_HOUR;
}

export function asapStart(now = new Date()): Date {
  return new Date(now.getTime() + SCHEDULE_LEAD_MINUTES * 60 * 1000);
}

/** Start-of-day (IST) for the given date's IST calendar day. */
function istDayStart(date: Date): Date {
  const d = istDate(date);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - IST_OFFSET_MS);
}

export interface ScheduleDay {
  key: string;
  label: string;
  sub: string;
  date: Date;
}

const dayFmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** Today (+ remaining slots) through +6 days. */
export function availableDays(now = new Date()): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  for (let i = 0; i < MAX_ADVANCE_DAYS; i++) {
    const base = new Date(istDayStart(now).getTime() + i * 24 * 60 * 60 * 1000);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayFmt.format(base).split(',')[0];
    days.push({
      key: base.toISOString(),
      label,
      sub: dayFmt.format(base),
      date: base,
    });
  }
  return days.filter((d, i) => (i === 0 ? daySlots(d.date, now).length > 0 : true));
}

const timeFmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** Hourly dropoff slots 8 AM – 11 PM IST for a day; today filters past + lead time. */
export function daySlots(dayStart: Date, now = new Date()): Date[] {
  const slots: Date[] = [];
  const minStart = now.getTime() + SCHEDULE_LEAD_MINUTES * 60 * 1000;
  for (let h = SERVICE_OPEN_HOUR; h < SERVICE_CLOSE_HOUR; h++) {
    const slot = new Date(dayStart.getTime() + h * 60 * 60 * 1000);
    if (slot.getTime() < minStart) continue;
    slots.push(slot);
  }
  return slots;
}

/** A scheduled start is valid when: in the future (+lead), inside 8 AM–12 AM IST, within 7 days. */
export function isValidScheduledStart(iso: string | null | undefined, now = new Date()): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  if (t < now.getTime() + SCHEDULE_LEAD_MINUTES * 60 * 1000) return false;
  const h = istHour(new Date(t));
  if (h < SERVICE_OPEN_HOUR || h >= SERVICE_CLOSE_HOUR) return false;
  if (t > now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000) return false;
  return true;
}

const dayTimeFmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const shortTimeFmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  hour12: true,
});

/** "Today, 4:00 PM" */
export function formatSlot(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const sameDay = istDayStart(d).getTime() === istDayStart(now).getTime();
  const tomorrow =
    istDayStart(d).getTime() === istDayStart(now).getTime() + 24 * 60 * 60 * 1000;
  const prefix = sameDay ? 'Today' : tomorrow ? 'Tomorrow' : dayFmt.format(d);
  return `${prefix}, ${timeFmt.format(d)}`;
}

/** "4 PM – 4 AM" window for a start + duration. */
export function formatWindow(startIso: string, hours: number): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return `${shortTimeFmt.format(start)} – ${shortTimeFmt.format(end)}`;
}

/** Next opening time (8 AM IST) when currently closed. */
export function nextOpenStart(now = new Date()): Date {
  const dayStart = istDayStart(now);
  const eightAm = new Date(dayStart.getTime() + SERVICE_OPEN_HOUR * 60 * 60 * 1000);
  return eightAm.getTime() > now.getTime()
    ? eightAm
    : new Date(eightAm.getTime() + 24 * 60 * 60 * 1000);
}

export { dayTimeFmt };
