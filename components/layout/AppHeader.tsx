import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet';
import { PressableScale } from '@/components/motion/PressableScale';
import { PulseOnChange } from '@/components/motion/Pulse';
import { SearchBar } from '@/components/search/SearchBar';
import { PlayPortWordmark } from '@/components/brand/PlayPortWordmark';
import { colors, fonts, layout, radii, spacing, typeScale, webShadows } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartCount } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { ensureLoggedIn } from '@/utils/authGate';

interface Props {
  showCart?: boolean;
  showSearch?: boolean;
  showDelivery?: boolean;
  showFeedback?: boolean;
  pageTitle?: string;
  rightSlot?: React.ReactNode;
}

export function AppHeader({
  showCart = false,
  showSearch = false,
  showDelivery = true,
  showFeedback = true,
  pageTitle,
  rightSlot,
}: Props) {
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
    ? [selectedAddress.line1, selectedAddress.line2, selectedAddress.area, selectedAddress.city]
        .map((part) => part?.trim())
        .filter((part, index, all): part is string => Boolean(part) && all.indexOf(part) === index)
        .join(', ')
    : hub?.city && hub.city !== '—'
      ? hub.city
      : 'your address';

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.wrap,
          { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%' },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.brandBlock}>
            <PlayPortWordmark size={pageTitle ? 22 : 26} />
            {showDelivery ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delivering to ${place}`}
                onPress={() => {
                  if (!isAuthenticated) {
                    ensureLoggedIn('/address');
                    return;
                  }
                  router.push('/address');
                }}
                style={styles.placeBtn}
              >
                <Text style={styles.delivering} numberOfLines={2}>
                  Delivering to <Text style={styles.place}>{place}</Text>
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.actions}>
            {rightSlot}
            {showFeedback ? (
              <PressableScale
                accessibilityLabel="Send feedback"
                onPress={() => setFeedbackOpen(true)}
                scaleTo={0.94}
                style={styles.iconBtn}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primaryText} />
              </PressableScale>
            ) : null}
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

        {pageTitle ? (
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle} numberOfLines={1}>
              {pageTitle}
            </Text>
          </View>
        ) : null}

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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  brandBlock: {
    flexShrink: 1,
    maxWidth: '72%',
    gap: 2,
    zIndex: 2,
  },
  placeBtn: {
    flexShrink: 1,
  },
  delivering: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    flexShrink: 1,
  },
  place: {
    color: colors.primaryText,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.body,
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  pageTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 36,
    letterSpacing: -0.8,
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
