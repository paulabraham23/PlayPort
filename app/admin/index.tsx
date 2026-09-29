import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';

export default function AdminOverviewScreen() {
  const { horizontalPadding } = useResponsive();
  const loading = useAdminStore((s) => s.loading);
  const counts = useAdminStore((s) => s.counts);
  const config = useAdminStore((s) => s.config);
  const error = useAdminStore((s) => s.error);
  const hydrateAll = useAdminStore((s) => s.hydrateAll);

  const cards = [
    { label: 'Products', value: counts?.products ?? '—', href: '/admin/products' },
    { label: 'Combos', value: counts?.experiences ?? '—', href: '/admin/combos' },
    { label: 'Categories', value: counts?.categories ?? '—', href: '/admin/categories' },
    {
      label: 'Available units',
      value: counts ? `${counts.availableUnits}/${counts.totalUnits}` : '—',
      href: '/admin/inventory',
    },
    { label: 'Open deliveries', value: counts?.openOrders ?? '—', href: '/admin/orders' },
    { label: 'Hubs', value: counts?.hubs ?? '—', href: '/admin/hubs' },
    { label: 'Reviews', value: counts?.reviews ?? '—', href: '/admin/reviews' },
    { label: 'Feedback', value: 'Inbox', href: '/admin/feedback' },
    { label: 'Settings', value: config.maintenanceMode ? 'Maint.' : 'Live', href: '/admin/settings' },
  ];

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <View style={adminStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={adminStyles.title}>Overview</Text>
          <Text style={adminStyles.subtitle}>Full catalog, inventory, customers, and ops knobs</Text>
        </View>
        <Pressable style={styles.refresh} onPress={() => void hydrateAll()}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {config.maintenanceMode ? (
        <View style={styles.warn}>
          <Text style={styles.warnTitle}>Maintenance mode is ON</Text>
          <Text style={styles.warnBody}>{config.maintenanceMessage}</Text>
        </View>
      ) : null}

      {error ? <Text style={adminStyles.error}>{error}</Text> : null}
      {loading && !counts ? (
        <ActivityIndicator color={colors.playportOrange} style={{ marginTop: spacing.xxl }} />
      ) : (
        <View style={styles.grid}>
          {cards.map((c) => (
            <Pressable key={c.label} style={styles.statCard} onPress={() => router.push(c.href as never)}>
              <Text style={styles.statValue}>{c.value}</Text>
              <Text style={styles.statLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  refresh: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  refreshText: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    color: colors.primaryText,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    color: colors.primaryText,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.secondaryText,
  },
  warn: {
    backgroundColor: colors.orangeTint,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.playportOrange,
    padding: spacing.lg,
    gap: 6,
  },
  warnTitle: {
    fontFamily: fonts.bodyMedium,
    color: colors.playportOrange,
    fontSize: typeScale.body,
  },
  warnBody: {
    fontFamily: fonts.body,
    color: colors.secondaryText,
    fontSize: typeScale.small,
  },
});
