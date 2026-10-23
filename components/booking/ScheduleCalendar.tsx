import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, typeScale } from '@/constants/theme';
import {
  calendarMonths,
  daySlots,
  formatScheduleDay,
  formatSlotTime,
  scheduleDayKey,
} from '@/utils/serviceHours';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  now: Date;
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}

/** Month calendar of bookable days, with that day's hourly dropoff slots below. */
export function ScheduleCalendar({ now, selectedIso, onSelect }: Props) {
  const months = useMemo(() => calendarMonths(now), [now]);
  const firstOpen = useMemo(
    () => months.flatMap((m) => m.cells).find((c) => c?.available) ?? null,
    [months]
  );
  const [dayKey, setDayKey] = useState<string | null>(() =>
    selectedIso ? scheduleDayKey(new Date(selectedIso)) : null
  );
  const activeCell =
    months.flatMap((m) => m.cells).find((c) => c?.available && c.key === dayKey) ?? firstOpen;
  const [monthIndex, setMonthIndex] = useState(() =>
    Math.max(
      0,
      months.findIndex((m) => m.cells.some((c) => c?.key === activeCell?.key))
    )
  );
  const month = months[monthIndex] ?? months[0];
  const slots = useMemo(
    () => (activeCell ? daySlots(activeCell.date, now) : []),
    [activeCell, now]
  );

  if (!month) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.monthRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          disabled={monthIndex === 0}
          onPress={() => setMonthIndex((i) => Math.max(0, i - 1))}
          style={[styles.monthBtn, monthIndex === 0 && styles.off]}
        >
          <Ionicons name="chevron-back" size={16} color={colors.primaryText} />
        </Pressable>
        <Text style={styles.monthLabel}>{month.label}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          disabled={monthIndex >= months.length - 1}
          onPress={() => setMonthIndex((i) => Math.min(months.length - 1, i + 1))}
          style={[styles.monthBtn, monthIndex >= months.length - 1 && styles.off]}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.primaryText} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.cell}>
            <Text style={styles.weekday}>{w}</Text>
          </View>
        ))}
        {month.cells.map((cell, i) => {
          if (!cell) return <View key={`pad${i}`} style={styles.cell} />;
          const on = cell.key === activeCell?.key;
          return (
            <View key={cell.key} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={formatScheduleDay(cell.date)}
                accessibilityState={{ selected: on, disabled: !cell.available }}
                disabled={!cell.available}
                onPress={() => setDayKey(cell.key)}
                style={[styles.day, on && styles.dayOn, cell.isToday && !on && styles.dayToday]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !cell.available && styles.dayTextOff,
                    on && styles.dayTextOn,
                  ]}
                >
                  {cell.day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {activeCell ? (
        <>
          <Text style={styles.slotsLabel}>Times on {formatScheduleDay(activeCell.date)}</Text>
          <View style={styles.slotGrid}>
            {slots.map((slot) => {
              const iso = slot.toISOString();
              const on = selectedIso === iso;
              return (
                <Pressable
                  key={iso}
                  accessibilityRole="button"
                  onPress={() => onSelect(iso)}
                  style={[styles.slotChip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{formatSlotTime(iso)}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.35 },
  monthLabel: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: typeScale.bodyLg },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  weekday: { color: colors.mutedText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption },
  day: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayOn: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  dayToday: { borderColor: colors.borderSubtle },
  dayText: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  dayTextOff: { color: colors.border },
  dayTextOn: { color: colors.primaryText, fontFamily: fonts.heading },
  slotsLabel: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  chipText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  chipTextOn: { color: colors.primaryText },
});
