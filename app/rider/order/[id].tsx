import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { riderGetOrder } from '@/lib/riderFirestore';
import { useRiderStore } from '@/store/riderStore';
import type { Order, OrderStatus } from '@/types';
import { orderStatusLabel } from '@/utils/format';

const RIDER_NEXT: Record<string, { status: OrderStatus; label: string }[]> = {
  out_for_delivery: [{ status: 'delivered', label: 'Mark delivered / setup done' }],
  delivered: [
    { status: 'active', label: 'Customer using kit' },
    { status: 'returning', label: 'Start return pickup' },
  ],
  active: [{ status: 'returning', label: 'Start return pickup' }],
  returning: [{ status: 'completed', label: 'Return complete' }],
};

export default function RiderOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const rider = useRiderStore((s) => s.rider);
  const accept = useRiderStore((s) => s.accept);
  const setStatus = useRiderStore((s) => s.setStatus);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      setOrder(await riderGetOrder(id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [id]);

  const mapsUrl = order?.addressFull
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.addressFull)}`
    : null;

  const isMine = order?.riderId && rider && order.riderId === rider.id;
  const canClaim = order && !order.riderId && ['confirmed', 'preparing'].includes(order.status);
  const next = order ? RIDER_NEXT[order.status] ?? [] : [];

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.page, styles.center]}>
        <ActivityIndicator color={colors.playportOrange} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.page, { padding: spacing.xl }]}>
        <Text style={styles.empty}>Order not found.</Text>
        <Button title="Back" size="sm" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
    >
      <Button title="← Back" size="sm" variant="ghost" onPress={() => router.back()} />
      <View style={styles.row}>
        <Text style={[styles.title, { flex: 1 }]}>{order.id}</Text>
        <StatusBadge status={order.status} label={orderStatusLabel(order.status)} />
      </View>
      <Text style={styles.sub}>
        Hub {order.hubId ?? '—'} · payment {order.paymentStatus ?? '—'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Drop-off</Text>
        <Text style={styles.meta}>{order.addressFull || order.addressLabel}</Text>
        <Text style={styles.meta}>ETA {order.etaLabel}</Text>
        {mapsUrl ? (
          <Button
            title="Open in Maps"
            size="sm"
            variant="secondary"
            onPress={() => void Linking.openURL(mapsUrl)}
          />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items</Text>
        {order.items?.map((item, idx) => (
          <Text key={`${item.name}-${idx}`} style={styles.meta}>
            {item.name} · {item.durationLabel} · ₹{item.price}
          </Text>
        ))}
        <Text style={[styles.meta, { marginTop: 8 }]}>Total ₹{order.total}</Text>
      </View>

      {order.riderName ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned rider</Text>
          <Text style={styles.meta}>
            {order.riderName}
            {order.riderPhone ? ` · ${order.riderPhone}` : ''}
          </Text>
        </View>
      ) : null}

      {isMine && (order.status === 'out_for_delivery' || order.status === 'returning') ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer ETA</Text>
          <Text style={styles.meta}>
            {order.etaMinutes != null ? `About ${order.etaMinutes} min` : 'Getting location…'}
            {order.riderDistanceKm != null ? ` · ${order.riderDistanceKm} km` : ''}
          </Text>
          <Text style={styles.meta}>
            Keep this screen open (or the app in foreground) so GPS updates their countdown. No map
            is shared with the customer.
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>
        {canClaim ? (
          <Button
            title={busy ? 'Accepting…' : 'Accept this run'}
            size="sm"
            disabled={busy}
            onPress={() => void run(() => accept(order.id))}
          />
        ) : null}
        {isMine && next.length > 0
          ? next.map((action) => (
              <Button
                key={action.status}
                title={busy ? 'Updating…' : action.label}
                size="sm"
                disabled={busy}
                onPress={() => void run(() => setStatus(order.id, action.status))}
              />
            ))
          : null}
        {isMine && next.length === 0 ? (
          <Text style={styles.meta}>No further rider actions for this status.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  center: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.heading, fontSize: typeScale.headline, color: colors.primaryText },
  sub: { fontFamily: fonts.body, fontSize: typeScale.body, color: colors.secondaryText },
  empty: { fontFamily: fonts.body, color: colors.mutedText },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 8,
  },
  cardTitle: { fontFamily: fonts.heading, fontSize: typeScale.title, color: colors.primaryText },
  meta: { fontFamily: fonts.body, fontSize: typeScale.small, color: colors.secondaryText, lineHeight: 18 },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: typeScale.body },
});
