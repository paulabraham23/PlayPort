import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';
import { cheapestPlanPrice, normalizeProduct } from '@/utils/rentalPricing';

export default function AdminProductsScreen() {
  const { horizontalPadding } = useResponsive();
  const products = useAdminStore((s) => s.products);
  const error = useAdminStore((s) => s.error);
  const removeProduct = useAdminStore((s) => s.removeProduct);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.id.toLowerCase().includes(needle) ||
        p.shortName.toLowerCase().includes(needle)
    );
  }, [products, q]);

  const onDelete = async (id: string, label: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Permanently delete ${label}?`)) return;
    setBusyId(id);
    setLocalError(null);
    try {
      await removeProduct(id);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <View style={adminStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={adminStyles.title}>Products</Text>
          <Text style={adminStyles.subtitle}>{products.length} in catalog</Text>
        </View>
        <Button title="New product" size="sm" onPress={() => router.push('/admin/products/new' as never)} />
      </View>

      {error || localError ? (
        <Text style={adminStyles.error}>{localError || error}</Text>
      ) : null}

      <TextInput
        style={adminStyles.input}
        placeholder="Search products…"
        placeholderTextColor={colors.mutedText}
        value={q}
        onChangeText={setQ}
      />

      {filtered.length === 0 ? (
        <Text style={adminStyles.empty}>
          {products.length === 0
            ? 'No products in Firestore. Add one to publish the catalog.'
            : 'No products match.'}
        </Text>
      ) : (
        filtered.map((p) => {
          const n = normalizeProduct(p);
          const from = cheapestPlanPrice(n);
          return (
            <View key={p.id} style={adminStyles.card}>
              <Pressable onPress={() => router.push(`/admin/products/${p.id}` as never)}>
                <Text style={adminStyles.cardTitle}>{p.shortName || p.name}</Text>
                <Text style={adminStyles.cardMeta}>
                  {p.id} · {p.categoryId} · {n.plans.length} plans
                  {from != null ? ` · from ₹${from}` : ''}
                  {n.hourly?.enabled ? ' · hourly' : ''}
                  {(n.addons?.length ?? 0) > 0 ? ` · ${n.addons!.length} add-ons` : ''}
                </Text>
              </Pressable>
              <View style={[adminStyles.row, { marginTop: 8 }]}>
                <Button
                  title="Edit"
                  size="sm"
                  variant="secondary"
                  onPress={() => router.push(`/admin/products/${p.id}` as never)}
                />
                <Button
                  title={busyId === p.id ? 'Deleting…' : 'Delete'}
                  size="sm"
                  variant="danger"
                  disabled={busyId === p.id}
                  onPress={() => void onDelete(p.id, p.shortName || p.id)}
                />
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
