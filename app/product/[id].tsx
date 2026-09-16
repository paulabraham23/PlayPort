import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { DurationSelector } from '@/components/products/DurationSelector';
import { ProductCard } from '@/components/products/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { ensureLoggedIn } from '@/utils/authGate';
import { formatINR } from '@/utils/format';
import type { RentalDurationId } from '@/types';

const FLOW_STEPS = [
  {
    title: 'Hub Pre-Test',
    body: 'Every kit is powered on, sanitized, and sealed before dispatch from your dark hub.',
  },
  {
    title: 'Doorstep Drop',
    body: 'Rider arrives in a shockproof transit case with HDMI, power, and spare cables ready.',
  },
  {
    title: 'Instant Play',
    body: 'White-glove setup plugs you in — press start while we verify latency live.',
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding, useSplitPane, productColumns, gap } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const [durationId, setDurationId] = useState<RentalDurationId>('12h');
  const [wishlisted, setWishlisted] = useState(false);
  const reviews = useAppStore((s) => s.reviews);
  const cart = useAppStore((s) => s.cart);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);

  const product = PRODUCTS.find((p) => p.id === id);
  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product?.id),
    [reviews, product?.id]
  );
  const related = useMemo(
    () =>
      PRODUCTS.filter(
        (p) => p.categoryId === product?.categoryId && p.id !== product?.id && p.id !== 'screen-addon'
      ).slice(0, 4),
    [product]
  );

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);
  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  if (!product) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Item Detail" onBack={() => router.back()} />
        <EmptyState
          title="Product not found"
          subtitle="This kit may have moved hubs."
          actionLabel="Explore"
          onAction={() => router.replace('/(tabs)/explore')}
        />
      </Screen>
    );
  }

  const price = product.priceByDuration[durationId];
  const durationLabel =
    durationId === 'weekend' ? 'Weekend' : durationId === '12h' ? '12 Hours' : durationId === '24h' ? '24 Hours' : '6 Hours';

  const heroBlock = (
    <View style={[styles.hero, useSplitPane && styles.heroSplit]}>
      <Image source={{ uri: product.images[0] }} style={styles.heroImage} contentFit="cover" />
      <View style={styles.heroTop}>
        <Badge
          label={`DELIVERED IN ${product.etaMinutes} MINS`}
          color={colors.etaText}
          backgroundColor={colors.etaBg}
          left={<Ionicons name="flash" size={12} color={colors.etaText} />}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle wishlist"
          onPress={() => setWishlisted((w) => !w)}
          style={styles.heart}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={wishlisted ? colors.badgeRed : colors.white}
          />
        </Pressable>
      </View>
      <View style={styles.heroBottom}>
        <View style={styles.sanitizePill}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.sanitizeText}>{product.badge ?? 'Sanitized Pro Kit'}</Text>
          <Text style={styles.ratingText}>
            ★ {product.rating} ({product.reviewCount}+)
          </Text>
        </View>
      </View>
    </View>
  );

  const summaryBlock = (
    <View style={[styles.summary, useSplitPane && styles.summarySplit]}>
      <View style={styles.tagRow}>
        {product.tags.map((tag) => (
          <Badge
            key={tag}
            label={tag}
            color={tag.toLowerCase().includes('deposit') ? colors.secondaryText : colors.white}
            backgroundColor={
              tag.toLowerCase().includes('gaming') || tag.toLowerCase().includes('drop')
                ? colors.playportOrange
                : colors.surfaceAlt
            }
          />
        ))}
      </View>
      <Text style={[styles.title, useSplitPane && styles.titleLg]}>{product.name}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <View style={styles.pricePreview}>
        <Text style={styles.pricePreviewLabel}>From</Text>
        <Text style={styles.pricePreviewValue}>
          {formatINR(price)} / {durationLabel}
        </Text>
      </View>
    </View>
  );

  return (
    <Screen showHeader={false} edges={['top']}>
      <ScreenHeader title="Item Detail" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, paddingBottom: stickyPad }]}
      >
        <View style={[styles.topBlock, useSplitPane && styles.topBlockSplit]}>
          {heroBlock}
          {summaryBlock}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTop}>
            <SectionHeader eyebrow="Duration" title="Select rental duration" />
            <Text style={styles.metaLabel}>FREE SETUP</Text>
          </View>
          <DurationSelector product={product} value={durationId} onChange={setDurationId} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTop}>
            <SectionHeader eyebrow="Includes" title="What's in the transit case" />
            <Text style={styles.metaLabel}>{product.includes.length} items</Text>
          </View>
          <View style={styles.includesList}>
            {product.includes.map((item) => (
              <View key={item.title} style={styles.includeRow}>
                <View style={styles.includeIcon}>
                  <Ionicons name="cube-outline" size={16} color={colors.secondaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.includeTitleRow}>
                    <Text style={styles.includeTitle}>{item.title}</Text>
                    {item.tag ? <Badge label={item.tag} /> : null}
                  </View>
                  <Text style={styles.includeDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Promise" title="Instant flow guarantee" />
          <View style={styles.flowList}>
            {FLOW_STEPS.map((step, index) => (
              <View key={step.title} style={styles.flowRow}>
                <View style={styles.flowNum}>
                  <Text style={styles.flowNumText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flowTitle}>{step.title}</Text>
                  <Text style={styles.flowBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTop}>
            <SectionHeader eyebrow="Reviews" title="Verified by renters" />
            <Text style={styles.metaLabel}>{product.rating.toFixed(1)} / 5</Text>
          </View>
          <View style={styles.ratingCard}>
            <Text style={styles.bigRating}>{product.rating.toFixed(2)}</Text>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.reviewCount}>{product.reviewCount}+ verified sessions</Text>
          </View>
          {productReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewer}>{review.userName}</Text>
                <Text style={styles.reviewDate}>{review.dateLabel}</Text>
              </View>
              <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
          {!productReviews.length ? (
            <Text style={styles.noReviews}>Be the first to verify this kit after your session.</Text>
          ) : null}
        </View>

        {related.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              eyebrow="More like this"
              title={`Related in ${product.categoryId.replace(/-/g, ' ')}`}
            />
            <ResponsiveGrid columns={productColumns} gap={gap}>
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  compact={productColumns === 1}
                  quantityInCart={qtyFor(item.id)}
                  onPress={() => router.push(`/product/${item.id}`)}
                  onAdd={() => addProductToCart(item.id, '12h')}
                  onIncrement={() => addProductToCart(item.id, '12h')}
                  onDecrement={() => {
                    const cartId = cartItemIdFor(item.id);
                    const qty = qtyFor(item.id);
                    if (cartId) updateCartQuantity(cartId, qty - 1);
                  }}
                />
              ))}
            </ResponsiveGrid>
          </View>
        ) : null}
      </ScrollView>

      <StickyBottomBar>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Text style={styles.selectedLabel}>Selected plan</Text>
          <Text style={styles.selectedPrice}>
            {formatINR(price)} / {durationLabel}
          </Text>
        </View>
        <Button
          title="Add to cart"
          icon={<Ionicons name="bag-add-outline" size={16} color={colors.white} />}
          onPress={() => {
            addProductToCart(product.id, durationId);
            if (!ensureLoggedIn('/cart')) return;
            router.push('/cart');
          }}
          style={styles.bookBtn}
        />
      </StickyBottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xl, paddingTop: spacing.sm },
  topBlock: { gap: spacing.lg },
  topBlockSplit: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xl,
  },
  hero: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    ...shadows.soft,
  },
  heroSplit: {
    flex: 1,
    width: undefined,
    aspectRatio: 1,
    minHeight: 360,
  },
  heroImage: { ...StyleSheet.absoluteFill },
  heroTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  sanitizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  sanitizeText: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  ratingText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption },
  summary: { gap: spacing.md },
  summarySplit: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 280,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  titleLg: { fontSize: typeScale.display, lineHeight: 34 },
  desc: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 21,
  },
  pricePreview: { gap: 4, marginTop: spacing.sm },
  pricePreviewLabel: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pricePreviewValue: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
  },
  section: { gap: spacing.md },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
    flexShrink: 0,
  },
  includesList: { gap: 10 },
  includeRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  includeIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  includeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  includeTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  includeDetail: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    marginTop: 4,
    lineHeight: 17,
  },
  flowList: { gap: 14 },
  flowRow: { flexDirection: 'row', gap: 12 },
  flowNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowNumText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  flowTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  flowBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    marginTop: 4,
    lineHeight: 17,
  },
  ratingCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    alignItems: 'flex-start',
    gap: 4,
    ...shadows.soft,
  },
  bigRating: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.hero },
  stars: { color: colors.warning, fontSize: 14 },
  reviewCount: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  reviewCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: 6,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewer: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  reviewDate: { color: colors.mutedText, fontFamily: fonts.body, fontSize: typeScale.small },
  reviewStars: { color: colors.warning, fontSize: 12 },
  reviewText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 19,
  },
  noReviews: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body },
  selectedLabel: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  selectedPrice: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    marginTop: 2,
  },
  bookBtn: { minWidth: 140 },
});
