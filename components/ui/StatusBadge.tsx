import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';
import { orderStatusLabel } from '@/utils/format';
import type { OrderStatus } from '@/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  confirmed: colors.info,
  preparing: colors.warning,
  out_for_delivery: colors.playportOrange,
  delivered: colors.success,
  active: colors.playportOrange,
  returning: colors.info,
  completed: colors.success,
  cancelled: colors.danger,
  refunded: colors.danger,
};

export function StatusBadge({ status, label }: { status: OrderStatus; label?: string }) {
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.wrap, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label ?? orderStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 0.5 },
});
