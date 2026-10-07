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

function DeliveryPlace({
  place,
  onPress,
  align = 'left',
}: {
  place: string;
  onPress: () => void;
  align?: 'left' | 'center';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Delivering to ${place}`}
      onPress={onPress}
      style={[styles.placeBtn, align === 'center' && styles.placeBtnCenter]}
    >
      <View style={styles.pinWrap}>
        <Ionicons name="location" size={15} color={colors.playportOrange} />
      </View>
      <View style={styles.placeCopy}>
        <Text style={styles.deliveringLabel}>Delivering to</Text>
        <View style={styles.placeRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.primaryText} />
        </View>
      </View>
    </Pressable>
  );
}

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
  // Dynamic drop location: selected address → hub city → prompt to set one.
  const selected =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0];
  const place = selected
    ? `${selected.label} · ${selected.area || selected.city}`
    : hub?.city && hub.city !== '—'
      ? hub.city
      : 'Set location';

  const openAddress = () => {
    if (!isAuthenticated) {
      ensureLoggedIn('/address');
      return;
    }
    router.push('/address');
  };

  return (
    <View style={styles.outer}>
      <View
        style={[
          pageTitle ? styles.wrapCompact : styles.wrapHome,
          { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%' },
        ]}
      >
        <View style={[styles.topRow, pageTitle && styles.topRowCompact]}>
          {pageTitle ? (
            <Text style={styles.pageTitle} numberOfLines={1}>
              {pageTitle}
            </Text>
          ) : (
            <View style={styles.brandBlock}>
              <PlayPortWordmark size={26} />
              {showDelivery ? <DeliveryPlace place={place} onPress={openAddress} /> : null}
            </View>
          )}

          <View style={[styles.actions, pageTitle && styles.actionsOverlay]}>
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

        {pageTitle && showDelivery ? (
          <DeliveryPlace place={place} onPress={openAddress} align="center" />
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
  wrapHome: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    minHeight: layout.headerHeight,
  },
  wrapCompact: {
    paddingTop: 12,
    paddingBottom: 12,
    gap: 2,
    minHeight: 56,
  },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  topRowCompact: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    flexShrink: 1,
    maxWidth: '72%',
    gap: 2,
    zIndex: 2,
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    flexShrink: 1,
    maxWidth: '100%',
    marginTop: 2,
  },
  placeBtnCenter: {
    alignSelf: 'center',
  },
  pinWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeCopy: {
    flexShrink: 1,
    minWidth: 0,
  },
  deliveringLabel: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: '100%',
  },
  placeName: {
    color: colors.primaryText,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.body,
    flexShrink: 1,
  },
  pageTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 32,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  actionsOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
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
