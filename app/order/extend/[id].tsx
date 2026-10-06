import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { callExtendBooking, callGetExtensionQuote, type ExtensionQuote } from '@/lib/functions';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';
import { formatINR, formatReturnLabel } from '@/utils/format';
import { formatFunctionsError } from '@/utils/functionsError';
import { normalizeProduct, priceForHourly } from '@/utils/rentalPricing';

const OPTIONS = [1, 2, 3, 6, 12];

export function isExtendableStatus(status: string): boolean {
  return status === 'delivered' || status === 'active';
}

/** Client-side estimate mirroring the server (hourly → exact plan → pro-rated plan rate). */
function estimateForProduct(productId: string | undefined, extraHours: number, products: ReturnType<typeof useCatalogStore.getState>['products']): number {
  if (!productId) return 0;
  const raw = products.find((p) => p.id === productId);
  if (!raw) return 0;
  const p = normalizeProduct(raw);
  if (p.hourly?.enabled) return priceForHourly(p, extraHours);
  const exact = p.plans.find((x) => x.hours === extraHours);
  if (exact) return exact.price;
  const sorted = [...p.plans].filter((x) => x.price > 0).sort((a, b) => a.hours - b.hours);
  if (!sorted.length) return 0;
  const cover = sorted.find((x) => x.hours >= extraHours) ?? sorted[sorted.length - 1];
  return Math.round((cover.price / cover.hours) * extraHours);
}

