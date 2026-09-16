import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { colors, fonts, radii, shadows, typeScale } from '@/constants/theme';
import type { Category } from '@/types';

interface Props {
  category: Category;
  onPress?: () => void;
}

export function CategoryTile({ category, onPress }: Props) {
  return (
    <PressableScale
      accessibilityLabel={category.name}
      onPress={onPress}
      scaleTo={0.96}
      style={styles.tile}
    >
      <Image source={{ uri: category.image }} style={styles.image} contentFit="cover" />
      <View style={styles.scrim} />
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${category.accent}22` }]}>
          <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={18} color={category.accent} />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {category.shortName}
        </Text>
        <Text style={styles.meta}>{category.setupsReady} kits</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    ...shadows.soft,
  },
  image: { ...StyleSheet.absoluteFill },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.heroScrimStrong,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
  },
  meta: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
});
