import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { OrderCard } from '@/components/orders/OrderCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { formatINR } from '@/utils/format';
import type { Order } from '@/types';

const ACTIVE_STATUSES = new Set([
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'active',
  'returning',
]);

type TabKey = 'active' | 'past';

export default function OrdersScreen() {
  const { horizontalPadding, isDesktop, gap } = useResponsive();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const orders = useAppStore((s) => s.orders);
  const [tab, setTab] = useState<TabKey>('active');
  const orderColumns = isDesktop ? 2 : 1;

  const { active, past } = useMemo(() => {
    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
    const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.has(o.status));
    return { active: activeOrders, past: pastOrders };
  }, [orders]);

  const list = tab === 'active' ? active : past;
  const live = active.find((o) => o.status === 'out_for_delivery' || o.liveDispatch);
  const visibleList = list.filter((o) => !(tab === 'active' && live && o.id === live.id));

  if (!isAuthenticated) {
    return (
      <Screen showCart={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        >
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Activity</Text>
            <Text style={styles.pageTitle}>Orders</Text>
          </View>
          <EmptyState
            title="Log in to see orders"
            subtitle="Your active rentals and past sessions show up here after you sign in."
            actionLabel="Log in"
            onAction={() => router.push({ pathname: '/(auth)/login', params: { next: '/(tabs)/orders' } })}
          />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen showCart={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Activity</Text>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Track live dispatch and past rentals</Text>
          <Badge label={`${orders.length} total`} color={colors.secondaryText} />
        </View>

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTab('active')}
            style={[styles.tab, tab === 'active' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
              Active & Upcoming
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTab('past')}
            style={[styles.tab, tab === 'past' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>Past Orders</Text>
          </Pressable>
        </View>

        {tab === 'active' && live ? <LiveDispatchCard order={live} /> : null}

        {tab === 'past' && past.length > 0 ? (
          <Text style={styles.sectionLabel}>Past Orders</Text>
        ) : null}

        {list.length === 0 ? (
          <EmptyState
            icon="cube-outline"
            title={tab === 'active' ? 'No active orders' : 'No past orders yet'}
            subtitle={
              tab === 'active'
                ? 'Book a kit and track live dispatch from here.'
                : 'Completed rentals will show up here.'
            }
            actionLabel="Browse kits"
            onAction={() => router.push('/(tabs)/explore')}
          />
        ) : (
          <ResponsiveGrid columns={orderColumns} gap={gap}>
            {visibleList.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/order/${order.id}`)}
                onTrack={() => router.push(`/order/track/${order.id}`)}
                onRentAgain={() => router.push('/(tabs)/explore')}
              />
            ))}
          </ResponsiveGrid>
        )}
      </ScrollView>
    </Screen>
  );
}

function LiveDispatchCard({ order }: { order: Order }) {
  const first = order.items[0];
  return (
    <Card style={styles.liveCard} padded elevated>
      <View style={styles.liveTop}>
        <Badge
          label="In progress"
          color={colors.success}
          backgroundColor={colors.successBg}
          left={<View style={styles.pulse} />}
        />
        <Text style={styles.liveId}>#{order.id}</Text>
      </View>
      <View style={styles.liveRow}>
        <Image source={{ uri: first.image }} style={styles.liveImage} contentFit="cover" />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.liveName} numberOfLines={2}>
            {first.name}
            {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
          </Text>
          <Text style={styles.liveMeta}>
            {order.riderName ? `${order.riderName} · ` : ''}
            {order.riderDistanceKm ? `${order.riderDistanceKm} km away` : `ETA ${order.etaLabel}`}
          </Text>
          <Text style={styles.livePrice}>{formatINR(order.total)}</Text>
        </View>
      </View>
      <View style={styles.progressBlock}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>En route</Text>
          <Text style={styles.progressPercent}>{order.progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${order.progressPercent}%` }]} />
        </View>
      </View>
      <View style={styles.liveActions}>
        <Button
          title="View Details"
          variant="secondary"
          size="sm"
          style={{ flex: 1 }}
          onPress={() => router.push(`/order/${order.id}`)}
        />
        <Button
          title="Track Live"
          size="sm"
          style={{ flex: 1 }}
          icon={<Ionicons name="navigate" size={14} color={colors.white} />}
          onPress={() => router.push(`/order/track/${order.id}`)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  titleBlock: { gap: spacing.sm },
  eyebrow: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pageTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.display,
    letterSpacing: -0.4,
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.display,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.orangeTint },
  tabText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  tabTextActive: { color: colors.playportOrange },
  sectionLabel: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: -spacing.sm,
  },
  liveCard: {
    gap: spacing.lg,
  },
  liveTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  liveId: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.small },
  liveRow: { flexDirection: 'row', gap: 12 },
  liveImage: {
    width: 76,
    height: 76,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  liveName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.bodyLg },
  liveMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  livePrice: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.bodyLg },
  progressBlock: { gap: spacing.sm },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  progressPercent: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.playportOrange,
    borderRadius: 2,
  },
  liveActions: { flexDirection: 'row', gap: 8 },
});
