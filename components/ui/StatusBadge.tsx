import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';
import { orderStatusLabel } from '@/utils/format';
import type { OrderStatus } from '@/types';

const STATUS_STYLE: Record<OrderStatus, { color: string; bg: string }> = {
  confirmed: { color: colors.info, bg: colors.infoBg },
  preparing: { color: colors.warning, bg: colors.orangeTint },
  out_for_delivery: { color: colors.playportOrange, bg: colors.orangeTint },
  delivered: { color: colors.success, bg: colors.successBg },
  active: { color: colors.playportOrange, bg: colors.orangeTint },
  returning: { color: colors.info, bg: colors.infoBg },
  completed: { color: colors.success, bg: colors.successBg },
  cancelled: { color: colors.danger, bg: colors.dangerBg },
  refunded: { color: colors.danger, bg: colors.dangerBg },
};

export function StatusBadge({ status, label }: { status: OrderStatus; label?: string }) {
  const style = STATUS_STYLE[status];
  return (
    <View style={[styles.wrap, { backgroundColor: style.bg }]}>
      <View style={[styles.dot, { backgroundColor: style.color }]} />
      <Text style={[styles.text, { color: style.color }]}>{label ?? orderStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 0.5 },
});
