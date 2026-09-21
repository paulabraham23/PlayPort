import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { SearchBar } from '@/components/search/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { formatINR } from '@/utils/format';
import { cheapestPlanPrice, normalizeProduct } from '@/utils/rentalPricing';

export default function SearchDiscoveryScreen() {
  const { horizontalPadding } = useResponsive();
  const [query, setQuery] = useState('');
  const recentSearches = useAppStore((s) => s.recentSearches);
  const pushRecentSearch = useAppStore((s) => s.pushRecentSearch);
  const clearRecentSearches = useAppStore((s) => s.clearRecentSearches);
  const hub = useCatalogStore((s) => s.hub);
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);

  const popular = useMemo(
    () => products.filter((p) => p.popular || p.featured).slice(0, 6),
    [products]
  );

  const runSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecentSearch(trimmed);
    router.push({ pathname: '/search/results', params: { q: trimmed } });
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
            <Text style={styles.express}>{hub.etaMinutes}–45m express</Text>
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

        {categories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="Browse" title="Categories" />
            <View style={styles.chips}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/category/${cat.id}`)}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{cat.shortName || cat.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {popular.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="Popular" title="Quick picks" />
            {popular.map((product) => (
              <Pressable
                key={product.id}
                accessibilityRole="button"
                onPress={() => runSearch(product.shortName)}
                style={styles.popularRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.popularTitle}>{product.shortName}</Text>
                  <Text style={styles.popularMeta}>
                    {formatINR(cheapestPlanPrice(normalizeProduct(product)) ?? 0)}+ · {product.etaMinutes}m
                  </Text>
                </View>
                <Ionicons name="search" size={16} color={colors.mutedText} />
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.hint}>Search for kits by name — try PS5, projector, or VR.</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.huge },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.etaText,
  },
  flashStatus: {
    color: colors.etaText,
    fontFamily: fonts.monoMedium,
    fontSize: typeScale.caption,
    letterSpacing: 1,
  },
  expressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  express: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  clearAll: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  chipText: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  popularTitle: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
  popularMeta: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    marginTop: 2,
  },
  hint: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
  },
});
