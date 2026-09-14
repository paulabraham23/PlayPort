import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AddressCard } from '@/components/address/AddressCard';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { HUB } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function AddressIndexScreen() {
  const { horizontalPadding } = useResponsive();
  const addresses = useAppStore((s) => s.addresses);
  const selectedAddressId = useAppStore((s) => s.selectedAddressId);
  const selectAddress = useAppStore((s) => s.selectAddress);
  const setDefaultAddress = useAppStore((s) => s.setDefaultAddress);

  return (
    <Screen showHeader={false}>
      <ScreenHeader
        title="Delivery Hubs"
        subtitle="Saved locations & rapid zones"
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Card style={styles.hubCard}>
          <View style={styles.hubTop}>
            <View style={styles.hubIcon}>
              <Ionicons name="flash" size={20} color={colors.playportOrange} />
            </View>
            <Badge
              label="ACTIVE SECTOR"
              color={colors.playportOrange}
              backgroundColor="#2A1A14"
            />
          </View>
          <Text style={styles.hubName}>{HUB.name}</Text>
          <Text style={styles.hubSector}>{HUB.sector}</Text>
          <Text style={styles.hubStatus}>{HUB.statusLabel}</Text>
          <View style={styles.hubMeta}>
            <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
            <Text style={styles.hubMetaText}>Avg ETA {HUB.etaMinutes}–45 min</Text>
          </View>
        </Card>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Saved Locations</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/address/add')}
            style={styles.addLink}
          >
            <Ionicons name="add" size={16} color={colors.playportOrange} />
            <Text style={styles.addLinkText}>Add New</Text>
          </Pressable>
        </View>

        {addresses.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title="No saved addresses"
            subtitle="Add a drop-off so we can route from your nearest dark hub."
            actionLabel="Add address"
            onAction={() => router.push('/address/add')}
          />
        ) : (
          <View style={styles.list}>
            {addresses.map((address) => {
              const selected = address.id === selectedAddressId;
              const actionLabel = address.inRapidZone
                ? selected
                  ? 'Set as Active'
                  : 'Deliver Here'
                : 'Schedule';
              return (
                <AddressCard
                  key={address.id}
                  address={address}
                  selected={selected}
                  onPress={() => selectAddress(address.id)}
                  onEdit={() => router.push(`/address/edit/${address.id}`)}
                  actionLabel={actionLabel}
                  onAction={() => {
                    if (address.inRapidZone) {
                      setDefaultAddress(address.id);
                      selectAddress(address.id);
                    } else {
                      selectAddress(address.id);
                    }
                  }}
                />
              );
            })}
          </View>
        )}

        <Card style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="hand-left-outline" size={22} color={colors.playportOrange} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.bannerTitle}>White-glove doorstep setup</Text>
            <Text style={styles.bannerBody}>
              Specialists unpack, calibrate, and demo every kit — then handle pickup when your slot ends.
            </Text>
          </View>
        </Card>

        <Button
          title="Add New Address"
          fullWidth
          icon={<Ionicons name="add-circle-outline" size={18} color={colors.white} />}
          onPress={() => router.push('/address/add')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  hubCard: { gap: spacing.sm, borderColor: colors.playportOrange },
  hubTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hubIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2A1A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubName: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22 },
  hubSector: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  hubStatus: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  hubMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  hubMetaText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 18 },
  addLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addLinkText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 14 },
  list: { gap: spacing.md },
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceElevated,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#2A1A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  bannerBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
