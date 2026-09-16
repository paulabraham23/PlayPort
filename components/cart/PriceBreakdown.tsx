import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';

interface Props {
  itemsTotal: number;
  taxes: number;
  total: number;
  sanitizationFree?: boolean;
  deliveryFree?: boolean;
  deposit?: number;
}

export function PriceBreakdown({
  itemsTotal,
  taxes,
  total,
  sanitizationFree = true,
  deliveryFree = true,
  deposit = 0,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Row label="Items Total" value={formatINR(itemsTotal)} />
      <Row
        label="Sanitization & Cable Kit"
        value={sanitizationFree ? 'FREE' : formatINR(150)}
        valueColor={sanitizationFree ? colors.playportOrange : colors.primaryText}
        strike={!sanitizationFree ? undefined : formatINR(150)}
      />
      <Row
        label="Express Delivery & Live Setup"
        value={deliveryFree ? 'FREE' : formatINR(99)}
        valueColor={deliveryFree ? colors.playportOrange : colors.primaryText}
      />
      <Row label="Refundable Security Deposit" value={formatINR(deposit)} />
      <Row label="Government Taxes" value={formatINR(taxes)} />
      <View style={styles.divider} />
      <Row label="Total Payable" value={formatINR(total)} strong valueColor={colors.playportOrange} />
      <Text style={styles.note}>No hidden rental deposits</Text>
    </View>
  );
}

function Row({
  label,
  value,
  strong,
  valueColor,
  strike,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
  strike?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
      <View style={styles.valueWrap}>
        {strike ? <Text style={styles.strike}>{strike}</Text> : null}
        <Text style={[styles.value, strong && styles.strong, valueColor ? { color: valueColor } : null]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14 },
  value: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  strong: { fontFamily: fonts.heading, fontSize: 18, color: colors.primaryText },
  valueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strike: {
    color: colors.mutedText,
    textDecorationLine: 'line-through',
    fontFamily: fonts.body,
    fontSize: 12,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderSubtle, marginVertical: 4 },
  note: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
});
