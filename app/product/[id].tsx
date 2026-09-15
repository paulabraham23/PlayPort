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
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
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
  const addProductToCart = useAppStore((s) => s.addProductToCart);

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
          color={colors.playportOrange}
          backgroundColor="rgba(0,0,0,0.65)"
          left={<Ionicons name="flash" size={12} color={colors.playportOrange} />}
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
          <Ionicons name="checkmark-circle" size={14} color={colors.secondaryText} />
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
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="time-outline" size={16} color={colors.playportOrange} />
              <Text style={styles.sectionTitle}>Select Rental Duration</Text>
            </View>
            <Text style={styles.freeSetup}>FREE SETUP INCLUDED</Text>
          </View>
          <DurationSelector product={product} value={durationId} onChange={setDurationId} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="briefcase-outline" size={16} color={colors.playportOrange} />
              <Text style={styles.sectionTitle}>What&apos;s in the Transit Case</Text>
            </View>
            <Text style={styles.monoMeta}>{product.includes.length} Items</Text>
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
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flash" size={16} color={colors.playportOrange} />
            <Text style={styles.sectionTitle}>Instant Flow Guarantee</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.playportOrange} />
              <Text style={styles.sectionTitle}>Gamer Verified</Text>
            </View>
            <Text style={styles.monoMeta}>{product.rating.toFixed(1)} / 5.0 RATING</Text>
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
            <Text style={styles.sectionTitle}>Related in {product.categoryId.replace('-', ' ')}</Text>
            <ResponsiveGrid columns={productColumns} gap={gap}>
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  compact={productColumns === 1}
                  onPress={() => router.push(`/product/${item.id}`)}
                  onRent={() => {
                    addProductToCart(item.id, '12h');
                    router.push('/cart');
                  }}
                />
              ))}
            </ResponsiveGrid>
          </View>
        ) : null}
      </ScrollView>

      <StickyBottomBar>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Text style={styles.selectedLabel}>Selected Plan</Text>
          <Text style={styles.selectedPrice}>
            {formatINR(price)} / {durationLabel}
          </Text>
        </View>
        <Button
          title="Book Now"
          icon={<Ionicons name="game-controller" size={16} color={colors.white} />}
          onPress={() => {
            addProductToCart(product.id, durationId);
            router.push('/cart');
          }}
          style={styles.bookBtn}
        />
      </StickyBottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.lg, paddingTop: spacing.sm },
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
    aspectRatio: 1.1,
    backgroundColor: colors.surfaceAlt,
  },
  heroSplit: {
    flex: 1,
    width: undefined,
    aspectRatio: 1,
    minHeight: 320,
  },
  heroImage: { ...StyleSheet.absoluteFill },
  heroTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
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
  heroBottom: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  sanitizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexWrap: 'wrap',
  },
  sanitizeText: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 12 },
  ratingText: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 11 },
  summary: { gap: spacing.md },
  summarySplit: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 280,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  titleLg: { fontSize: 28, lineHeight: 34 },
  desc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  pricePreview: { gap: 4, marginTop: spacing.sm },
  pricePreviewLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
  pricePreviewValue: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 20 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 16 },
  freeSetup: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
  monoMeta: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  includesList: { gap: 10 },
  includeRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  includeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  includeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  includeTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  includeDetail: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 17 },
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
  flowNumText: { color: colors.playportOrange, fontFamily: fonts.monoMedium, fontSize: 12 },
  flowTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  flowBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 17 },
  ratingCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'flex-start',
    gap: 4,
  },
  bigRating: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 32 },
  stars: { color: colors.secondaryText, fontSize: 14 },
  reviewCount: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewer: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  reviewDate: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12 },
  reviewStars: { color: colors.secondaryText, fontSize: 12 },
  reviewText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  noReviews: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
  selectedLabel: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  selectedPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 16, marginTop: 2 },
  bookBtn: { minWidth: 140 },
});
