import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Category } from '@/types';

interface Props {
  category: Category;
  onPress?: () => void;
  wide?: boolean;
}

export function CategoryCard({ category, onPress, wide }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={onPress}
      style={[styles.card, wide ? styles.wide : styles.narrow]}
    >
      <Image source={{ uri: category.image }} style={styles.image} contentFit="cover" />
      <View style={[styles.overlay, { borderColor: category.accent }]} />
      <View style={styles.body}>
        <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={18} color={category.accent} />
        <Text style={styles.title}>{category.shortName}</Text>
        <Text style={styles.meta}>{category.setupsReady} sets ready</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  narrow: { width: 140, height: 150 },
  wide: { flex: 1, minHeight: 120 },
  image: { ...StyleSheet.absoluteFill },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderLeftWidth: 3,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    gap: 4,
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 15 },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
});
