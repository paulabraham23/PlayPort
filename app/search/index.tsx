import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import {
  CATEGORIES,
  HUB,
  POPULAR_SEARCHES,
  PRODUCTS,
  TRENDING_VIBES,
} from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

const QUICK_CATEGORY_IDS = ['gaming', 'movie-nights', 'board-games', 'music-karaoke'] as const;

const QUICK_LABELS: Record<(typeof QUICK_CATEGORY_IDS)[number], { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  gaming: { title: 'Gaming Gear', icon: 'game-controller-outline' },
  'movie-nights': { title: 'Home Cinema', icon: 'film-outline' },
  'board-games': { title: 'Board & Social', icon: 'dice-outline' },
  'music-karaoke': { title: 'Music & Audio', icon: 'musical-notes-outline' },
};

export default function SearchDiscoveryScreen() {
  const { horizontalPadding } = useResponsive();
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
            <Text style={styles.flashStatus}>FLASH HUB ACTIVE</Text>
          </View>
          <View style={styles.expressRow}>
            <Ionicons name="flash" size={12} color={colors.secondaryText} />
            <Text style={styles.express}>{HUB.etaMinutes}–45m express</Text>
          </View>
        </View>

        {recentSearches.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Vibes</Text>
            <Text style={styles.monoLabel}>PARTY MODES</Text>
          </View>
          <View style={styles.vibeRow}>
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
            <Text style={styles.sectionTitle}>Quick Categories</Text>
            <Text style={styles.monoAccent}>{setupsReady} SETUPS READY</Text>
          </View>
          <View style={styles.catGrid}>
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
                    <Ionicons name={meta.icon} size={20} color={cat.accent} />
                    <View style={styles.etaPill}>
                      <Text style={styles.etaText}>{cat.etaMinutes}m</Text>
                    </View>
                  </View>
                  <Text style={styles.catTitle}>{meta.title}</Text>
                  <Text style={styles.catSub}>{cat.setupsReady} setups ready</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Searches Right Now</Text>
            <Text style={styles.monoLabel}>LIVE PULSE</Text>
          </View>
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
                    accessibilityLabel={`Add ${item.label}`}
                    onPress={() => {
                      if (product) {
                        addProductToCart(product.id, '12h');
                        router.push('/cart');
                      }
                    }}
                    style={styles.addBtn}
                  >
                    <Ionicons name="add" size={20} color={colors.white} />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="flash" size={22} color={colors.playportOrange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Instant 30-45m Dropoff</Text>
            <Text style={styles.infoSub}>
              Indiranagar & Koramangala hubs. Sanitized & 100% charged gear ready to play.
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
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.playportOrange },
  flashStatus: {
    color: colors.playportOrange,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  expressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  express: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 17 },
  clearAll: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 13 },
  monoLabel: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.8 },
  monoAccent: { color: colors.playportOrange, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { color: colors.primaryText, fontFamily: fonts.body, fontSize: 13 },
  vibeRow: { flexDirection: 'row', gap: 10 },
  vibeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  vibeEmoji: { fontSize: 22, marginBottom: 4 },
  vibeTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  vibeSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  etaPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  etaText: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 10 },
  catTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15, marginTop: 4 },
  catSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  popularList: { gap: 10 },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: colors.secondaryText, fontFamily: fonts.monoMedium, fontSize: 11 },
  popularImage: { width: 48, height: 48, borderRadius: radii.sm },
  popularBody: { flex: 1, gap: 2 },
  popularTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  popularPrice: { color: colors.playportOrange, fontFamily: fonts.mono, fontSize: 12 },
  dropPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  dropText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A1A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  infoSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 17 },
});
