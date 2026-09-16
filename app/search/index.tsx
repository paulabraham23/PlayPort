import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { SearchBar } from '@/components/search/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
import {
  CATEGORIES,
  HUB,
  POPULAR_SEARCHES,
  PRODUCTS,
  TRENDING_VIBES,
} from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

const QUICK_CATEGORY_IDS = ['gaming', 'vr', 'racing', 'movie-nights'] as const;

const QUICK_LABELS: Record<(typeof QUICK_CATEGORY_IDS)[number], { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  gaming: { title: 'Consoles', icon: 'game-controller-outline' },
  vr: { title: 'VR', icon: 'glasses-outline' },
  racing: { title: 'Racing', icon: 'car-sport-outline' },
  'movie-nights': { title: 'Projectors', icon: 'film-outline' },
};

export default function SearchDiscoveryScreen() {
  const { horizontalPadding, categoryColumns, gap, isDesktop } = useResponsive();
  const [query, setQuery] = useState('');
  const recentSearches = useAppStore((s) => s.recentSearches);
  const pushRecentSearch = useAppStore((s) => s.pushRecentSearch);
  const clearRecentSearches = useAppStore((s) => s.clearRecentSearches);
  const addProductToCart = useAppStore((s) => s.addProductToCart);

  const runSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecentSearch(trimmed);
    router.push({ pathname: '/search/results', params: { q: trimmed } });
  };

  const quickCategories = QUICK_CATEGORY_IDS.map((id) => CATEGORIES.find((c) => c.id === id)!).filter(Boolean);
  const setupsReady = CATEGORIES.reduce((sum, c) => sum + c.setupsReady, 0);
  const quickCols = Math.min(categoryColumns, 4);

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
          autoFocus
          showBack
          onBack={() => router.back()}
          onSubmit={() => runSearch(query)}
          onClear={() => setQuery('')}
        />

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.flashStatus}>HUB ACTIVE</Text>
          </View>
          <View style={styles.expressRow}>
            <Ionicons name="flash" size={12} color={colors.etaText} />
            <Text style={styles.express}>{HUB.etaMinutes}–45m express</Text>
          </View>
        </View>

        {recentSearches.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SectionHeader eyebrow="History" title="Recent searches" />
              <Pressable onPress={clearRecentSearches} accessibilityRole="button">
                <Text style={styles.clearAll}>Clear all</Text>
              </Pressable>
            </View>
            <View style={styles.chips}>
              {recentSearches.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => runSearch(item)}
                  style={styles.chip}
                >
                  <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                  <Text style={styles.chipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader eyebrow="Tonight" title="Trending vibes" />
          <View style={[styles.vibeRow, isDesktop && styles.vibeRowDesktop]}>
            {TRENDING_VIBES.map((vibe) => (
              <Pressable
                key={vibe.id}
                accessibilityRole="button"
                onPress={() => runSearch(vibe.title)}
                style={styles.vibeCard}
              >
                <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                <Text style={styles.vibeTitle}>{vibe.title}</Text>
                <Text style={styles.vibeSub}>{vibe.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionHeader eyebrow="Browse" title="Quick categories" />
            <Text style={styles.monoAccent}>{setupsReady} ready</Text>
          </View>
          <ResponsiveGrid columns={quickCols} gap={gap}>
            {quickCategories.map((cat) => {
              const meta = QUICK_LABELS[cat.id as (typeof QUICK_CATEGORY_IDS)[number]];
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/category/${cat.id}`)}
                  style={styles.catCard}
                >
                  <View style={styles.catTop}>
                    <Ionicons name={meta.icon} size={20} color={colors.playportOrange} />
                    <View style={styles.etaPill}>
                      <Text style={styles.etaText}>{cat.etaMinutes}m</Text>
                    </View>
                  </View>
                  <Text style={styles.catTitle}>{meta.title}</Text>
                  <Text style={styles.catSub}>{cat.setupsReady} setups ready</Text>
                </Pressable>
              );
            })}
          </ResponsiveGrid>
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Popular" title="Searches right now" />
          <View style={styles.popularList}>
            {POPULAR_SEARCHES.map((item, index) => {
              const product = PRODUCTS.find((p) => p.id === item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => runSearch(item.label.replace(/\.\.\.$/, ''))}
                  style={styles.popularRow}
                >
                  <View style={styles.rank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Image
                    source={{ uri: product?.images[0] }}
                    style={styles.popularImage}
                    contentFit="cover"
                  />
                  <View style={styles.popularBody}>
                    <Text style={styles.popularTitle} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={styles.popularPrice}>{item.priceLabel}</Text>
                    <View style={styles.dropPill}>
                      <Text style={styles.dropText}>Drop in {item.eta}m</Text>
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${item.label} to cart`}
                    onPress={() => {
                      if (product) {
                        addProductToCart(product.id, '12h');
                      }
                    }}
                    style={styles.addBtn}
                  >
                    <Text style={styles.addBtnText}>ADD</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="flash" size={22} color={colors.etaText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Instant 30-45m Dropoff</Text>
            <Text style={styles.infoSub}>
              Local hubs. Sanitized & 100% charged gear ready to play.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.xxl },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  flashStatus: {
    color: colors.success,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.6,
  },
  expressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  express: { color: colors.etaText, fontFamily: fonts.body, fontSize: typeScale.small },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearAll: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, marginBottom: 4 },
  monoAccent: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
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
  chipText: { color: colors.primaryText, fontFamily: fonts.body, fontSize: typeScale.body },
  vibeRow: { flexDirection: 'row', gap: 10 },
  vibeRowDesktop: { maxWidth: 720 },
  vibeCard: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 4,
    ...shadows.soft,
  },
  vibeEmoji: { fontSize: 22, marginBottom: 4 },
  vibeTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  vibeSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  catCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 6,
  },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  etaPill: {
    backgroundColor: colors.etaBg,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  etaText: { color: colors.etaText, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption },
  catTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.bodyLg, marginTop: 4 },
  catSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  popularList: { gap: 10 },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.caption },
  popularImage: { width: 48, height: 48, borderRadius: radii.sm },
  popularBody: { flex: 1, gap: 2 },
  popularTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  popularPrice: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  dropPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.etaBg,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  dropText: { color: colors.etaText, fontFamily: fonts.body, fontSize: typeScale.caption },
  addBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.orangeTint,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: typeScale.caption,
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    alignItems: 'center',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.etaBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.bodyLg },
  infoSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    marginTop: 4,
    lineHeight: 17,
  },
});
