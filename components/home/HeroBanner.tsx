import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
import type { Product } from '@/types';

interface Props {
  product?: Product;
  etaMinutes?: number;
  onPress?: () => void;
}

export function HeroBanner({ product, etaMinutes = 30, onPress }: Props) {
  const imageUri =
    product?.images[0] ??
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=80';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Browse tonight's kits"
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.wrap,
        (pressed || hovered) && styles.pressed,
      ]}
    >
      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      <View style={styles.scrimTop} />
      <View style={styles.scrimBottom} />

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live at your hub</Text>
          </View>
          <View style={styles.etaPill}>
            <Ionicons name="flash" size={12} color={colors.etaText} />
            <Text style={styles.etaText}>{etaMinutes} min delivery</Text>
          </View>
        </View>

        <Text style={styles.kicker}>Tonight's entertainment</Text>
        <Text style={styles.title}>Premium kits at your door</Text>
        <Text style={styles.sub}>Consoles · VR · Cinema · Racing — setup included, zero deposit.</Text>

        <View style={styles.ctaRow}>
          <Text style={styles.cta}>Browse kits</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    minHeight: 220,
    backgroundColor: colors.surfaceAlt,
    ...shadows.card,
  },
  pressed: { opacity: 0.96 },
  image: { ...StyleSheet.absoluteFill },
  scrimTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,11,0.35)',
  },
  scrimBottom: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    // layered gradient simulation via bottom-heavy overlay
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    gap: 6,
    backgroundColor: 'rgba(10,10,11,0.55)',
    minHeight: 220,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.etaBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  etaText: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  kicker: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.display,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  sub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 20,
    maxWidth: 320,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.playportOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    ...shadows.glow,
  },
  cta: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
  },
});
