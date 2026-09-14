import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AddressCard } from '@/components/address/AddressCard';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartTotals } from '@/store/appStore';
import { formatINR } from '@/utils/format';

export default function CheckoutScreen() {
  const { horizontalPadding } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const cart = useAppStore((s) => s.cart);
  const addresses = useAppStore((s) => s.addresses);
  const selectedAddressId = useAppStore((s) => s.selectedAddressId);
  const totals = useCartTotals();
  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];

  if (!cart.length) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Checkout" onBack={() => router.back()} />
        <EmptyState
          title="Nothing to checkout"
          subtitle="Add a kit to your cart first."
          actionLabel="Explore"
          onAction={() => router.replace('/(tabs)/explore')}
        />
      </Screen>
    );
  }

  const itemNames = cart.map((c) => c.name).join(' + ');

  return (
    <Screen showHeader={false} edges={['top']} narrow>
      <ScreenHeader
        title="Checkout"
        subtitle="STEP 1 OF 2"
        onBack={() => router.back()}
        right={
          <View style={styles.stepRight}>
            <View style={styles.stepDot} />
            <Text style={styles.stepMono}>REVIEW</Text>
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
        {address ? (
          <AddressCard
            address={address}
            selected
            actionLabel="Change"
            onAction={() => router.push('/address')}
            onPress={() => router.push('/address')}
          />
        ) : (
          <Button title="Add delivery address" onPress={() => router.push('/address')} fullWidth />
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery & Return Timing</Text>
          <View style={styles.timingRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.timingHeader}>
                <Text style={styles.timingLabel}>Instant Dropoff</Text>
                <Badge label="20-35 MINS" color={colors.playportOrange} backgroundColor={colors.orangeTint} />
              </View>
              <Text style={styles.timingValue}>Arriving by 7:45 PM tonight</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.timingRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timingLabel}>Automatic Return Pickup</Text>
              <Text style={styles.timingValue}>Doorstep pickup by courier</Text>
              <View style={styles.returnBox}>
                <Text style={styles.returnText}>TOMORROW, 11:00 AM</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.trustHeader}>
            <Ionicons name="shield-checkmark" size={18} color={colors.success} />
            <Text style={styles.cardTitle}>Zero Deposit Verified</Text>
            <Badge label="AADHAAR ACTIVE" color={colors.success} backgroundColor="rgba(74,222,128,0.12)" />
          </View>
          <Text style={styles.trustBody}>
            No ₹10,000 hold or card security blockage required. Pre-cleared via DigiLocker token.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.summaryHeader}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <Text style={styles.itemCount}>{totals.count} items booked</Text>
          </View>
          <Text style={styles.itemNames} numberOfLines={2}>
            {itemNames}
          </Text>
          <Text style={styles.summaryTotal}>{formatINR(totals.total)}</Text>
          <Text style={styles.taxNote}>TAXES INCLUDED</Text>
          <View style={styles.encryptRow}>
            <Ionicons name="lock-closed" size={14} color={colors.success} />
            <Text style={styles.encryptText}>
              256-Bit Bank Grade Encryption · 100% Refundable prior to dispatch
            </Text>
          </View>
        </View>
      </ScrollView>

      <StickyBottomBar>
        <View style={{ flex: 1 }}>
          <Text style={styles.stickyPrice}>{formatINR(totals.total)}</Text>
          <Text style={styles.stickyMeta}>ALL-INCLUSIVE</Text>
        </View>
        <Button
          title="Continue to Payment"
          iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
          onPress={() => router.push('/checkout/payment')}
          style={styles.cta}
        />
      </StickyBottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.lg, paddingTop: spacing.sm },
  stepRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepMono: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.playportOrange },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 10,
  },
  cardTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 16 },
  timingRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  timingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  timingLabel: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  timingValue: { color: colors.primaryText, fontFamily: fonts.body, fontSize: 14, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border },
  returnBox: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  returnText: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.5 },
  trustHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  trustBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12 },
  itemNames: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  summaryTotal: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 28, marginTop: 4 },
  taxNote: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  encryptRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  encryptText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, flex: 1, lineHeight: 17 },
  stickyPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 20 },
  stickyMeta: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  cta: { minWidth: 180 },
});
