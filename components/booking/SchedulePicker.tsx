import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import {
  availableDays,
  daySlots,
  formatSlot,
  formatWindow,
  isServiceOpen,
  isValidScheduledStart,
} from '@/utils/serviceHours';

interface Props {
  /** Longest rental window in the booking — drives the "ends at" preview. */
  maxHours: number;
}

/**
 * Shared ASAP-vs-scheduled picker (product page + cart read/write the same
 * store slot, so both screens always agree).
 */
export function SchedulePicker({ maxHours }: Props) {
  const scheduledStartAt = useAppStore((s) => s.scheduledStartAt);
  const setScheduledStartAt = useAppStore((s) => s.setScheduledStartAt);
  const [schedMode, setSchedMode] = useState<'asap' | 'scheduled'>('asap');
  const [dayKey, setDayKey] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const open = isServiceOpen(now);
  const days = useMemo(() => availableDays(now), [now]);
  const activeDay = days.find((d) => d.key === dayKey) ?? days[0];
  const slots = useMemo(
    () => (activeDay ? daySlots(activeDay.date, now) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeDay?.key]
  );
  const scheduledValid = isValidScheduledStart(scheduledStartAt, new Date());

  return (
    <View style={styles.scheduleCard}>
      <Text style={styles.scheduleLabel}>DELIVERY TIME</Text>
      <View style={styles.modeRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!open}
          onPress={() => {
            setSchedMode('asap');
            setScheduledStartAt(null);
          }}
          style={[styles.modeChip, schedMode === 'asap' && styles.chipOn, !open && styles.chipOff]}
        >
          <Ionicons
            name="flash"
            size={14}
            color={open && schedMode === 'asap' ? colors.playportOrange : colors.secondaryText}
          />
          <Text style={[styles.chipText, schedMode === 'asap' && styles.chipTextOn]}>
            ASAP · ~45 min
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSchedMode('scheduled')}
          style={[styles.modeChip, schedMode === 'scheduled' && styles.chipOn]}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color={schedMode === 'scheduled' ? colors.playportOrange : colors.secondaryText}
          />
          <Text style={[styles.chipText, schedMode === 'scheduled' && styles.chipTextOn]}>
            Schedule
          </Text>
        </Pressable>
      </View>

      {!open ? (
        <Text style={styles.scheduleSub}>Closed 12–8 AM — pick a slot from 8 AM onwards.</Text>
      ) : null}

      {schedMode === 'scheduled' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayRow}
          >
            {days.map((d) => (
              <Pressable
                key={d.key}
                accessibilityRole="button"
                onPress={() => setDayKey(d.key)}
                style={[styles.dayChip, d.key === activeDay?.key && styles.chipOn]}
              >
                <Text style={[styles.chipText, d.key === activeDay?.key && styles.chipTextOn]}>
                  {d.label}
                </Text>
                <Text style={styles.daySub}>{d.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.slotGrid}>
            {slots.map((slot) => {
              const iso = slot.toISOString();
              const on = scheduledStartAt === iso;
              return (
                <Pressable
                  key={iso}
                  accessibilityRole="button"
                  onPress={() => setScheduledStartAt(iso)}
                  style={[styles.slotChip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {formatSlot(iso, now).split(', ')[1]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {scheduledValid && scheduledStartAt ? (
            <Text style={styles.scheduleTime}>
              {formatSlot(scheduledStartAt, now)} · {formatWindow(scheduledStartAt, maxHours)} ({maxHours}h)
            </Text>
          ) : (
            <Text style={styles.scheduleSub}>
              Pick a day and time — your {maxHours}h window ends automatically.
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.scheduleSub}>
          {open ? 'Rider heads out ~45 min after payment.' : 'ASAP resumes at 8 AM.'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 12,
  },
  scheduleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  scheduleLabel: { color: colors.mutedText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption, letterSpacing: 0.5 },
  scheduleTime: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.bodyLg, marginTop: 2 },
  scheduleSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingVertical: 10,
  },
  chipOn: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  chipOff: { opacity: 0.5 },
  chipText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  chipTextOn: { color: colors.primaryText },
  dayRow: { gap: 8, paddingRight: 4 },
  dayChip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 84,
    alignItems: 'center',
  },
  daySub: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
