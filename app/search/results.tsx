import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { formatINR, searchProducts } from '@/utils/format';

export default function SearchResultsScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const initial = typeof q === 'string' ? q : '';
  const [query, setQuery] = useState(initial);
  const { horizontalPadding, productColumns, gap } = useResponsive();
  const pushRecentSearch = useAppStore((s) => s.pushRecentSearch);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);

  const results = useMemo(() => searchProducts(query, PRODUCTS), [query]);
  const isProjectorSearch = /projector|movie|cinema|lifelong/i.test(query);
  const featured =
    isProjectorSearch
      ? PRODUCTS.find((p) => p.id === 'lifelong-projector') ?? results[0]
      : results[0];
  const listProducts = results.filter((p) => p.id !== featured?.id);
  const setupsReady = results.length || 0;

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);
  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    pushRecentSearch(trimmed);
    setQuery(trimmed);
    router.setParams({ q: trimmed });
  };

  return (
    <Screen showHeader showCart>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <SearchBar
          value={query}
          onChangeText={setQuery}
          showBack
          onBack={() => router.back()}
          onSubmit={() => submit(query)}
          onClear={() => setQuery('')}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <View style={[styles.filterChip, styles.filterActive]}>
            <Ionicons name="checkmark" size={14} color={colors.playportOrange} />
            <Text style={styles.filterActiveText}>Filters (1)</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>Sort: Fastest Drop</Text>
            <Ionicons name="chevron-down" size={14} color={colors.secondaryText} />
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterText}>Under ₹1500</Text>
          </View>
        </ScrollView>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.hubStatus}>{setupsReady} setups ready in your hub</Text>
          </View>
          <View style={styles.dropBadge}>
            <Ionicons name="flash" size={11} color={colors.etaText} />
            <Text style={styles.dropBadgeText}>30-35M DROPOFF</Text>
          </View>
        </View>
        {!results.length ? (
          <EmptyState
            icon="search-outline"
            title="No kits matched"
            subtitle={`Nothing found for "${query}". Try PS5, projector, or karaoke.`}
            actionLabel="Clear search"
            onAction={() => {
              setQuery('');
              router.replace('/search');
            }}
          />
        ) : (
          <>
            {featured ? (
              <View style={styles.featured}>
                <View style={styles.featuredBadges}>
                  <Badge label={featured.badge ?? 'FEATURED'} />
                  <View style={styles.featuredMeta}>
                    <Badge
                      label={`${featured.etaMinutes} MIN DROP`}
                      color={colors.secondaryText}
                      left={<Ionicons name="time-outline" size={12} color={colors.secondaryText} />}
                    />
                    <Badge label={`★ ${featured.rating} (${featured.reviewCount}+)`} />
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/product/${featured.id}`)}
                  style={styles.featuredImageWrap}
                >
                  <Image source={{ uri: featured.images[0] }} style={styles.featuredImage} contentFit="cover" />
                </Pressable>
                <View style={styles.tagRow}>
                  {featured.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} label={tag} color={colors.primaryText} backgroundColor="rgba(0,0,0,0.55)" />
                  ))}
                </View>
                <Text style={styles.featuredTitle}>{featured.name}</Text>
                <Text style={styles.featuredDesc}>{featured.description}</Text>
                <View style={styles.featuredFooter}>
                  <View>
                    <Text style={styles.featuredPrice}>
                      {formatINR(featured.priceByDuration['12h'])} / night
                    </Text>
                    {featured.compareAtPrice ? (
                      <Text style={styles.strike}>{formatINR(featured.compareAtPrice)}</Text>
                    ) : null}
                  </View>
                  <Button
                    title="Add to cart"
                    onPress={() => addProductToCart(featured.id, '12h')}
                  />
                </View>
              </View>
            ) : null}

            <ResponsiveGrid columns={productColumns} gap={gap}>
              {listProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact={productColumns === 1}
                  quantityInCart={qtyFor(product.id)}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onAdd={() => addProductToCart(product.id, '12h')}
                  onIncrement={() => addProductToCart(product.id, '12h')}
                  onDecrement={() => {
                    const cartId = cartItemIdFor(product.id);
                    const qty = qtyFor(product.id);
                    if (cartId) updateCartQuantity(cartId, qty - 1);
                  }}
                />
              ))}
            </ResponsiveGrid>

            {isProjectorSearch ? (
              <View style={styles.included}>
                <Ionicons name="shield-checkmark" size={18} color={colors.secondaryText} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.includedTitle}>Included with all Projector Rentals</Text>
                  <Text style={styles.includedSub}>
                    HDMI 2.1 cables, extension rolls, and sanitized remotes in every transit case.
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.lg },
  filters: { gap: 8, paddingVertical: 2 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterActive: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  filterText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body },
  filterActiveText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  hubStatus: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body, flex: 1 },
  dropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.etaBg,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropBadgeText: { color: colors.etaText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption },
  featured: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 10,
    overflow: 'hidden',
    ...shadows.soft,
  },
  featuredBadges: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  featuredMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  featuredImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  featuredImage: { width: '100%', height: '100%' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  featuredTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.headline },
  featuredDesc: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 19,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  featuredPrice: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.headline },
  strike: {
    color: colors.mutedText,
    textDecorationLine: 'line-through',
    fontFamily: fonts.body,
    fontSize: typeScale.small,
  },
  addon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  addonImage: { width: 56, height: 56, borderRadius: radii.sm },
  addonTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, marginTop: 4 },
  addonPrice: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2 },
  included: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  includedTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.body },
  includedSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    marginTop: 4,
    lineHeight: 17,
  },
});
