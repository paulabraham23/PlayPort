import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { SoftPulse } from '@/components/motion/Pulse';
import { colors, fonts, gradients, radii, shadows, spacing, typeScale, webShadows } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import type { Product } from '@/types';

interface Props {
  product?: Product;
  etaMinutes?: number;
  onPress?: () => void;
}

export function HeroBanner({ product, etaMinutes = 30, onPress }: Props) {
  const { heroMinHeight, isDesktop, isTablet } = useResponsive();
  const imageUri =
    product?.images[0] ??
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=80';

  const titleSize = isDesktop ? 40 : isTablet ? 32 : typeScale.hero;
  const titleLine = isDesktop ? 47 : isTablet ? 38 : 40;

  return (
    <PressableScale
      accessibilityLabel="Browse tonight's kits"
      onPress={onPress}
      scaleTo={0.988}
      style={[styles.wrap, { minHeight: heroMinHeight }]}
    >
      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      <View style={styles.scrimTop} />
      <LinearGradient
        colors={[...gradients.heroScrim]}
        locations={[0.15, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { minHeight: heroMinHeight, padding: isDesktop ? spacing.xxl + 4 : spacing.xl }]}>
        <View style={styles.badgeRow}>
          <View style={styles.livePill}>
            <SoftPulse>
              <View style={styles.liveDot} />
            </SoftPulse>
            <Text style={styles.liveText}>Live at your hub</Text>
          </View>
          <View style={styles.etaPill}>
            <Ionicons name="flash" size={12} color={colors.etaText} />
            <Text style={styles.etaPillText}>{etaMinutes} min delivery</Text>
          </View>
        </View>

        <Text style={styles.kicker}>Tonight's entertainment</Text>
        <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLine }]}>
          Premium kits at{'\n'}your door
        </Text>
        <Text style={[styles.sub, isDesktop && styles.subWide]}>
          Consoles · VR · Cinema · Racing — sanitized and setup-ready.
        </Text>

        <View style={styles.ctaRow}>
          <Text style={styles.cta}>Browse kits</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.ctaPrimaryText} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
    ...Platform.select({
      web: { boxShadow: webShadows.card } as object,
      default: {},
    }),
  },
  image: { ...StyleSheet.absoluteFill },
  scrimTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: gradients.heroVeil[0],
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 7,
    backgroundColor: 'transparent',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 11,
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
    letterSpacing: 0.2,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.etaBg,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(61,214,140,0.22)',
  },
  etaPillText: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  kicker: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    letterSpacing: -1,
  },
  sub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 21,
    maxWidth: 320,
  },
  subWide: {
    maxWidth: 480,
    fontSize: typeScale.bodyLg,
    lineHeight: 23,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.ctaPrimary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.full,
    ...shadows.glow,
    ...Platform.select({
      web: { boxShadow: webShadows.glow } as object,
      default: {},
    }),
  },
  cta: {
    color: colors.ctaPrimaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
    letterSpacing: 0.2,
  },
});
