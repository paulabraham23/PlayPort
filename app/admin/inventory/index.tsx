import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';
import type { InventoryUnit, InventoryUnitStatus } from '@/types';

const STATUSES: InventoryUnitStatus[] = ['available', 'maintenance', 'retired'];

export default function AdminInventoryScreen() {
  const { horizontalPadding } = useResponsive();
  const units = useAdminStore((s) => s.units);
  const products = useAdminStore((s) => s.products);
  const hubs = useAdminStore((s) => s.hubs);
  const saveUnit = useAdminStore((s) => s.saveUnit);
  const setUnitStatus = useAdminStore((s) => s.setUnitStatus);
  const removeUnit = useAdminStore((s) => s.removeUnit);

  const [hubFilter, setHubFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productId, setProductId] = useState('');
  const [hubId, setHubId] = useState('');
  const [skuSuffix, setSkuSuffix] = useState('001');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (hubFilter !== 'all' && u.hubId !== hubFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [units, hubFilter, statusFilter]);

  const defaultHub = hubs[0]?.id ?? 'indiranagar';
  const defaultProduct = products[0]?.id ?? '';

  const onCreate = async () => {
    setError(null);
    const pid = (productId || defaultProduct).trim();
    const hid = (hubId || defaultHub).trim();
    if (!pid || !hid) {
      setError('Pick a product and hub');
      return;
    }
    const product = products.find((p) => p.id === pid);
    const n = skuSuffix.padStart(3, '0');
    const id = `${pid}-${n}`;
    const skuLabel = `${(product?.shortName ?? pid).toUpperCase().replace(/\s+/g, '-')}-${n}`;
    const now = new Date().toISOString();
    const unit: InventoryUnit = {
      id,
      productId: pid,
      hubId: hid,
      skuLabel,
      status: 'available',
      createdAt: now,
      updatedAt: now,
    };
    try {
      await saveUnit(unit);
      setSkuSuffix(String(Number(n) + 1).padStart(3, '0'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  };

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>Inventory</Text>
      <Text style={adminStyles.subtitle}>{units.length} units · {filtered.length} shown</Text>

      <View style={adminStyles.card}>
        <Text style={adminStyles.cardTitle}>Add unit</Text>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Product ID</Text>
          <TextInput
            style={adminStyles.input}
            value={productId || defaultProduct}
            onChangeText={setProductId}
            placeholder={defaultProduct || 'product-id'}
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Hub ID</Text>
          <TextInput
            style={adminStyles.input}
            value={hubId || defaultHub}
            onChangeText={setHubId}
            placeholder={defaultHub}
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Unit number</Text>
          <TextInput
            style={adminStyles.input}
            value={skuSuffix}
            onChangeText={setSkuSuffix}
            placeholder="001"
            placeholderTextColor={colors.mutedText}
            keyboardType="numeric"
          />
        </View>
        {error ? <Text style={adminStyles.error}>{error}</Text> : null}
        <Button title="Create unit" size="sm" onPress={() => void onCreate()} />
      </View>

      <View style={adminStyles.row}>
        <Pressable
          style={[adminStyles.chip, hubFilter === 'all' && adminStyles.chipActive]}
          onPress={() => setHubFilter('all')}
        >
          <Text style={[adminStyles.chipText, hubFilter === 'all' && adminStyles.chipTextActive]}>All hubs</Text>
        </Pressable>
        {hubs.map((h) => (
          <Pressable
            key={h.id}
            style={[adminStyles.chip, hubFilter === h.id && adminStyles.chipActive]}
            onPress={() => setHubFilter(h.id)}
          >
            <Text style={[adminStyles.chipText, hubFilter === h.id && adminStyles.chipTextActive]}>
              {h.city || h.id}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={adminStyles.row}>
        <Pressable
          style={[adminStyles.chip, statusFilter === 'all' && adminStyles.chipActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[adminStyles.chipText, statusFilter === 'all' && adminStyles.chipTextActive]}>
            All status
          </Text>
        </Pressable>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[adminStyles.chip, statusFilter === s && adminStyles.chipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[adminStyles.chipText, statusFilter === s && adminStyles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <Text style={adminStyles.empty}>No units.</Text>
      ) : (
        filtered.map((u) => (
          <View key={u.id} style={adminStyles.card}>
            <Text style={adminStyles.cardTitle}>{u.skuLabel}</Text>
            <Text style={adminStyles.cardMeta}>
              {u.id} · {u.productId} · hub {u.hubId} · {u.status}
            </Text>
            <View style={adminStyles.row}>
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  title={s}
                  size="sm"
                  variant={u.status === s ? 'primary' : 'secondary'}
                  onPress={() => void setUnitStatus(u.id, s)}
                />
              ))}
              <Button
                title="Delete"
                size="sm"
                variant="danger"
                onPress={() => {
                  if (typeof window !== 'undefined' && !window.confirm(`Delete ${u.id}?`)) return;
                  void removeUnit(u.id);
                }}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
