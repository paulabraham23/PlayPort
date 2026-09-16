import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
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
            <Button title="Details" variant="secondary" size="sm" onPress={onPress} style={{ flex: 1 }} />
            <Button title="Track" size="sm" onPress={onTrack ?? onPress} style={{ flex: 1 }} />
          </>
        ) : (
          <Button title="Rent again" variant="secondary" size="sm" onPress={onRentAgain ?? onPress} fullWidth />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { color: colors.mutedText, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  row: { flexDirection: 'row', gap: 12, marginTop: spacing.xs },
  image: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  name: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.bodyLg },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  price: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: spacing.xs },
});
