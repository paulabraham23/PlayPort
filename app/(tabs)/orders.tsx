import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { OrderCard } from '@/components/orders/OrderCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
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
  const { horizontalPadding } = useResponsive();
  const orders = useAppStore((s) => s.orders);
  const [tab, setTab] = useState<TabKey>('active');

  const { active, past } = useMemo(() => {
    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
    const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.has(o.status));
    return { active: activeOrders, past: pastOrders };
  }, [orders]);

  const list = tab === 'active' ? active : past;
  const live = active.find((o) => o.status === 'out_for_delivery' || o.liveDispatch);

  return (
    <Screen showCart={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Orders</Text>
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
          <View style={styles.list}>
            {list
              .filter((o) => !(tab === 'active' && live && o.id === live.id))
              .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/order/${order.id}`)}
                  onTrack={() => router.push(`/order/track/${order.id}`)}
                  onRentAgain={() => router.push('/(tabs)/explore')}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function LiveDispatchCard({ order }: { order: Order }) {
  const first = order.items[0];
  return (
    <Card style={styles.liveCard} padded>
      <View style={styles.liveTop}>
        <Badge
          label="LIVE DISPATCH"
          color={colors.playportOrange}
          backgroundColor="#2A1A14"
          left={<View style={styles.pulse} />}
        />
        <Text style={styles.liveId}>#{order.id}</Text>
      </View>
      <View style={styles.liveRow}>
        <Image source={{ uri: first.image }} style={styles.liveImage} contentFit="cover" />
        <View style={{ flex: 1, gap: 4 }}>
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
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${order.progressPercent}%` }]} />
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 28 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.playportOrange },
  tabText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { gap: spacing.md },
  liveCard: {
    borderColor: colors.playportOrange,
    gap: spacing.md,
  },
  liveTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.playportOrange },
  liveId: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 12 },
  liveRow: { flexDirection: 'row', gap: 12 },
  liveImage: { width: 72, height: 72, borderRadius: radii.sm },
  liveName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  liveMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  livePrice: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 15 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.playportOrange,
    borderRadius: 3,
  },
  liveActions: { flexDirection: 'row', gap: 8 },
});
