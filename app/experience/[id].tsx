import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { StickyBottomBar, useStickyBarPadding } from '@/components/layout/StickyBottomBar';
import { ProductCard } from '@/components/products/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { EXPERIENCES, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { ensureLoggedIn } from '@/utils/authGate';
import { formatINR } from '@/utils/format';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding, useSplitPane, productColumns, gap } = useResponsive();
  const stickyPad = useStickyBarPadding();
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);
  const addProductToCart = useAppStore((s) => s.addProductToCart);

  const experience = EXPERIENCES.find((e) => e.id === id);
  const includedProducts = experience
    ? PRODUCTS.filter((p) => experience.productIds.includes(p.id))
    : [];

  if (!experience) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Experience" onBack={() => router.back()} />
        <EmptyState
          title="Experience not found"
          subtitle="This vibe may have rotated out."
          actionLabel="Explore"
          onAction={() => router.replace('/(tabs)/explore')}
        />
      </Screen>
    );
  }

  const heroBlock = (
    <View style={[styles.hero, useSplitPane && styles.heroSplit]}>
      <Image source={{ uri: experience.image }} style={styles.heroImage} contentFit="cover" />
      <View style={styles.heroBadges}>
        <Badge label={experience.tag} />
        <Badge
          label={`${experience.etaMinutes} mins`}
          color={colors.secondaryText}
          left={<Ionicons name="time-outline" size={12} color={colors.secondaryText} />}
        />
      </View>
    </View>
  );

  const summaryBlock = (
    <View style={[styles.summary, useSplitPane && styles.summarySplit]}>
      <Text style={[styles.title, useSplitPane && styles.titleLg]}>{experience.name}</Text>
      <Text style={styles.desc}>{experience.description}</Text>
      <View style={styles.chips}>
        {experience.chips.map((chip) => (
          <Badge key={chip} label={chip} />
        ))}
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={colors.playportOrange} />
          <Text style={styles.metaText}>{experience.people}</Text>
        </View>
        <Text style={styles.price}>
          {formatINR(experience.price)}
          <Text style={styles.duration}> {experience.durationLabel}</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <Screen showHeader={false} edges={['top']}>
      <ScreenHeader title="Experience" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: stickyPad },
        ]}
      >
        <View style={[styles.topBlock, useSplitPane && styles.topBlockSplit]}>
          {heroBlock}
          {summaryBlock}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What&apos;s included</Text>
          <View style={styles.includes}>
            {experience.includes.map((item) => (
              <View key={item} style={styles.includeRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.secondaryText} />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.howList}>
            {experience.howItWorks.map((step, index) => (
              <View key={step} style={styles.howRow}>
                <View style={styles.howNum}>
                  <Text style={styles.howNumText}>{index + 1}</Text>
                </View>
                <Text style={styles.howText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {includedProducts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Included products</Text>
            <ResponsiveGrid columns={productColumns} gap={gap}>
              {includedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact={productColumns === 1}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onRent={() => {
                    addProductToCart(product.id, '12h');
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
          <Text style={styles.stickyLabel}>Bundle total</Text>
          <Text style={styles.stickyPrice}>{formatINR(experience.price)}</Text>
        </View>
        <Button
          title="Book Experience"
          icon={<Ionicons name="flash" size={16} color={colors.white} />}
          onPress={() => {
            addExperienceToCart(experience.id);
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
    height: 220,
    width: '100%',
    backgroundColor: colors.surfaceAlt,
  },
  heroSplit: {
    flex: 1,
    width: undefined,
    height: undefined,
    minHeight: 280,
    aspectRatio: 4 / 3,
  },
  heroImage: { ...StyleSheet.absoluteFill },
  heroBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  summary: { gap: spacing.md },
  summarySplit: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 280,
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  titleLg: { fontSize: 28, lineHeight: 34 },
  desc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
  price: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 20 },
  duration: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 17 },
  includes: { gap: 10 },
  includeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  includeText: { color: colors.primaryText, fontFamily: fonts.body, fontSize: 14, flex: 1 },
  howList: { gap: 12 },
  howRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  howNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howNumText: { color: colors.playportOrange, fontFamily: fonts.monoMedium, fontSize: 12 },
  howText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, flex: 1 },
  stickyLabel: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  stickyPrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 18, marginTop: 2 },
  bookBtn: { minWidth: 160 },
});
