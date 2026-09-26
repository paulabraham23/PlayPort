import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '@/components/motion/PressableScale';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import type { Category } from '@/types';

/**
 * Horizontal scroll of category tiles — accent-ringed glyph tiles with
 * live hub counts. Falls back gracefully when catalog is empty.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      style={styles.scrollWrap}
    >
      {categories.map((cat) => (
        <PressableScale
          key={cat.id}
          accessibilityLabel={`Browse ${cat.name}`}
          onPress={() => router.push(`/category/${cat.id}`)}
          scaleTo={0.93}
          style={styles.tile}
        >
          <View style={[styles.glyph, { borderColor: `${cat.accent}55` }]}>
            <View style={[styles.glyphHalo, { backgroundColor: `${cat.accent}1F` }]} />
            <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={20} color={cat.accent} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {cat.shortName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {cat.setupsReady} ready
          </Text>
        </PressableScale>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollWrap: { width: '100%' },
  scroll: { gap: spacing.md, paddingRight: spacing.xl, paddingVertical: 2 },
  tile: {
    width: 84,
    alignItems: 'center',
    gap: 7,
  },
  glyph: {
    width: 62,
    height: 62,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glyphHalo: {
    ...({ position: 'absolute', top: -18, left: -18, width: 56, height: 56, borderRadius: 28 } as object),
  },
  name: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  meta: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    marginTop: -5,
  },
});
