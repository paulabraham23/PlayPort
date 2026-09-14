import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LOCATION_LABEL } from '@/data/mock';
import { useCartCount } from '@/store/appStore';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  showLocation?: boolean;
  showCart?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ showLocation = true, showCart = true, rightSlot }: Props) {
  const insets = useSafeAreaInsets();
  const cartCount = useCartCount();
  const { horizontalPadding, isDesktop, width } = useResponsive();

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 12), paddingHorizontal: horizontalPadding, maxWidth: isDesktop ? 1100 : width, alignSelf: 'center', width: '100%' }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to home"
          onPress={() => router.push('/(tabs)')}
          style={styles.brand}
        >
          <View style={styles.logoMark}>
            <Ionicons name="game-controller" size={14} color={colors.white} />
          </View>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandText}>PlayPort</Text>
              <Ionicons name="flash" size={14} color={colors.playportOrange} />
            </View>
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
                <Text style={styles.etaText}>30m</Text>
                <Ionicons name="chevron-down" size={12} color={colors.secondaryText} />
              </Pressable>
            ) : null}
          </View>
        </Pressable>

        <View style={styles.right}>
          {rightSlot}
          {showCart ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Cart with ${cartCount} items`}
              onPress={() => router.push('/cart')}
              style={styles.cartBtn}
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
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brandText: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, maxWidth: 160 },
  etaDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.playportOrange },
  etaText: { color: colors.playportOrange, fontFamily: fonts.mono, fontSize: 11 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
