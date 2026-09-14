import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AddressCard } from '@/components/address/AddressCard';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

/** Thin profile entry that lists addresses and deep-links into /address flows. */
export default function ProfileAddressesScreen() {
  const { horizontalPadding } = useResponsive();
  const addresses = useAppStore((s) => s.addresses);
  const selectedAddressId = useAppStore((s) => s.selectedAddressId);

  return (
    <Screen showHeader={false}>
      <ScreenHeader
        title="Saved Addresses"
        subtitle="Manage drop-off locations"
        onBack={() => router.back()}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/address')}
            hitSlop={8}
          >
            <Text style={styles.hubLink}>Hubs</Text>
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/address')}
          style={styles.banner}
        >
          <Ionicons name="flash-outline" size={18} color={colors.playportOrange} />
          <Text style={styles.bannerText}>Open Delivery Hubs & rapid zones</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedText} />
        </Pressable>

        {addresses.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title="No addresses yet"
            subtitle="Add a location to unlock express routing."
            actionLabel="Add address"
            onAction={() => router.push('/address/add')}
          />
        ) : (
          <View style={styles.list}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                selected={address.id === selectedAddressId}
                onPress={() => router.push('/address')}
                onEdit={() => router.push(`/address/edit/${address.id}`)}
                actionLabel="Manage"
                onAction={() => router.push('/address')}
              />
            ))}
          </View>
        )}

        <Button
          title="Add New Address"
          fullWidth
          onPress={() => router.push('/address/add')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  hubLink: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 14 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  bannerText: { flex: 1, color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  list: { gap: spacing.md },
});
