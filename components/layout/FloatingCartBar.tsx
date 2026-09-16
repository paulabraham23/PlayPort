import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, layout, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { useCartCount, useCartTotals } from '@/store/appStore';
import { formatINR } from '@/utils/format';

interface Props {
  /** Extra offset above tab bar */
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${cartCount} items, ${formatINR(totals.total)}`}
        onPress={() => router.push('/cart')}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
          styles.bar,
          (pressed || hovered) && styles.pressed,
        ]}
      >
        <View style={styles.left}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{cartCount > 9 ? '9+' : cartCount}</Text>
          </View>
          <View>
            <Text style={styles.label}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
            </Text>
            <Text style={styles.total}>{formatINR(totals.total)}</Text>
          </View>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>View cart</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </View>
      </Pressable>
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
  bar: {
    width: '100%',
    maxWidth: 520,
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
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
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
