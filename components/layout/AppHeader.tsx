import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LOCATION_LABEL, HUB } from '@/data/mock';
import { useAppStore, useCartCount } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  showLocation?: boolean;
  showCart?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ showLocation = true, showCart = true, rightSlot }: Props) {
  const cartCount = useCartCount();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hub = useCatalogStore((s) => s.hub);
  const { horizontalPadding, contentWidth, isDesktop, isTablet } = useResponsive();
  const locationLabel = hub?.city ? hub.city : LOCATION_LABEL;
  const eta = hub?.etaMinutes ?? HUB.etaMinutes;

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.wrap,
          {
            paddingHorizontal: horizontalPadding,
            maxWidth: contentWidth,
            width: '100%',
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.left}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change delivery location"
              onPress={() => router.push('/address')}
              style={styles.locationBlock}
            >
              <View style={styles.etaRow}>
                <View style={styles.etaPill}>
                  <Text style={styles.etaPillText}>{eta} mins</Text>
                </View>
                {!isAuthenticated ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/(auth)/login')}
                    hitSlop={8}
                  >
                    <Text style={styles.loginLink}>Log in</Text>
                  </Pressable>
                ) : null}
              </View>
              {showLocation ? (
                <View style={styles.locationRow}>
                  <Text
                    style={[styles.locationText, (isTablet || isDesktop) && styles.locationTextWide]}
                    numberOfLines={1}
                  >
                    Delivery to {locationLabel}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={colors.primaryText} />
                </View>
              ) : (
                <Text style={[styles.brandText, isDesktop && styles.brandTextLg]}>PlayPort</Text>
              )}
            </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flex: 1, minWidth: 0 },
  locationBlock: { gap: 4 },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  etaPill: {
    backgroundColor: colors.etaBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  etaPillText: {
    color: colors.etaText,
    fontFamily: fonts.heading,
    fontSize: 12,
  },
  loginLink: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 15,
    maxWidth: 220,
    flexShrink: 1,
  },
  locationTextWide: { maxWidth: 360 },
  brandText: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  brandTextLg: { fontSize: 20 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
      default: {},
    }),
  },
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 10, fontFamily: fonts.bodyMedium },
});
