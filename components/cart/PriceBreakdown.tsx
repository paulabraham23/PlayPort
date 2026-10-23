import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';

interface Props {
  itemsTotal: number;
  taxes: number;
  total: number;
  sanitizationFree?: boolean;
  /** Delivery for the chosen address; null = not worked out yet. */
  delivery?: { fee: number; km?: number } | null;
  /** Shown under the delivery row when there's no figure yet. */
  deliveryNote?: string;
  deposit?: number;
}

export function PriceBreakdown({
  itemsTotal,
  taxes,
  total,
  sanitizationFree = true,
  delivery = null,
  deliveryNote,
  deposit = 0,
}: Props) {
  const deliveryValue = !delivery ? '—' : delivery.fee > 0 ? formatINR(delivery.fee) : 'FREE';
  const deliverySub = delivery
    ? delivery.km != null
      ? delivery.fee > 0
        ? `${delivery.km} km from hub · covers drop-off and pickup trips`
        : `${delivery.km} km from hub · free within 5 km`
      : undefined
    : deliveryNote;
  return (
    <View style={styles.wrap}>
      <Row label="Items Total" value={formatINR(itemsTotal)} />
      <Row
        label="Sanitization & Cable Kit"
        value={sanitizationFree ? 'FREE' : formatINR(150)}
        valueColor={sanitizationFree ? colors.playportOrange : colors.primaryText}
      />
      <Row
        label="Delivery, Setup & Pickup"
        sub={deliverySub}
        value={deliveryValue}
        valueColor={delivery && delivery.fee === 0 ? colors.playportOrange : colors.primaryText}
      />
      {deposit > 0 ? (
        <Row label="Refundable Security Deposit" value={formatINR(deposit)} />
      ) : null}
      <Row label="Government Taxes" value={formatINR(taxes)} />
      <View style={styles.divider} />
      <Row label="Total Payable" value={formatINR(total)} strong valueColor={colors.playportOrange} />
      <Text style={styles.note}>Taxes included · no hidden fees</Text>
    </View>
  );
}

function Row({
  label,
  sub,
  value,
  strong,
  valueColor,
}: {
  label: string;
  sub?: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <Text style={[styles.value, strong && styles.strong, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  labelCol: { flex: 1, minWidth: 0 },
  label: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14 },
  sub: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  value: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  strong: { fontFamily: fonts.heading, fontSize: 18, color: colors.primaryText },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderSubtle, marginVertical: 4 },
  note: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
});
