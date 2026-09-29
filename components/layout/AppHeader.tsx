import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet';
import { PressableScale } from '@/components/motion/PressableScale';
import { PulseOnChange } from '@/components/motion/Pulse';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, layout, radii, spacing, typeScale, webShadows } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartCount } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { ensureLoggedIn } from '@/utils/authGate';

interface Props {
  showCart?: boolean;
  showSearch?: boolean;
  pageTitle?: string;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ showCart = false, showSearch = true, pageTitle, rightSlot }: Props) {
  const cartCount = useCartCount();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const addresses = useAppStore((s) => s.addresses);
  const selectedAddressId = useAppStore((s) => s.selectedAddressId);
  const hub = useCatalogStore((s) => s.hub);
  const { horizontalPadding, contentWidth } = useResponsive();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.isDefault);
  const place = selectedAddress
    ? selectedAddress.area || selectedAddress.city
    : hub?.city && hub.city !== '—'
      ? hub.city
      : 'Place';

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.wrap,
          { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%' },
        ]}
      >
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change delivery location"
            onPress={() => {
              if (!isAuthenticated) {
                ensureLoggedIn('/address');
                return;
              }
              router.push('/address');
            }}
            style={styles.placeBtn}
          >
            <Ionicons name="location" size={16} color={colors.playportOrange} />
            <View style={styles.placeText}>
              <Text style={styles.delivering}>Delivering to</Text>
              <Text style={styles.place} numberOfLines={1}>
                {place}
              </Text>
            </View>
          </Pressable>

          {pageTitle ? (
            <View pointerEvents="none" style={styles.titleSlot}>
              <Text style={styles.pageTitle} numberOfLines={1}>
                {pageTitle}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {rightSlot}
            <PressableScale
              accessibilityLabel="Send feedback"
              onPress={() => setFeedbackOpen(true)}
              scaleTo={0.94}
              style={styles.iconBtn}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primaryText} />
            </PressableScale>
            {showCart ? (
              <PressableScale
                accessibilityLabel={`Cart with ${cartCount} items`}
                onPress={() => router.push('/cart')}
                scaleTo={0.94}
                style={styles.iconBtn}
              >
                <Ionicons name="bag-outline" size={18} color={colors.primaryText} />
                {cartCount > 0 ? (
                  <PulseOnChange pulseKey={cartCount} style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                  </PulseOnChange>
                ) : null}
              </PressableScale>
            ) : null}
          </View>
        </View>

        {showSearch ? (
          <View style={styles.searchSlot}>
            <SearchBar value="" onChangeText={() => {}} onPress={() => router.push('/search')} />
          </View>
        ) : null}
      </View>
      <FeedbackSheet visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    backgroundColor: colors.page,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    zIndex: 20,
    ...Platform.select({
      web: { boxShadow: webShadows.soft } as object,
      default: {},
    }),
  },
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    minHeight: layout.headerHeight,
  },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '46%',
    zIndex: 2,
  },
  placeText: { minWidth: 0 },
  delivering: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  place: {
    color: colors.primaryText,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.small,
  },
  titleSlot: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: webShadows.soft, cursor: 'pointer' } as object,
      default: {},
    }),
  },
  searchSlot: {
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
  badgeText: { color: colors.white, fontSize: 9, fontFamily: fonts.heading },
});
