import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import { priceForAddon } from '@/utils/rentalPricing';
import type { ProductAddon } from '@/types';

interface Props {
  addon: ProductAddon;
  /** Selected session length — drives the live per-hour / flat breakdown. */
  hours: number;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

/**
 * Extra-controller row with a live pricing breakdown:
 * per-hour plans show ₹/hr × hours, package plans show the flat rate.
 */
export function ControllerAddonRow({ addon, hours, quantity, onIncrement, onDecrement }: Props) {
  const { pricing } = addon;
  const unitPrice = priceForAddon(addon, hours, 1);
  const isFlat = hours >= pricing.flatMinPlanHours;
  const isPureHourly = hours <= pricing.perHourMaxPlanHours;

  const breakdown = isFlat
    ? `${formatINR(pricing.flatPrice)} flat for the whole ${hours}h session`
    : `${formatINR(pricing.perHour)}/hr × ${hours}h = ${formatINR(unitPrice)} each`;

  const modeLabel = isFlat ? 'FLAT RATE' : 'PER HOUR';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="game-controller-outline" size={18} color={colors.playportOrange} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {addon.name}
            </Text>
            <View style={[styles.modeChip, isFlat && styles.modeChipFlat]}>
              <Text style={[styles.modeText, isFlat && styles.modeTextFlat]}>{modeLabel}</Text>
            </View>
          </View>
          <Text style={styles.breakdown}>{breakdown}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.totalLabel}>
          {quantity > 0 ? (
            <>
              {quantity} × {formatINR(unitPrice)} ={' '}
              <Text style={styles.totalValue}>{formatINR(unitPrice * quantity)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.totalValue}>{formatINR(unitPrice)}</Text> each
              {!isPureHourly && !isFlat ? ' · prorated' : ''}
            </>
          )}
        </Text>

        <View style={styles.stepper}>
          <PressableScale
            accessibilityLabel={`Remove one ${addon.name}`}
            onPress={onDecrement}
            scaleTo={0.88}
            hitSlop={6}
            style={[styles.stepBtn, quantity === 0 && styles.stepBtnDim]}
          >
            <Ionicons name="remove" size={15} color={quantity === 0 ? colors.mutedText : colors.baseBlack} />
          </PressableScale>
          <Text style={styles.stepValue}>{quantity}</Text>
          <PressableScale
            accessibilityLabel={`Add one ${addon.name}`}
            onPress={onIncrement}
            scaleTo={0.88}
            hitSlop={6}
            style={[styles.stepBtn, styles.stepBtnAdd]}
          >
            <Ionicons name="add" size={15} color={colors.baseBlack} />
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    padding: spacing.md,
    gap: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: typeScale.body, flexShrink: 1 },
  modeChip: {
    backgroundColor: colors.orangeTint,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modeChipFlat: { backgroundColor: colors.infoBg },
  modeText: {
    color: colors.playportOrange,
    fontFamily: fonts.headingMedium,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  modeTextFlat: { color: colors.info },
  breakdown: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingTop: 12,
  },
  totalLabel: {
    flex: 1,
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
  },
  totalValue: { color: colors.primaryText, fontFamily: fonts.headingMedium },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDim: { opacity: 0.55 },
  stepBtnAdd: { backgroundColor: colors.ctaPrimary },
  stepValue: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 16,
    minWidth: 18,
    textAlign: 'center',
  },
});
