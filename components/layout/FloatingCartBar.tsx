import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/motion/PressableScale';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
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
  const { contentWidth, horizontalPadding, isMobile } = useResponsive();

  if (!cartCount) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          bottom: bottomOffset,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      <Animated.View
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(160)}
        style={[styles.barShell, { maxWidth: isMobile ? contentWidth : Math.min(520, contentWidth) }]}
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
            <Ionicons name="chevron-forward" size={16} color={colors.baseBlack} />
          </View>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
  },
  barShell: {
    width: '100%',
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ctaPrimary,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    ...Platform.select({
      web: {
        cursor: 'pointer' as unknown as undefined,
        boxShadow: '0 14px 34px rgba(232,146,58,0.32)',
      } as object,
      default: {
        shadowColor: '#D97F26',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 9,
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
    backgroundColor: 'rgba(7,8,12,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.baseBlack,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
  },
  label: {
    color: 'rgba(7,8,12,0.72)',
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  total: {
    color: colors.baseBlack,
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
    color: colors.baseBlack,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.body,
  },
});