export default function ExtendOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const order = useAppStore((s) => s.orders.find((o) => o.id === id));
  const applyOrderExtension = useAppStore((s) => s.applyOrderExtension);
  const products = useCatalogStore((s) => s.products);
  const showToast = useFeelStore((s) => s.showToast);

  const [hours, setHours] = useState(1);
  const [quote, setQuote] = useState<ExtensionQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const extendable =
    Boolean(order) && order!.paymentStatus === 'paid' && isExtendableStatus(order!.status);

  const estimate = useMemo(() => {
    if (!order) return 0;
    let sum = 0;
    const counts = new Map<string, number>();
    for (const it of order.items) {
      if (it.productId) counts.set(it.productId, (counts.get(it.productId) ?? 0) + 1);
    }
    for (const it of order.items) {
      const n = (it.productId && counts.get(it.productId)) || 1;
      const lines = order.items.filter((x) => x.productId === it.productId).length || 1;
      sum += (estimateForProduct(it.productId ?? undefined, hours, products) * n) / lines;
    }
    return Math.round(sum);
  }, [order, hours, products]);

  useEffect(() => {
    if (!order || !extendable) return;
    let cancelled = false;
    setQuoting(true);
    setQuoteError(null);
    callGetExtensionQuote(order.id, hours)
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch((e) => {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(formatFunctionsError(e));
        }
      })
      .finally(() => {
        if (!cancelled) setQuoting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [order?.id, order?.endAt, hours, extendable]);

  if (!order) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Extend session" onBack={() => router.back()} />
        <EmptyState
          title="Order not found"
          subtitle="This booking may have been removed."
          actionLabel="Back to orders"
          onAction={() => router.replace('/(tabs)/orders')}
        />
      </Screen>
    );
  }

  if (!extendable) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Extend session" onBack={() => router.back()} />
        <EmptyState
          icon="time-outline"
          title="Extension unavailable"
          subtitle="Only live, paid sessions (delivered or active) can be extended."
          actionLabel="View order"
          onAction={() => router.replace(`/order/${order.id}` as never)}
        />
      </Screen>
    );
  }

  const onExtend = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await callExtendBooking(order.id, hours, 'demo');
      applyOrderExtension(order.id, {
        endAt: res.newEndAt,
        subtotal: order.subtotal + (quote?.subtotal ?? 0),
        taxes: order.taxes + (quote?.taxes ?? 0),
        total: order.total + (quote?.total ?? res.extensionTotal),
        items: order.items.map((it, idx) => ({
          ...it,
          price: it.price + (quote?.perItem[idx]?.price ?? 0),
          durationLabel: `${it.durationLabel} +${hours}h ext`,
          returnLabel: `Returns ${new Date(res.newEndAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        })),
      });
      showToast(`Extended by ${hours}h`);
      router.replace(`/order/${order.id}` as never);
    } catch (e) {
      setPayError(formatFunctionsError(e));
    } finally {
      setPaying(false);
    }
  };

  const total = quote?.total ?? Math.round(estimate * 1.05);

  return (
    <Screen showHeader={false} edges={['top']} narrow>
      <ScreenHeader title="Extend session" subtitle={`#${order.id}`} onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: stickyPad },
        ]}
      >
        <Card style={styles.current} elevated>
          <View style={styles.currentRow}>
            <Ionicons name="timer-outline" size={20} color={colors.playportOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>SESSION ENDS</Text>
              <Text style={styles.currentValue}>{formatReturnLabel(order.endAt, '—')}</Text>
              {order.extensions?.length ? (
                <Text style={styles.currentMeta}>
                  Extended {order.extensions.length}× · +{order.extensions.reduce((s, e) => s + e.additionalHours, 0)}h so far
                </Text>
              ) : null}
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Add more hours</Text>
        <Text style={styles.sectionSub}>Priced from the same kit plans · availability checked live</Text>
        <View style={styles.grid}>
          {OPTIONS.map((h) => {
            const active = hours === h;
            return (
              <Pressable
                key={h}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setHours(h)}
                style={[styles.opt, active && styles.optActive]}
              >
                <Text style={[styles.optHours, active && styles.optHoursActive]}>+{h}h</Text>
                <Text style={[styles.optPrice, active && styles.optPriceActive]}>
                  ≈ {formatINR(Math.round(estimateForProduct(order.items[0]?.productId ?? undefined, h, products) || (estimate * h) / hours || 0))}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card style={styles.quote}>
          {quoting ? (
            <View style={styles.quoteRow}>
              <ActivityIndicator color={colors.playportOrange} />
              <Text style={styles.quoteMeta}>Checking availability…</Text>
            </View>
          ) : quoteError ? (
            <View style={styles.quoteCol}>
              <View style={styles.quoteRow}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text style={styles.quoteError}>{quoteError}</Text>
              </View>
              <Text style={styles.quoteMeta}>Try fewer hours — the kit may be booked next.</Text>
            </View>
          ) : quote ? (
            <View style={styles.quoteCol}>
              <View style={styles.quoteRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.quoteOk}>Available until {formatReturnLabel(quote.newEndAt)}</Text>
              </View>
              {quote.perItem.map((p) => (
                <View key={p.name} style={styles.perItem}>
                  <Text style={styles.perItemName}>{p.name}</Text>
                  <Text style={styles.perItemPrice}>{formatINR(p.price)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Extension total (incl. tax)</Text>
                <Text style={styles.totalValue}>{formatINR(quote.total)}</Text>
              </View>
            </View>
          ) : null}
        </Card>

        {payError ? <Text style={styles.payError}>{payError}</Text> : null}
      </ScrollView>

      <StickyBottomBar>
        <View style={{ flex: 1 }}>
          <Text style={styles.stickyLabel}>Extension · +{hours}h</Text>
          <Text style={styles.stickyPrice}>{quoting ? 'Checking…' : formatINR(total)}</Text>
        </View>
        <Button
          title={paying ? 'Extending…' : `Pay & extend +${hours}h`}
          fullWidth={false}
          disabled={paying || quoting || !quote}
          icon={
            paying ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
            )
          }
          onPress={() => void onExtend()}
          style={styles.extendBtn}
        />
      </StickyBottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md, paddingTop: spacing.sm },
  current: { padding: spacing.lg },
  currentRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  currentLabel: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
  },
  currentValue: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title, marginTop: 2 },
  currentMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 4 },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.headline, marginTop: spacing.sm },
  sectionSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body, marginTop: -6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opt: {
    flexGrow: 1,
    flexBasis: 100,
    minWidth: 96,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
    alignItems: 'center',
  },
  optActive: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint, borderWidth: 1.5 },
  optHours: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20 },
  optHoursActive: { color: colors.playportOrange },
  optPrice: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  optPriceActive: { color: colors.playportOrange },
  quote: { padding: spacing.lg, gap: spacing.sm },
  quoteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quoteCol: { gap: spacing.sm },
  quoteMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body },
  quoteOk: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, flex: 1 },
  quoteError: { color: colors.danger, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, flex: 1 },
  perItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perItemName: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, flex: 1 },
  perItemPrice: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  totalValue: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.headline },
  payError: { color: colors.badgeRed, fontFamily: fonts.body, fontSize: typeScale.body, textAlign: 'center' },
  stickyLabel: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  stickyPrice: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title, marginTop: 2 },
  extendBtn: { minWidth: 200 },
});
