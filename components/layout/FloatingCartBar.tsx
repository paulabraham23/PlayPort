import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { BounceIn, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/motion/PressableScale';
import { PulseOnChange } from '@/components/motion/Pulse';
import { ValuePop } from '@/components/motion/ValuePop';
import { colors, fonts, layout, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { useCartCount, useCartTotals } from '@/store/appStore';
import { formatINR } from '@/utils/format';

interface Props {
  bottomOffset?: number;
}

export function FloatingCartBar({ bottomOffset = layout.tabBarHeight + 8 }: Props) {
  const insets = useSafeAreaInsets();
  const cartCount = useCartCount();
  const totals = useCartTotals();

  if (!cartCount) return null;

  const bottom = bottomOffset + Math.max(insets.bottom > 0 ? 0 : 4, 0);

  return (
    <View pointerEvents="box-none" style={[styles.outer, { bottom }]}>
      <Animated.View
        entering={BounceIn.springify().damping(14).stiffness(180)}
        exiting={SlideOutDown.duration(180)}
        style={styles.barShell}
      >
        <PressableScale
          accessibilityLabel={`View cart, ${cartCount} items, ${formatINR(totals.total)}`}
          onPress={() => router.push('/cart')}
          scaleTo={0.97}
          style={styles.bar}
        >
          <View style={styles.left}>
            <PulseOnChange pulseKey={cartCount}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            </PulseOnChange>
            <View>
              <Text style={styles.label}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
              </Text>
              <ValuePop value={totals.total}>
                <Text style={styles.total}>{formatINR(totals.total)}</Text>
              </ValuePop>
            </View>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>View cart</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 50,
    alignItems: 'center',
  },
  barShell: {
    width: '100%',
    maxWidth: 520,
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    gap: 12,
    ...shadows.card,
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
      default: {},
    }),
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.orangeTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: typeScale.bodyLg,
  },
  label: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  total: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.playportOrange,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    ...shadows.glow,
  },
  ctaText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
  },
});
