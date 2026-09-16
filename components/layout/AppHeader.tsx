import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LOCATION_LABEL, HUB } from '@/data/mock';
import { useAppStore, useCartCount } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { colors, fonts, layout, radii, spacing, typeScale } from '@/constants/theme';
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
  const { horizontalPadding, contentWidth, isDesktop } = useResponsive();
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
            minHeight: layout.headerHeight,
          },
        ]}
      >
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change delivery location"
            onPress={() => router.push('/address')}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              styles.left,
              (pressed || hovered) && styles.pressed,
            ]}
          >
            <View style={styles.brandRow}>
              <Text style={styles.brandMark}>Play</Text>
              <Text style={styles.brandAccent}>Port</Text>
            </View>
            {showLocation ? (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={colors.playportOrange} />
                <Text
                  style={[styles.locationText, isDesktop && styles.locationTextWide]}
                  numberOfLines={1}
                >
                  Delivery to {locationLabel}
                </Text>
                <Ionicons name="chevron-down" size={12} color={colors.mutedText} />
              </View>
            ) : (
              <Text style={styles.tagline}>Entertainment on demand</Text>
            )}
          </Pressable>

          <View style={styles.actions}>
            <View style={styles.etaPill} accessibilityLabel={`Delivery in ${eta} minutes`}>
              <Ionicons name="flash" size={12} color={colors.etaText} />
              <Text style={styles.etaPillText}>{eta} mins</Text>
            </View>

            {!isAuthenticated ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Log in"
                onPress={() => router.push('/(auth)/login')}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.loginBtn,
                  (pressed || hovered) && styles.pressed,
                ]}
              >
                <Text style={styles.loginText}>Login</Text>
              </Pressable>
            ) : null}

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
                <Ionicons name="bag-outline" size={20} color={colors.primaryText} />
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
    backgroundColor: colors.page,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(10,10,11,0.92)',
      } as object,
      default: {},
    }),
  },
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  brandRow: { flexDirection: 'row', alignItems: 'baseline' },
  brandMark: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    maxWidth: '100%',
  },
  locationText: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    maxWidth: 160,
    flexShrink: 1,
  },
  locationTextWide: { maxWidth: 280 },
  tagline: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    height: 40,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    backgroundColor: colors.etaBg,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  etaPillText: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  loginBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
      default: {},
    }),
  },
  loginText: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
      default: {},
    }),
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.playportOrange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.page,
  },
  badgeText: { color: colors.white, fontSize: 9, fontFamily: fonts.bodyMedium },
});
