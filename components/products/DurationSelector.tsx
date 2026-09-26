import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import { normalizeProduct } from '@/utils/rentalPricing';
import type { Product, PricingMode } from '@/types';

interface Props {
  product: Product;
  mode: PricingMode;
  planId: string;
  hourlyHours: number;
  onModeChange: (mode: PricingMode) => void;
  onPlanChange: (planId: string) => void;
  onHourlyHoursChange: (hours: number) => void;
}

export function DurationSelector({
  product,
  mode,
  planId,
  hourlyHours,
  onModeChange,
  onPlanChange,
  onHourlyHoursChange,
}: Props) {
  const p = normalizeProduct(product);
  const plans = p.plans;
  const hourly = p.hourly;
  const maxHours = hourly?.maxHours ?? 24;

  return (
    <View style={styles.wrap}>
      {hourly?.enabled ? (
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => onModeChange('package')}
            style={[styles.modeChip, mode === 'package' && styles.modeChipOn]}
          >
            <Text style={[styles.modeText, mode === 'package' && styles.modeTextOn]}>Packages</Text>
          </Pressable>
          <Pressable
            onPress={() => onModeChange('hourly')}
            style={[styles.modeChip, mode === 'hourly' && styles.modeChipOn]}
          >
            <Text style={[styles.modeText, mode === 'hourly' && styles.modeTextOn]}>Hourly</Text>
          </Pressable>
        </View>
      ) : null}

      {mode === 'hourly' && hourly?.enabled ? (
        <View style={styles.hourlyCard}>
          <Text style={styles.hourlyTitle}>Hourly plan</Text>
          <Text style={styles.hourlyMeta}>
            {formatINR(hourly.firstHourPrice)} first hour · {formatINR(hourly.extraHourPrice)} each
            extra
          </Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => onHourlyHoursChange(Math.max(1, hourlyHours - 1))}
              style={styles.stepBtn}
            >
              <Ionicons name="remove" size={18} color={colors.primaryText} />
            </Pressable>
            <Text style={styles.stepValue}>{hourlyHours}h</Text>
            <Pressable
              onPress={() => onHourlyHoursChange(Math.min(maxHours, hourlyHours + 1))}
              style={styles.stepBtn}
            >
              <Ionicons name="add" size={18} color={colors.primaryText} />
            </Pressable>
          </View>
          <Text style={styles.note}>Extended hourly cannot convert to package prices later.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {plans.map((d) => {
            const active = planId === d.id;
            return (
              <Pressable
                key={d.id}
                onPress={() => {
                  onModeChange('package');
                  onPlanChange(d.id);
                }}
                style={[styles.card, active && styles.cardActive]}
              >
                {d.popular ? (
                  <View style={styles.popular}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                ) : null}
                <Text style={[styles.label, active && styles.labelActive]}>{d.label}</Text>
                <Text style={[styles.price, active && styles.priceActive]}>
                  {formatINR(d.price)}
                </Text>
                <Text style={styles.hours}>{d.hours}h session</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeChipOn: {
    borderColor: colors.orangeBorder,
    backgroundColor: colors.orangeTint,
    borderWidth: 1.5,
  },
  modeText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  modeTextOn: { color: colors.playportOrange },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    flexGrow: 1,
    flexBasis: 140,
    maxWidth: '100%',
    minWidth: 120,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  cardActive: {
    borderColor: colors.orangeBorder,
    backgroundColor: colors.orangeTint,
    borderWidth: 1.5,
  },
  popular: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ctaPrimary,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  popularText: { color: colors.baseBlack, fontSize: 10, fontFamily: fonts.headingMedium },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  labelActive: { color: colors.playportOrange },
  price: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 18 },
  priceActive: { color: colors.playportOrange },
  hours: { color: colors.mutedText, fontSize: 12, fontFamily: fonts.body },
  hourlyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
  },
  hourlyTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 16 },
  hourlyMeta: { color: colors.secondaryText, fontSize: 13 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20, minWidth: 48, textAlign: 'center' },
  note: { color: colors.mutedText, fontSize: 11, fontFamily: fonts.body, marginTop: 4 },
});
