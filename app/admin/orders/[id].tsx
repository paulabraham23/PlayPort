import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { adminGetOrder, adminNextStatuses } from '@/lib/adminFirestore';
import { adminAssignRider, riderListRiders } from '@/lib/riderFirestore';
import { useAdminStore } from '@/store/adminStore';
import type { Order, OrderStatus, Rider } from '@/types';
import { orderStatusLabel } from '@/utils/format';

export default function AdminOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const advanceOrder = useAdminStore((s) => s.advanceOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [o, r] = await Promise.all([adminGetOrder(id), riderListRiders()]);
      setOrder(o);
      setRiders(r.filter((x) => x.active));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [id]);

  const onAdvance = async (status: OrderStatus) => {
    setError(null);
    setBusy(true);
    try {
      await advanceOrder(id, status);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const onAssign = async (rider: Rider) => {
    setError(null);
    setBusy(true);
    try {
      await adminAssignRider(id, rider);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={[adminStyles.page, { paddingTop: spacing.xxl, alignItems: 'center' }]}>
        <ActivityIndicator color={colors.playportOrange} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[adminStyles.page, { padding: spacing.xl }]}>
        <Text style={adminStyles.empty}>Order not found.</Text>
        <Button title="Back" size="sm" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  const next = adminNextStatuses(order.status);

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Button title="← Deliveries" size="sm" variant="ghost" onPress={() => router.back()} />
      <View style={adminStyles.row}>
        <Text style={[adminStyles.title, { flex: 1 }]}>{order.id}</Text>
        <StatusBadge status={order.status} label={orderStatusLabel(order.status)} />
      </View>
      <Text style={adminStyles.subtitle}>
        {order.addressFull || order.addressLabel} · payment {order.paymentStatus ?? '—'}
      </Text>

      <View style={adminStyles.card}>
        <Text style={adminStyles.cardTitle}>Items</Text>
        {order.items?.map((item, idx) => (
          <View key={`${item.name}-${idx}`} style={{ marginBottom: 8 }}>
            <Text style={adminStyles.cardMeta}>
              {item.name} · {item.durationLabel} · ₹{item.price}
            </Text>
            {item.extras?.map((extra) => (
              <Text key={extra} style={adminStyles.cardMeta}>
                {extra}
              </Text>
            ))}
          </View>
        ))}
        <Text style={[adminStyles.cardMeta, { marginTop: 8 }]}>
          Total ₹{order.total} · hub {order.hubId ?? '—'} · progress {order.progressPercent}%
        </Text>
      </View>

      <View style={adminStyles.card}>
        <Text style={adminStyles.cardTitle}>Rider</Text>
        {order.riderName ? (
          <Text style={adminStyles.cardMeta}>
            {order.riderName}
            {order.riderPhone ? ` · ${order.riderPhone}` : ''}
          </Text>
        ) : (
          <Text style={adminStyles.cardMeta}>Unassigned — pick a rider below</Text>
        )}
        <View style={adminStyles.row}>
          {riders.length === 0 ? (
            <Text style={adminStyles.cardMeta}>No active riders. Add one under Admin → Riders.</Text>
          ) : (
            riders.map((r) => (
              <Button
                key={r.id}
                title={r.name}
                size="sm"
                variant={order.riderId === r.id ? 'primary' : 'secondary'}
                disabled={busy}
                onPress={() => void onAssign(r)}
              />
            ))
          )}
        </View>
      </View>

      <View style={adminStyles.card}>
        <Text style={adminStyles.cardTitle}>Advance status</Text>
        {next.length === 0 ? (
          <Text style={adminStyles.cardMeta}>No further transitions.</Text>
        ) : (
          <View style={adminStyles.row}>
            {next.map((s) => (
              <Button
                key={s}
                title={orderStatusLabel(s)}
                size="sm"
                variant={s === 'cancelled' || s === 'refunded' ? 'danger' : 'primary'}
                disabled={busy}
                onPress={() => void onAdvance(s)}
              />
            ))}
          </View>
        )}
        {error ? <Text style={adminStyles.error}>{error}</Text> : null}
      </View>
    </ScrollView>
  );
}
