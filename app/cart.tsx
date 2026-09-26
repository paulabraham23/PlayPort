import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PriceBreakdown } from '@/components/cart/PriceBreakdown';
import { QuantitySelector } from '@/components/cart/QuantitySelector';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartTotals } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { ensureLoggedIn } from '@/utils/authGate';
import { formatINR } from '@/utils/format';
import { addonsTotal, cheapestPlanPrice, normalizeProduct } from '@/utils/rentalPricing';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const { horizontalPadding, useSplitPane, isDesktop, gap } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const cart = useAppStore((s) => s.cart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const updateCartPlan = useAppStore((s) => s.updateCartPlan);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const products = useCatalogStore((s) => s.products);
  const hub = useCatalogStore((s) => s.hub);
  const totals = useCartTotals();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const upsells = products
    .filter((p) => !cart.some((c) => c.productId === p.id))
    .slice(0, 2)
    .map((p) => {
      const from = cheapestPlanPrice(normalizeProduct(p)) ?? 0;
      return {
        id: p.id,
        title: p.shortName,
        subtitle: p.availabilityLabel || 'Add-on',
        priceLabel: `+${formatINR(from)}`,
      };
    });

  const locationLabel =
    hub?.city && hub.city !== '—' ? hub.city : 'Your hub';

  if (!cart.length) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="My Cart" onBack={() => router.back()} />
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          subtitle="Browse gaming kits, projectors, and party gear near you — dropoff in ~30 mins."
          actionLabel="Explore Tonight"
          onAction={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  const upsellCards = upsells.map((upsell) => {
    const product = products.find((p) => p.id === upsell.id);
    if (!product) return null;
    const already = cart.some((c) => c.productId === upsell.id);
    return (
      <View key={upsell.id} style={[styles.upsellCard, !isDesktop && styles.upsellCardMobile]}>
        <Image source={{ uri: product.images[0] }} style={styles.upsellImage} contentFit="cover" />
        <Text style={styles.upsellPrice}>{upsell.priceLabel}</Text>
        <Text style={styles.upsellTitle}>{upsell.title}</Text>
        <Text style={styles.upsellSub}>{upsell.subtitle}</Text>
        <Button
          title={already ? 'Added' : '+ Add Extra'}
          size="sm"
          variant="secondary"
          disabled={already}
          onPress={() => {
            if (!ensureLoggedIn('/cart')) return;
            addProductToCart(upsell.id);
          }}
        />
      </View>
    );
  }).filter(Boolean);

  const itemsColumn = (
    <>
      <View style={styles.promise}>
        <Ionicons name="flash" size={18} color={colors.etaText} />
        <View style={{ flex: 1 }}>
          <Text style={styles.promiseTitle}>30–35 Min Express Drop</Text>
          <Text style={styles.promiseSub}>
            {locationLabel} · Free sanitization & live setup included
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
                  <Text style={styles.itemPrice}>
                    {formatINR(
                      (item.unitPrice + (item.addonsTotal ?? addonsTotal(item.addons))) * item.quantity
                    )}
                  </Text>
                  {(item.addons?.length ?? 0) > 0 ? (
                    <Text style={styles.note}>
                      + {item.addons!.map((a) => `${a.quantity}× ${a.name}`).join(', ')}
                    </Text>
                  ) : null}
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
        {upsells.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Amp Up Your Session</Text>
              <Ionicons name="sparkles" size={14} color={colors.playportOrange} />
            </View>
            {isDesktop ? (
              <ResponsiveGrid columns={Math.min(3, Math.max(1, upsells.length))} gap={gap}>
                {upsellCards}
              </ResponsiveGrid>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.upsellRow}
              >
                {upsellCards}
              </ScrollView>
            )}
          </>
        ) : null}
      </View>
    </>
  );

  const sideColumn = (
    <>
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
    </>
  );

  return (
    <Screen showHeader={false} edges={['top']}>
      <ScreenHeader
        title="Cart"
        subtitle={`${totals.count} item${totals.count === 1 ? '' : 's'}`}
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: stickyPad },
        ]}
      >
        {useSplitPane ? (
          <View style={styles.splitRow}>
            <View style={styles.splitMain}>{itemsColumn}</View>
            <View style={styles.splitSide}>{sideColumn}</View>
          </View>
        ) : (
          <>
            {itemsColumn}
            {sideColumn}
          </>
        )}
      </ScrollView>

      <StickyBottomBar>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Text style={styles.finalLabel}>FINAL AMOUNT</Text>
          <Text style={styles.finalPrice}>
            {formatINR(totals.total)} · {totals.count} Item{totals.count === 1 ? '' : 's'}
          </Text>
        </View>
        <Button
          title="Proceed to Pay"
          iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
          onPress={() => {
            if (!ensureLoggedIn('/checkout')) return;
            router.push('/checkout');
          }}
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
            <Text style={styles.modalTitle}>Select plan</Text>
            {(() => {
              const product = editingItem?.productId
                ? products.find((p) => p.id === editingItem.productId)
                : undefined;
              const plans = product ? normalizeProduct(product).plans : [];
              return plans.map((d) => (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                style={[
                  styles.durationOption,
                  editingItem?.planId === d.id && styles.durationSelected,
                ]}
                onPress={() => {
                  if (editingItem) {
                    updateCartPlan(editingItem.id, { planId: d.id, pricingMode: 'package' });
                    setEditingItem(null);
                  }
                }}
              >
                <Text style={styles.durationOptionText}>{d.label}</Text>
                <Text style={styles.durationOptionDesc}>{formatINR(d.price)} · {d.hours}h</Text>
              </Pressable>
              ));
            })()}
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
  splitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  splitMain: { flex: 1.4, gap: spacing.xl, minWidth: 280, flexGrow: 1 },
  splitSide: { flex: 1, gap: spacing.xl, minWidth: 260, maxWidth: 400, flexGrow: 1 },
  promise: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.etaBg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74,222,128,0.25)',
    padding: spacing.lg,
  },
  promiseTitle: { color: colors.etaText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  promiseSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
  list: { gap: spacing.md },
  itemCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    ...shadows.soft,
  },
  itemTop: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  itemImage: { width: 72, height: 72, borderRadius: radii.sm },
  itemBody: { flex: 1, gap: 4, minWidth: 180 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  itemTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, flex: 1 },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  durationText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, flex: 1 },
  edit: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  itemPrice: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title },
  note: { color: colors.mutedText, fontFamily: fonts.body, fontSize: typeScale.caption, marginTop: 4 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title },
  upsellRow: { gap: 10 },
  upsellCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 6,
  },
  upsellCardMobile: { width: 160 },
  upsellImage: { width: '100%', height: 80, borderRadius: radii.sm },
  upsellPrice: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  upsellTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  upsellSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.caption, marginBottom: 4 },
  doorBadge: {
    backgroundColor: colors.orangeTint,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doorText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 0.5 },
  scheduleCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 12,
  },
  scheduleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  scheduleLabel: { color: colors.mutedText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption, letterSpacing: 0.5 },
  scheduleTime: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.bodyLg, marginTop: 2 },
  scheduleSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
  scheduleDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderSubtle },
  pill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption },
  guarantee: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  guaranteeText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, flex: 1, lineHeight: 17 },
  billCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  finalLabel: { color: colors.mutedText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption, letterSpacing: 0.6 },
  finalPrice: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.bodyLg, marginTop: 2 },
  payBtn: { minWidth: 150 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    gap: 10,
    width: '100%',
    maxWidth: 520,
  },
  modalTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.headline, marginBottom: 4 },
  durationOption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  durationSelected: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTintStrong },
  durationOptionText: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  durationOptionDesc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
});
