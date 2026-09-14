import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/utils/format';

const STEPS = ['Confirmed', 'Pre-Testing', 'Dispatch', 'Setup'] as const;

export default function OrderTrackComingSoonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const order = useAppStore((s) => s.orders.find((o) => o.id === id));

  const activeStep =
    order?.status === 'confirmed'
      ? 0
      : order?.status === 'preparing'
        ? 1
        : order?.status === 'out_for_delivery'
          ? 2
          : order?.status === 'delivered' || order?.status === 'active'
            ? 3
            : 1;

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Live Tracking" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.hero}>
          <View style={styles.icon}>
            <Ionicons name="navigate-circle-outline" size={36} color={colors.playportOrange} />
          </View>
          <Badge label="COMING SOON" color={colors.playportOrange} backgroundColor="#2A1A14" />
          <Text style={styles.title}>Live map tracking is on the way</Text>
          <Text style={styles.sub}>
            Real-time rider location isn&apos;t available yet. You can still follow order status, ETA, and
            delivery details below — no fake map required.
          </Text>
        </View>

        {order ? (
          <>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.id}>#{order.id}</Text>
                <StatusBadge status={order.status} />
              </View>
              <Text style={styles.eta}>Est. dropoff {order.etaLabel}</Text>
              <Text style={styles.address}>{order.addressFull}</Text>
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
                      <Text style={[styles.stepLabel, current && styles.stepLabelCurrent]}>{step}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.section}>Order items</Text>
            {order.items.map((item) => (
              <View key={`${item.name}-${item.price}`} style={styles.item}>
                <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.durationLabel}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatINR(item.price)}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sub}>Order {id} details will appear here when available.</Text>
          </View>
        )}

        <Button
          title="View order details"
          fullWidth
          onPress={() => router.push({ pathname: '/order/[id]', params: { id: order?.id ?? id } })}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          title="Contact support"
          fullWidth
          variant="secondary"
          onPress={() => router.push('/profile/help')}
          style={{ marginTop: spacing.sm }}
        />
        <Button
          title="Back to orders"
          fullWidth
          variant="ghost"
          onPress={() => router.replace('/(tabs)/orders')}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl, gap: spacing.md },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2A1A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20, textAlign: 'center' },
  sub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 10,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 12 },
  eta: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 16 },
  address: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
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
    borderColor: '#FFB199',
  },
  stepLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 9, textAlign: 'center' },
  stepLabelCurrent: { color: colors.playportOrange },
  section: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 16, marginTop: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  thumb: { width: 48, height: 48, borderRadius: radii.sm },
  itemName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  itemMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  itemPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 13 },
});
