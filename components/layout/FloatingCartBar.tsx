import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/motion/PressableScale';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useCartCount, useCartTotals } from '@/store/appStore';
import { formatINR } from '@/utils/format';

interface Props {
  /** Gap above the bottom of the tab content area (tab bar is already outside this area). */
  bottomOffset?: number;
}

/**
 * Bottom cart strip. Rendered inside tab screen content, so it sits just above
 * the tab bar — do not add tabBarHeight again or it floats too high.
 */
export function FloatingCartBar({ bottomOffset = 12 }: Props) {
  const cartCount = useCartCount();
  const totals = useCartTotals();

  if (!cartCount) return null;

  return (
    <View pointerEvents="box-none" style={[styles.outer, { bottom: bottomOffset }]}>
      <Animated.View
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(160)}
        style={styles.barShell}
      >
        <PressableScale
          accessibilityLabel={`View cart, ${cartCount} items, ${formatINR(totals.total)}`}
          onPress={() => router.push('/cart')}
          scaleTo={0.98}
          style={styles.bar}
        >
          <View style={styles.left}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{cartCount > 9 ? '9+' : cartCount}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.label} numberOfLines={1}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </Text>
              <Text style={styles.total}>{formatINR(totals.total)}</Text>
            </View>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>View cart</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.white} />
          </View>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 50,
    alignItems: 'center',
  },
  barShell: {
    width: '100%',
    maxWidth: 480,
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.playportOrange,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    gap: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer' as unknown as undefined,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      } as object,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  meta: { flex: 1, minWidth: 0, gap: 1 },
  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  total: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  ctaText: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
});
