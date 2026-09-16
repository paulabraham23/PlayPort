import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartTotals } from '@/store/appStore';
import { ensureLoggedIn } from '@/utils/authGate';
import { formatINR } from '@/utils/format';
import type { PaymentMethodType } from '@/types';

const PAY_ICONS: Record<PaymentMethodType, keyof typeof Ionicons.glyphMap> = {
  upi: 'phone-portrait-outline',
  card: 'card-outline',
  netbanking: 'business-outline',
  cod: 'qr-code-outline',
};

export default function PaymentScreen() {
  const { horizontalPadding } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const cart = useAppStore((s) => s.cart);
  const paymentMethods = useAppStore((s) => s.paymentMethods);
  const selectedPaymentMethodId = useAppStore((s) => s.selectedPaymentMethodId);
  const selectPaymentMethod = useAppStore((s) => s.selectPaymentMethod);
  const placeOrder = useAppStore((s) => s.placeOrder);
  const paymentError = useAppStore((s) => s.paymentError);
  const clearPaymentError = useAppStore((s) => s.clearPaymentError);
  const totals = useCartTotals();
  const [paying, setPaying] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(totals.total);

  useEffect(() => {
    if (!isAuthenticated) {
      ensureLoggedIn('/checkout/payment');
    }
  }, [isAuthenticated]);

  const pay = async (fail = false) => {
    if (!ensureLoggedIn('/checkout/payment')) return;
    setPaying(true);
    setDisplayTotal(totals.total);
    clearPaymentError();
    try {
      const result = await placeOrder(fail);
      if (result.ok && result.orderId) {
        router.replace({ pathname: '/checkout/confirmation', params: { id: result.orderId } });
        return;
      }
    } finally {
      setPaying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Payment" onBack={() => router.back()} />
        <EmptyState
          title="Log in to pay"
          subtitle="Sign in to complete your rental payment."
          actionLabel="Log in"
          onAction={() => ensureLoggedIn('/checkout/payment')}
        />
      </Screen>
    );
  }

  if (!cart.length && !paymentError && !paying) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Payment" onBack={() => router.back()} />
        <EmptyState
          title="Cart is empty"
          subtitle="Add gear before paying."
          actionLabel="Explore"
          onAction={() => router.replace('/(tabs)/explore')}
        />
      </Screen>
    );
  }

  const amount = displayTotal || totals.total || 0;

  return (
    <Screen showHeader={false} edges={['top']} narrow>
      <ScreenHeader
        title="Checkout"
        subtitle="STEP 2 OF 2"
        onBack={() => router.back()}
        right={
          <View style={styles.stepRight}>
            <View style={styles.stepDot} />
            <Text style={styles.stepMono}>PAYMENT</Text>
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: stickyPad },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.secure}>100% SECURE</Text>
        </View>

        <View style={styles.methods}>
          {paymentMethods.map((method) => {
            const selected = method.id === selectedPaymentMethodId;
            return (
              <Pressable
                key={method.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => selectPaymentMethod(method.id)}
                style={[styles.method, selected && styles.methodSelected]}
              >
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.methodTitleRow}>
                    <Text style={styles.methodLabel}>{method.label}</Text>
                    {method.recommended ? (
                      <Badge label="RECOMMENDED" color={colors.white} backgroundColor={colors.playportOrange} />
                    ) : null}
                  </View>
                  <Text style={styles.methodSub}>{method.subtitle}</Text>
                  {method.last4 ? (
                    <Text style={styles.methodMeta}>
                      {method.brand} ···· {method.last4}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name={PAY_ICONS[method.type]} size={20} color={colors.secondaryText} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order total</Text>
          <Text style={styles.summaryTotal}>{formatINR(amount)}</Text>
          <Text style={styles.summaryNote}>Taxes included · Zero deposit</Text>
        </View>

        {paymentError ? (
          <ErrorState
            title="Payment failed"
            subtitle={paymentError}
            actionLabel="Retry payment"
            onAction={() => pay(false)}
          />
        ) : null}
      </ScrollView>

      <StickyBottomBar style={styles.stickyBar}>
        <View style={styles.stickyCol}>
          <Button
            title={paying ? 'Processing…' : `Pay ${formatINR(amount)}`}
            icon={
              paying ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons name="flash" size={16} color={colors.white} />
              )
            }
            fullWidth
            disabled={paying || !cart.length}
            onPress={() => pay(false)}
          />
          {__DEV__ ? (
            <Button
              title="Simulate failure"
              variant="ghost"
              size="sm"
              disabled={paying || !cart.length}
              onPress={() => pay(true)}
              style={{ marginTop: 8 }}
            />
          ) : null}
        </View>
      </StickyBottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.lg, paddingTop: spacing.sm },
  stepRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepMono: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.playportOrange },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 18 },
  secure: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  methods: { gap: 10 },
  method: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  methodSelected: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTintStrong },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.mutedText,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOn: { borderColor: colors.playportOrange },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.playportOrange },
  methodTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  methodLabel: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  methodSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 17 },
  methodMeta: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 11, marginTop: 6 },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  summaryTitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
  summaryTotal: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 28 },
  summaryNote: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12 },
  stickyBar: { flexDirection: 'column', alignItems: 'stretch' },
  stickyCol: { width: '100%' },
});
