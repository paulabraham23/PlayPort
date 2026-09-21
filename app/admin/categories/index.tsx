import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';
import type { Category } from '@/types';

const EMPTY: Category = {
  id: '',
  name: '',
  shortName: '',
  description: '',
  accent: '#F97316',
  icon: 'game-controller-outline',
  setupsReady: 0,
  etaMinutes: 30,
  image: '',
};

export default function AdminCategoriesScreen() {
  const { horizontalPadding } = useResponsive();
  const categories = useAdminStore((s) => s.categories);
  const saveCategory = useAdminStore((s) => s.saveCategory);
  const removeCategory = useAdminStore((s) => s.removeCategory);
  const [form, setForm] = useState<Category>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startCreate = () => {
    setEditingId('new');
    setForm(EMPTY);
    setError(null);
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ ...c });
    setError(null);
  };

  const onSave = async () => {
    const id = (editingId === 'new' ? form.id : editingId)?.trim();
    if (!id || !form.name.trim()) {
      setError('ID and name are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveCategory({
        ...form,
        id,
        shortName: form.shortName.trim() || form.name.trim(),
      });
      setEditingId(null);
      setForm(EMPTY);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <View style={adminStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={adminStyles.title}>Categories</Text>
          <Text style={adminStyles.subtitle}>{categories.length} shop categories</Text>
        </View>
        <Button title="New category" size="sm" onPress={startCreate} />
      </View>

      {editingId ? (
        <View style={adminStyles.card}>
          <Text style={adminStyles.cardTitle}>
            {editingId === 'new' ? 'New category' : `Edit ${editingId}`}
          </Text>
          {(
            [
              ['id', 'ID (slug)', editingId === 'new'],
              ['name', 'Name', true],
              ['shortName', 'Short name', true],
              ['description', 'Description', true],
              ['accent', 'Accent color', true],
              ['icon', 'Icon (Ionicons name)', true],
              ['image', 'Image URL', true],
            ] as const
          ).map(([key, label, show]) =>
            show ? (
              <View key={key} style={adminStyles.field}>
                <Text style={adminStyles.label}>{label}</Text>
                <TextInput
                  style={[
                    adminStyles.input,
                    key === 'description' && { minHeight: 72, textAlignVertical: 'top' },
                  ]}
                  value={String(form[key] ?? '')}
                  onChangeText={(t) =>
                    setForm((f) => ({
                      ...f,
                      [key]:
                        key === 'id'
                          ? t.trim().toLowerCase().replace(/\s+/g, '-')
                          : t,
                    }))
                  }
                  multiline={key === 'description'}
                  autoCapitalize={key === 'id' || key === 'image' || key === 'icon' ? 'none' : 'sentences'}
                  placeholderTextColor={colors.mutedText}
                  editable={key !== 'id' || editingId === 'new'}
                />
              </View>
            ) : null
          )}
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Setups ready</Text>
            <TextInput
              style={adminStyles.input}
              keyboardType="numeric"
              value={String(form.setupsReady ?? 0)}
              onChangeText={(t) =>
                setForm((f) => ({ ...f, setupsReady: Number(t.replace(/[^0-9]/g, '')) || 0 }))
              }
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>ETA minutes</Text>
            <TextInput
              style={adminStyles.input}
              keyboardType="numeric"
              value={String(form.etaMinutes ?? 30)}
              onChangeText={(t) =>
                setForm((f) => ({ ...f, etaMinutes: Number(t.replace(/[^0-9]/g, '')) || 30 }))
              }
              placeholderTextColor={colors.mutedText}
            />
          </View>
          {error ? <Text style={adminStyles.error}>{error}</Text> : null}
          <View style={adminStyles.row}>
            <Button title="Cancel" variant="ghost" size="sm" onPress={() => setEditingId(null)} />
            <Button
              title={saving ? 'Saving…' : 'Save'}
              size="sm"
              disabled={saving}
              onPress={() => void onSave()}
            />
          </View>
        </View>
      ) : null}

      {categories.map((c) => (
        <View key={c.id} style={adminStyles.card}>
          <Text style={adminStyles.cardTitle}>{c.name}</Text>
          <Text style={adminStyles.cardMeta}>
            {c.id} · {c.shortName} · ETA {c.etaMinutes}m · {c.setupsReady} setups
          </Text>
          <View style={adminStyles.row}>
            <Button title="Edit" size="sm" variant="secondary" onPress={() => startEdit(c)} />
            <Button
              title="Delete"
              size="sm"
              variant="danger"
              onPress={() => {
                if (typeof window !== 'undefined' && !window.confirm(`Delete ${c.id}?`)) return;
                void removeCategory(c.id);
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
