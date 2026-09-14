import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/utils/format';

const REASONS = ['Changed plans', 'Found alternative', 'Delay', 'Other'] as const;

export default function CancelOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const orders = useAppStore((s) => s.orders);
  const cancelOrder = useAppStore((s) => s.cancelOrder);
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [otherText, setOtherText] = useState('');
  const [done, setDone] = useState(false);

  if (!order) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Cancel Order" onBack={() => router.back()} />
        <EmptyState
          icon="close-circle-outline"
          title="Order not found"
          actionLabel="Back to orders"
          onAction={() => router.replace('/(tabs)/orders')}
        />
      </Screen>
    );
  }

  if (done || order.status === 'cancelled') {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Cancelled" onBack={() => router.replace('/(tabs)/orders')} />
        <View style={[styles.successWrap, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Order cancelled</Text>
          <Text style={styles.successBody}>
            #{order.id} is cancelled. Refund of {formatINR(order.total)} will credit to{' '}
            {order.paymentMethodLabel} within 3–5 business days.
          </Text>
          <Button title="Go to orders" fullWidth onPress={() => router.replace('/(tabs)/orders')} />
        </View>
      </Screen>
    );
  }

  const canConfirm =
    reason != null && (reason !== 'Other' || otherText.trim().length > 0);

  const onConfirm = () => {
    if (!canConfirm || !id) return;
    const finalReason = reason === 'Other' ? otherText.trim() : reason!;
    cancelOrder(id, finalReason);
    setDone(true);
  };

  const first = order.items[0];

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Cancel Order" subtitle={`#${order.id}`} onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Card style={styles.summary}>
          <View style={styles.summaryTop}>
            <StatusBadge status={order.status} />
            <Text style={styles.total}>{formatINR(order.total)}</Text>
          </View>
          <View style={styles.row}>
            <Image source={{ uri: first.image }} style={styles.image} contentFit="cover" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.name} numberOfLines={2}>
                {first.name}
                {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
              </Text>
              <Text style={styles.meta}>{first.durationLabel}</Text>
              <Text style={styles.meta}>{order.addressLabel}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Why are you cancelling?</Text>
        <View style={styles.chips}>
          {REASONS.map((r) => (
            <Pressable
              key={r}
              accessibilityRole="button"
              onPress={() => setReason(r)}
              style={[styles.chip, reason === r && styles.chipActive]}
            >
              <Text style={[styles.chipText, reason === r && styles.chipTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </View>

        {reason === 'Other' ? (
          <TextInput
            value={otherText}
            onChangeText={setOtherText}
            placeholder="Tell us more…"
            placeholderTextColor={colors.mutedText}
            multiline
            style={styles.input}
          />
        ) : null}

        <Card style={styles.refund}>
          <View style={styles.refundHead}>
            <Ionicons name="wallet-outline" size={18} color={colors.playportOrange} />
            <Text style={styles.refundTitle}>Refund info</Text>
          </View>
          <Text style={styles.refundBody}>
            Free cancellation before hub dispatch. Full amount of {formatINR(order.total)} returns to{' '}
            {order.paymentMethodLabel} in 3–5 business days.
          </Text>
        </Card>

        <Button
          title="Confirm cancellation"
          variant="danger"
          fullWidth
          disabled={!canConfirm}
          onPress={onConfirm}
        />
        <Button title="Keep my order" variant="ghost" fullWidth onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  summary: { gap: spacing.md },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  image: { width: 64, height: 64, borderRadius: radii.sm },
  name: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  chipText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  chipTextActive: { color: colors.playportOrange },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  refund: { gap: spacing.sm },
  refundHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refundTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  refundBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  successIcon: { alignItems: 'center' },
  successTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 24,
    textAlign: 'center',
  },
  successBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
