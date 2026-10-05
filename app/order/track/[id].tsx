import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useNow } from '@/hooks/useNow';
import { watchOrder } from '@/lib/riderFirestore';
import { useAppStore } from '@/store/appStore';
import type { Order } from '@/types';
import { formatEtaMinutes } from '@/utils/geo';
import { formatINR, orderStatusLabel } from '@/utils/format';
import { isEnRoute, locationAgeLabel, remainingEtaMinutes } from '@/utils/liveEta';

const STEPS = ['Confirmed', 'On the way', 'With you', 'Pickup', 'Done'] as const;

function stepIndex(status: Order['status']): number {
  switch (status) {
    case 'pending_payment':
    case 'confirmed':
    case 'preparing':
      return 0;
    case 'out_for_delivery':
      return 1;
    case 'delivered':
    case 'active':
      return 2;
    case 'returning':
      return 3;
    case 'completed':
      return 4;
    default:
      return 0;
  }
}

function trackingHeadline(order: Order, now: number): { eyebrow: string; value: string } {
  const mins = remainingEtaMinutes(order, now);
  const live = mins != null && Boolean(order.riderLocationUpdatedAt);
  if (order.status === 'out_for_delivery') {
    return { eyebrow: 'Arriving in', value: live ? formatEtaMinutes(mins) : 'Getting live location…' };
  }
  if (order.status === 'returning') {
    return { eyebrow: 'Pickup in', value: live ? formatEtaMinutes(mins) : 'Getting live location…' };
  }
  if (order.status === 'delivered' || order.status === 'active') {
    return { eyebrow: 'With you', value: 'Session in progress' };
  }
  if (order.status === 'completed') {
    return { eyebrow: 'Done', value: 'Rental complete' };
  }
  if (order.status === 'pending_payment') {
    return { eyebrow: 'Payment', value: 'Waiting for payment' };
  }
  return { eyebrow: orderStatusLabel(order.status), value: order.etaLabel || 'Being prepared' };
}

export default function OrderTrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const storeOrder = useAppStore((s) => s.orders.find((o) => o.id === id));
  const [order, setOrder] = useState<Order | null>(storeOrder ?? null);
  const [resolved, setResolved] = useState(Boolean(storeOrder));

  useEffect(() => {
    if (!id) {
      setResolved(true);
      return;
    }
    const unsub = watchOrder(id, (live) => {
      setOrder(live);
      setResolved(true);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    if (storeOrder) {
      setOrder(storeOrder);
      setResolved(true);
    }
  }, [storeOrder]);

  const enRoute = order ? isEnRoute(order.status) : false;
  const now = useNow(enRoute);
  const activeStep = order ? stepIndex(order.status) : 1;
  const headline = order ? trackingHeadline(order, now) : null;
  const age = enRoute ? locationAgeLabel(order?.riderLocationUpdatedAt, now) : null;

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Delivery progress" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}>
        {order ? (
          <>
            <View style={styles.etaCard}>
              <Text style={styles.etaEyebrow}>{headline?.eyebrow}</Text>
              <Text style={styles.etaValue}>{headline?.value}</Text>
              {order.riderName ? (
                <Text style={styles.etaRider}>
                  {order.riderName}
                  {order.riderPhone ? ` · ${order.riderPhone}` : ''}
                </Text>
              ) : (
                <Text style={styles.etaRider}>Waiting for a rider to accept</Text>
              )}
              {enRoute && order.riderDistanceKm != null && order.riderDistanceKm > 0 ? (
                <Text style={styles.etaMeta}>
                  {order.etaSource === 'road' ? '' : '~'}
                  {order.riderDistanceKm} km by road
                  {order.etaSource === 'road' ? ' · live traffic' : ' · approximate'}
                </Text>
              ) : null}
              {age ? <Text style={styles.etaMeta}>{age}</Text> : null}
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.id}>#{order.id}</Text>
                <StatusBadge status={order.status} label={orderStatusLabel(order.status)} />
              </View>
              <Text style={styles.address}>{order.addressFull || order.addressLabel}</Text>
              <View style={styles.timeline}>
                {STEPS.map((step, index) => {
                  const done = index <= activeStep;
                  const current = index === activeStep;
                  return (
                    <View key={step} style={styles.step}>
                      <View
                        style={[
                          styles.stepDot,
                          done && styles.stepDotDone,
                          current && styles.stepDotCurrent,
                        ]}
                      />
                      <Text style={[styles.stepLabel, current && styles.stepLabelCurrent]}>
                        {step}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {order.deliveryOtp && order.status === 'out_for_delivery' ? (
              <View style={styles.otpCard}>
                <View style={styles.otpHeader}>
                  <Ionicons name="key-outline" size={16} color={colors.playportOrange} />
                  <Text style={styles.otpLabel}>HANDOVER CODE</Text>
                </View>
                <Text style={styles.otpValue}>
                  {String(order.deliveryOtp).replace(/\D/g, '').padEnd(4, '·').split('').join(' ')}
                </Text>
                <Text style={styles.otpHint}>
                  Read this 4-digit code to your rider — they enter it to confirm delivery & setup.
                </Text>
              </View>
            ) : null}

            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={16} color={colors.mutedText} />
              <Text style={styles.noteText}>
                We track your rider in the background to update minutes remaining. A live map is not
                shown for privacy.
              </Text>
            </View>

            <Text style={styles.section}>Order items</Text>
            {order.items?.map((item) => (
              <View key={`${item.name}-${item.price}`} style={styles.item}>
                <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.durationLabel}</Text>
                  {item.extras?.map((extra) => (
                    <Text key={extra} style={styles.itemMeta}>
                      {extra}
                    </Text>
                  ))}
                </View>
                <Text style={styles.itemPrice}>{formatINR(item.price)}</Text>
              </View>
            ))}
          </>
        ) : resolved ? (
          <EmptyState
            icon="cube-outline"
            title="Order not found"
            subtitle="This booking may have been removed or you may not have access."
            actionLabel="Back to orders"
            onAction={() => router.replace('/(tabs)/orders')}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.sub}>Loading order {id}…</Text>
          </View>
        )}

        {order ? (
          <>
            <Button
              title="View order details"
              fullWidth
              onPress={() =>
                router.push({ pathname: '/order/[id]', params: { id: order.id } })
              }
              style={{ marginTop: spacing.lg }}
            />
            <Button
              title="Back to orders"
              fullWidth
              variant="ghost"
              onPress={() => router.replace('/(tabs)/orders')}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl, gap: spacing.md },
  etaCard: {
    backgroundColor: colors.orangeTint,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.playportOrange,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  etaEyebrow: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  etaValue: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 36,
    letterSpacing: -0.8,
  },
  etaRider: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    marginTop: 4,
  },
  etaMeta: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  sub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    gap: spacing.md,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 12 },
  address: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  step: { alignItems: 'center', flex: 1, gap: 6 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
  },
  stepDotDone: { backgroundColor: colors.playportOrange },
  stepDotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
  },
  stepLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 9, textAlign: 'center' },
  stepLabelCurrent: { color: colors.primaryText },
  otpCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  otpHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  otpLabel: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 1.2,
  },
  otpValue: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 40,
    letterSpacing: 8,
  },
  otpHint: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    textAlign: 'center',
    lineHeight: 17,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  itemName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  itemMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11 },
  itemPrice: { color: colors.primaryText, fontFamily: fonts.mono, fontSize: 13 },
});
