import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/utils/format';

const STEPS = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pretest', label: 'Pre-Testing' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'setup', label: 'Setup' },
] as const;

const NEXT_STEPS = [
  {
    title: 'Tamper-Sealed Transit',
    body: 'Shockproof padded vaults and UV-sterilized controllers leave the dark hub sealed.',
  },
  {
    title: 'Zero-Effort Instant Setup',
    body: 'Technician plugs into HDMI 2.1 and runs a 60-second latency check.',
  },
  {
    title: 'Hassle-Free Doorstep Pickup',
    body: 'No boxing up needed — leave gear assembled for tomorrow’s return window.',
  },
];

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { horizontalPadding } = useResponsive();
  const orders = useAppStore((s) => s.orders);
  const lastOrderId = useAppStore((s) => s.lastOrderId);
  const orderId = (typeof id === 'string' && id) || lastOrderId || orders[0]?.id;
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Confirmation" onBack={() => router.replace('/(tabs)')} />
        <EmptyState
          title="Order not found"
          subtitle="We couldn’t load this confirmation."
          actionLabel="Go Home"
          onAction={() => router.replace('/(tabs)')}
        />
      </Screen>
    );
  }

  const activeStepIndex = 1; // Pre-Testing active after Confirmed

  return (
    <Screen showHeader={false} edges={['top']}>
      <ScreenHeader title="Dropoff Confirmed" onBack={() => router.replace('/(tabs)')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="checkmark" size={28} color={colors.white} />
          </View>
          <Text style={styles.heroTitle}>Dropoff Confirmed</Text>
          <Text style={styles.heroSub}>
            Your entertainment gear is being packed and pre-tested at our Indiranagar Dark Hub.
          </Text>
          <View style={styles.orderPill}>
            <Text style={styles.orderPillText}>
              <Text style={styles.orderId}>#{order.id}</Text>
              {' · Paid '}
              {formatINR(order.total)} via {order.paymentMethodLabel}
            </Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.etaRow}>
            <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.etaLabel}>ESTIMATED DROPOFF</Text>
            <Text style={styles.etaTime}>{order.etaLabel} tonight</Text>
            <View style={styles.etaPill}>
              <Text style={styles.etaPillText}>in 28 mins</Text>
            </View>
          </View>

          <View style={styles.stepper}>
            {STEPS.map((step, index) => {
              const done = index < activeStepIndex;
              const active = index === activeStepIndex;
              const lineDone = index < activeStepIndex;
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View style={styles.stepDotRow}>
                    <View
                      style={[
                        styles.stepConnector,
                        index === 0 && styles.stepConnectorHidden,
                        lineDone && index > 0 && styles.stepConnectorActive,
                      ]}
                    />
                    <View
                      style={[
                        styles.stepDot,
                        (done || active) && styles.stepDotActive,
                        done && styles.stepDotDone,
                      ]}
                    >
                      {done ? (
                        <Ionicons name="checkmark" size={12} color={colors.white} />
                      ) : active ? (
                        <View style={styles.activeInner} />
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.stepConnector,
                        index === STEPS.length - 1 && styles.stepConnectorHidden,
                        index < activeStepIndex && styles.stepConnectorActive,
                      ]}
                    />
                  </View>
                  <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={colors.playportOrange} />
            <Text style={styles.addressText}>{order.addressFull}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {order.items.length} Setup{order.items.length === 1 ? '' : 's'} Reserved
            </Text>
            <Text style={styles.monoLabel}>SANITIZED PODS</Text>
          </View>
          <View style={styles.itemList}>
            {order.items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.itemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>{formatINR(item.price)}</Text>
                  </View>
                  <Text style={styles.itemMeta}>
                    {item.durationLabel} · {item.returnLabel}
                  </Text>
                  {item.badges?.length ? (
                    <Text style={styles.itemBadge}>{item.badges.join(' · ')}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.nextHeader}>
            <Ionicons name="shield-checkmark" size={18} color={colors.playportOrange} />
            <Text style={styles.sectionTitle}>What Happens Next</Text>
          </View>
          <View style={styles.nextList}>
            {NEXT_STEPS.map((step, index) => (
              <View key={step.title} style={styles.nextRow}>
                <View style={styles.nextNum}>
                  <Text style={styles.nextNumText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextTitle}>{step.title}</Text>
                  <Text style={styles.nextBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Button
          title="Track Order"
          fullWidth
          icon={<Ionicons name="navigate" size={16} color={colors.white} />}
          onPress={() => router.push(`/order/track/${order.id}`)}
        />
        <Button
          title="Continue Exploring"
          fullWidth
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
        />

        <View style={styles.support}>
          <Ionicons name="headset-outline" size={16} color={colors.secondaryText} />
          <Text style={styles.supportText}>Questions? 24/7 Live Tech Desk available</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22, textAlign: 'center' },
  heroSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  orderPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  orderPillText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  orderId: { color: colors.orangeSoft, fontFamily: fonts.monoMedium },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 16,
  },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  etaLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
  etaTime: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14, flex: 1 },
  etaPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  etaPillText: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 10 },
  stepper: { flexDirection: 'row', alignItems: 'flex-start' },
  stepItem: { flex: 1, alignItems: 'center', gap: 8 },
  stepDotRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  stepConnectorActive: { backgroundColor: colors.playportOrange },
  stepConnectorHidden: { backgroundColor: 'transparent' },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { borderColor: colors.playportOrange, backgroundColor: '#2A1A14' },
  stepDotDone: { backgroundColor: colors.playportOrange, borderColor: colors.playportOrange },
  activeInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.playportOrange },
  stepLabel: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 11, textAlign: 'center' },
  stepLabelActive: { color: colors.playportOrange, fontFamily: fonts.bodyMedium },
  addressRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  addressText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, flex: 1, lineHeight: 18 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 17 },
  monoLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  itemList: { gap: 10 },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  itemImage: { width: 56, height: 56, borderRadius: radii.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  itemName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14, flex: 1 },
  itemPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 14 },
  itemMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  itemBadge: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextList: { gap: 14 },
  nextRow: { flexDirection: 'row', gap: 12 },
  nextNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A1A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextNumText: { color: colors.playportOrange, fontFamily: fonts.monoMedium, fontSize: 12 },
  nextTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  nextBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 17 },
  support: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  supportText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
});
