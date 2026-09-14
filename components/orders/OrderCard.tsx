import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import type { Order } from '@/types';

interface Props {
  order: Order;
  onPress?: () => void;
  onTrack?: () => void;
  onRentAgain?: () => void;
}

export function OrderCard({ order, onPress, onTrack, onRentAgain }: Props) {
  const first = order.items[0];
  const isActive = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'active', 'returning'].includes(
    order.status
  );

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Order ${order.id}`} onPress={onPress}>
        <View style={styles.header}>
          <Text style={styles.id}>#{order.id}</Text>
          <StatusBadge status={order.status} />
        </View>
        <View style={styles.row}>
          <Image source={{ uri: first.image }} style={styles.image} contentFit="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name} numberOfLines={2}>
              {first.name}
              {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
            </Text>
            <Text style={styles.meta}>{first.durationLabel}</Text>
            <Text style={styles.price}>{formatINR(order.total)}</Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.actions}>
        {isActive ? (
          <>
            <Button title="View Details" variant="secondary" size="sm" onPress={onPress} style={{ flex: 1 }} />
            <Button title="Track Order" size="sm" onPress={onTrack ?? onPress} style={{ flex: 1 }} />
          </>
        ) : (
          <Button title="Rent Again" variant="secondary" size="sm" onPress={onRentAgain ?? onPress} fullWidth />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 12 },
  row: { flexDirection: 'row', gap: 12, marginTop: spacing.xs },
  image: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  name: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  price: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 15 },
  actions: { flexDirection: 'row', gap: 8, marginTop: spacing.xs },
});
