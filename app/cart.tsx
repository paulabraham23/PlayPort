import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PriceBreakdown } from '@/components/cart/PriceBreakdown';
import { QuantitySelector } from '@/components/cart/QuantitySelector';
import { ControllerAddonRow } from '@/components/products/ControllerAddonRow';
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
import { addonsTotal, experiencePlans, isControllerAddon, normalizeProduct } from '@/utils/rentalPricing';
import type { CartItem, Experience, Product, RentalPlan } from '@/types';

function plansForCartItem(item: CartItem, products: Product[], experiences: Experience[]): RentalPlan[] {
  if (item.productId) {
    const product = products.find((p) => p.id === item.productId);
    return product ? normalizeProduct(product).plans.filter((plan) => plan.hours > 0) : [];
  }
  if (item.experienceId) {
    const experience = experiences.find((e) => e.id === item.experienceId);
    return experience ? experiencePlans(experience) : [];
  }
  return [];
}

export default function CartScreen() {
  const { horizontalPadding, useSplitPane } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const cart = useAppStore((s) => s.cart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const updateCartPlan = useAppStore((s) => s.updateCartPlan);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const products = useCatalogStore((s) => s.products);
  const experiences = useCatalogStore((s) => s.experiences);
  const hub = useCatalogStore((s) => s.hub);
  const totals = useCartTotals();

  const locationLabel =
    hub?.city && hub.city !== '—' ? hub.city : 'Your hub';

  if (!cart.length) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="My Cart" onBack={() => router.back()} />
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          subtitle="Browse kits from your hub."
          actionLabel="Browse kits"
          onAction={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  const itemsColumn = (
    <>
      <View style={styles.promise}>
        <Ionicons name="flash" size={18} color={colors.etaText} />
        <View style={{ flex: 1 }}>
          <Text style={styles.promiseTitle}>
            {hub?.etaMinutes ? `About ${hub.etaMinutes} min from the hub` : 'Delivery from your hub'}
          </Text>
          <Text style={styles.promiseSub}>{locationLabel} · Setup included</Text>
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
                  {item.unitLabel ? (
                    <Text style={styles.durationText}>{item.unitLabel}</Text>
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
                      + {item.addons!.map((a) => `${a.quantity}× ${a.name} (${formatINR(a.unitPrice)} each)`).join(', ')}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Change hours</Text>
            <Text style={styles.note}>each kit keeps its own package</Text>
          </View>
          {cart.map((item) => {
            const plans = plansForCartItem(item, products, experiences);
            if (!plans.length) return null;
            return (
              <View key={item.id} style={styles.hoursCard}>
                <Text style={styles.hoursName}>{item.name}</Text>
                <View style={styles.planRow}>
                  {plans.map((plan) => {
                    const matchedById = plans.some((option) => option.id === item.planId);
                    const selected = matchedById ? item.planId === plan.id : item.hours === plan.hours;
                    return (
                      <Pressable
                        key={plan.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() =>
                          updateCartPlan(item.id, { planId: plan.id, pricingMode: 'package' })
                        }
                        style={[styles.planChip, selected && styles.planChipOn]}
                      >
                        <Text style={[styles.planLabel, selected && styles.planLabelOn]}>{plan.label}</Text>
                        <Text style={[styles.planPrice, selected && styles.planLabelOn]}>
                          {formatINR(plan.price)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {cart.some((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product
            ? normalizeProduct(product).addons?.some((a) => isControllerAddon(a))
            : false;
        }) ? (
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Extra controllers</Text>
          <Text style={styles.note}>each kit has its own price</Text>
        </View>
        {cart.map((item) => {
          if (!item.productId) return null;
          const product = products.find((p) => p.id === item.productId);
          const addon = product
            ? normalizeProduct(product).addons?.find((a) => isControllerAddon(a))
            : undefined;
          if (!product || !addon) return null;
          const current = item.addons?.find((a) => a.id === addon.id)?.quantity ?? 0;
          const setQty = (quantity: number) => {
            const next = (item.addons ?? [])
              .filter((a) => a.id !== addon.id)
              .map((a) => ({ id: a.id, quantity: a.quantity }));
            if (quantity > 0) next.push({ id: addon.id, quantity });
            updateCartPlan(item.id, { addons: next });
          };
          return (
            <ControllerAddonRow
              key={item.id}
              productName={product.shortName || product.name}
              addon={addon}
              hours={item.hours}
              quantity={current}
              onIncrement={() => setQty(Math.min(addon.maxQuantity, current + 1))}
              onDecrement={() => setQty(Math.max(0, current - 1))}
            />
          );
        })}
      </View>
        ) : null}
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
        onBack={() => router.replace('/(tabs)' as never)}
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
  hoursCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 10,
  },
  hoursName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  planRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planChip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 88,
  },
  planChipOn: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  planLabel: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  planLabelOn: { color: colors.primaryText },
  planPrice: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 14, marginTop: 2 },
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
