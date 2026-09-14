import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PriceBreakdown } from '@/components/cart/PriceBreakdown';
import { QuantitySelector } from '@/components/cart/QuantitySelector';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { DURATIONS, LOCATION_LABEL, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartTotals } from '@/store/appStore';
import { formatINR } from '@/utils/format';
import type { CartItem, RentalDurationId } from '@/types';

const UPSELLS = [
  {
    id: 'screen-addon',
    title: '100" Pull-Up Screen',
    subtitle: 'Anti-light cinema upgrade',
    priceLabel: '+₹329',
  },
  {
    id: 'jbl-partybox',
    title: 'PartyBox Boost',
    subtitle: 'Extra bass for the room',
    priceLabel: '+₹1,199',
  },
];

export default function CartScreen() {
  const { horizontalPadding } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const cart = useAppStore((s) => s.cart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const updateCartDuration = useAppStore((s) => s.updateCartDuration);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const totals = useCartTotals();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  if (!cart.length) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="My Cart" onBack={() => router.back()} />
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          subtitle="Browse gaming kits, projectors, and party gear near you — dropoff in ~30 mins."
          actionLabel="Explore Tonight"
          onAction={() => router.push('/(tabs)/explore')}
        />
      </Screen>
    );
  }

  return (
    <Screen showHeader={false} edges={['top']}>
      <ScreenHeader
        title="My Entertainment Cart"
        subtitle={`${totals.count} PREMIUM ITEM${totals.count === 1 ? '' : 'S'}`}
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: stickyPad },
        ]}
      >
        <View style={styles.promise}>
          <Ionicons name="flash" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.promiseTitle}>30–35 Min Express Drop</Text>
            <Text style={styles.promiseSub}>
              {LOCATION_LABEL} · Free sanitization & live setup included
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {cart.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                <View style={styles.itemBody}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove item"
                      onPress={() => removeFromCart(item.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.secondaryText} />
                    </Pressable>
                  </View>
                  <Text style={styles.category}>{item.categoryLabel}</Text>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                    <Text style={styles.durationText}>{item.durationLabel}</Text>
                    {item.productId ? (
                      <Pressable onPress={() => setEditingItem(item)}>
                        <Text style={styles.edit}>Edit</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>{formatINR(item.unitPrice * item.quantity)}</Text>
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(n) => updateCartQuantity(item.id, n)}
                    />
                  </View>
                  {item.includesNote ? (
                    <Text style={styles.note} numberOfLines={2}>
                      {item.includesNote}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Amp Up Your Session</Text>
            <Ionicons name="sparkles" size={14} color={colors.playportOrange} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.upsellRow}>
            {UPSELLS.map((upsell) => {
              const product = PRODUCTS.find((p) => p.id === upsell.id);
              if (!product) return null;
              const already = cart.some((c) => c.productId === upsell.id);
              return (
                <View key={upsell.id} style={styles.upsellCard}>
                  <Image source={{ uri: product.images[0] }} style={styles.upsellImage} contentFit="cover" />
                  <Text style={styles.upsellPrice}>{upsell.priceLabel}</Text>
                  <Text style={styles.upsellTitle}>{upsell.title}</Text>
                  <Text style={styles.upsellSub}>{upsell.subtitle}</Text>
                  <Button
                    title={already ? 'Added' : '+ Add Extra'}
                    size="sm"
                    variant="secondary"
                    disabled={already}
                    onPress={() => addProductToCart(upsell.id, '12h')}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Handover Schedule</Text>
            <View style={styles.doorBadge}>
              <Text style={styles.doorText}>DOORSTEP WHITE-GLOVE</Text>
            </View>
          </View>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <View style={[styles.dot, { backgroundColor: colors.playportOrange }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleLabel}>Dropoff</Text>
                <Text style={styles.scheduleTime}>Tonight, 7:30 PM</Text>
                <Text style={styles.scheduleSub}>Technician unboxing + HDMI verification</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>in 32 min</Text>
              </View>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleRow}>
              <View style={[styles.dot, { backgroundColor: colors.mutedText }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleLabel}>Return</Text>
                <Text style={styles.scheduleTime}>Tomorrow, 11:00 AM</Text>
                <Text style={styles.scheduleSub}>Professional packing by the technician</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Hassle-free</Text>
              </View>
            </View>
            <View style={styles.guarantee}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.guaranteeText}>
                Technician Test Guarantee — sign-off after live sync check.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transparent Bill Details</Text>
          <View style={styles.billCard}>
            <PriceBreakdown
              itemsTotal={totals.itemsTotal}
              taxes={totals.taxes}
              total={totals.total}
              deposit={0}
            />
          </View>
        </View>
      </ScrollView>

      <StickyBottomBar>
        <View style={{ flex: 1 }}>
          <Text style={styles.finalLabel}>FINAL AMOUNT</Text>
          <Text style={styles.finalPrice}>
            {formatINR(totals.total)} · {totals.count} Item{totals.count === 1 ? '' : 's'}
          </Text>
        </View>
        <Button
          title="Proceed to Pay"
          iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
          onPress={() => router.push('/checkout')}
          style={styles.payBtn}
        />
      </StickyBottomBar>

      <Modal visible={!!editingItem} transparent animationType="fade" onRequestClose={() => setEditingItem(null)}>
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={StyleSheet.absoluteFill}
            onPress={() => setEditingItem(null)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select duration</Text>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                style={[
                  styles.durationOption,
                  editingItem?.durationId === d.id && styles.durationSelected,
                ]}
                onPress={() => {
                  if (editingItem) {
                    updateCartDuration(editingItem.id, d.id as RentalDurationId);
                    setEditingItem(null);
                  }
                }}
              >
                <Text style={styles.durationOptionText}>{d.label}</Text>
                <Text style={styles.durationOptionDesc}>{d.description}</Text>
              </Pressable>
            ))}
            <Button
              title="Done"
              variant="ghost"
              onPress={() => setEditingItem(null)}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xl, paddingTop: spacing.sm },
  promise: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  promiseTitle: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 14 },
  promiseSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  list: { gap: spacing.md },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  itemTop: { flexDirection: 'row', gap: 12 },
  itemImage: { width: 72, height: 72, borderRadius: radii.sm },
  itemBody: { flex: 1, gap: 4 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  itemTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14, flex: 1 },
  category: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  durationText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, flex: 1 },
  edit: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  itemPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 16 },
  note: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 11, marginTop: 4 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 17 },
  upsellRow: { gap: 10 },
  upsellCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  upsellImage: { width: '100%', height: 80, borderRadius: radii.sm },
  upsellPrice: { color: colors.playportOrange, fontFamily: fonts.monoMedium, fontSize: 12 },
  upsellTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  upsellSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11, marginBottom: 4 },
  doorBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doorText: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 9, letterSpacing: 0.5 },
  scheduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 12,
  },
  scheduleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  scheduleLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
  scheduleTime: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15, marginTop: 2 },
  scheduleSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  scheduleDivider: { height: 1, backgroundColor: colors.border },
  pill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 10 },
  guarantee: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  guaranteeText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, flex: 1, lineHeight: 17 },
  billCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  finalLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  finalPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 15, marginTop: 2 },
  payBtn: { minWidth: 150 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    gap: 10,
  },
  modalTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 18, marginBottom: 4 },
  durationOption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationSelected: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTintStrong },
  durationOptionText: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  durationOptionDesc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
});
