import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LOCATION_LABEL, HUB } from '@/data/mock';
import { useCartCount } from '@/store/appStore';
import { colors, fonts, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  showLocation?: boolean;
  showCart?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ showLocation = true, showCart = true, rightSlot }: Props) {
  const cartCount = useCartCount();
  const { horizontalPadding, isDesktop, width } = useResponsive();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: horizontalPadding,
          maxWidth: isDesktop ? 1100 : width,
          alignSelf: 'center',
          width: '100%',
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.brand}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to home"
            onPress={() => router.push('/(tabs)')}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              styles.logoMark,
              (pressed || hovered) && styles.pressed,
            ]}
          >
            <Ionicons name="game-controller" size={14} color={colors.white} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go to home"
              onPress={() => router.push('/(tabs)')}
              style={styles.brandRow}
            >
              <Text style={styles.brandText}>PlayPort</Text>
              <Ionicons name="flash" size={14} color={colors.playportOrange} />
            </Pressable>
            {showLocation ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change delivery location"
                onPress={() => router.push('/address')}
                style={styles.locationRow}
              >
                <Text style={styles.locationText} numberOfLines={1}>
                  {LOCATION_LABEL}
                </Text>
                <View style={styles.etaDot} />
                <Text style={styles.etaText}>{HUB.etaMinutes}m</Text>
                <Ionicons name="chevron-down" size={12} color={colors.secondaryText} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.right}>
          {rightSlot}
          {showCart ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cart with ${cartCount} items`}
              onPress={() => router.push('/cart')}
              style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                styles.cartBtn,
                (pressed || hovered) && styles.pressed,
              ]}
            >
              <Ionicons name="bag-handle-outline" size={22} color={colors.primaryText} />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.baseBlack,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
      default: {},
    }),
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brandText: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    maxWidth: 180,
  },
  etaDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.playportOrange },
  etaText: { color: colors.playportOrange, fontFamily: fonts.mono, fontSize: 11 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
      default: {},
    }),
  },
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.badgeRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 10, fontFamily: fonts.bodyMedium },
});
