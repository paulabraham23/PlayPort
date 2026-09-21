import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { adminGetExperience } from '@/lib/adminFirestore';
import { useAdminStore } from '@/store/adminStore';
import type { Experience } from '@/types';

const EMPTY: Experience = {
  id: '',
  name: '',
  description: '',
  categoryId: 'party-social',
  image: '',
  price: 0,
  durationLabel: '12h',
  etaMinutes: 30,
  tag: 'COMBO',
  chips: [],
  people: '2–4',
  includes: [],
  productIds: [],
  howItWorks: [],
};

export default function AdminComboEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { horizontalPadding } = useResponsive();
  const saveExperience = useAdminStore((s) => s.saveExperience);
  const products = useAdminStore((s) => s.products);
  const categories = useAdminStore((s) => s.categories);
  const [form, setForm] = useState<Experience>(EMPTY);
  const [chipsText, setChipsText] = useState('');
  const [includesText, setIncludesText] = useState('');
  const [howText, setHowText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY);
      setChipsText('');
      setIncludesText('');
      setHowText('');
      return;
    }
    void (async () => {
      const e = await adminGetExperience(id);
      if (e) {
        setForm(e);
        setChipsText((e.chips ?? []).join(', '));
        setIncludesText((e.includes ?? []).join('\n'));
        setHowText((e.howItWorks ?? []).join('\n'));
      }
    })();
  }, [id, isNew]);

  const setField = <K extends keyof Experience>(key: K, value: Experience[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => {
      const has = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: has
          ? prev.productIds.filter((p) => p !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const onSave = async () => {
    setError(null);
    const eid = (isNew ? form.id : id).trim();
    if (!eid || !form.name.trim()) {
      setError('ID and name are required');
      return;
    }
    setSaving(true);
    try {
      await saveExperience({
        ...form,
        id: eid,
        chips: chipsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        includes: includesText
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        howItWorks: howText
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.replace('/admin/combos' as never);
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
      <Text style={adminStyles.title}>{isNew ? 'New combo' : 'Edit combo'}</Text>
      <Text style={adminStyles.subtitle}>Full experience / bundle parameters</Text>

      {isNew ? (
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>ID (slug)</Text>
          <TextInput
            style={adminStyles.input}
            value={form.id}
            onChangeText={(t) => setField('id', t.trim().toLowerCase().replace(/\s+/g, '-'))}
            autoCapitalize="none"
            placeholderTextColor={colors.mutedText}
          />
        </View>
      ) : null}

      {(
        [
          ['name', 'Name'],
          ['description', 'Description'],
          ['image', 'Image URL'],
          ['tag', 'Tag'],
          ['durationLabel', 'Duration label'],
          ['people', 'People'],
          ['categoryId', 'Category ID'],
        ] as const
      ).map(([key, label]) => (
        <View key={key} style={adminStyles.field}>
          <Text style={adminStyles.label}>{label}</Text>
          <TextInput
            style={[adminStyles.input, key === 'description' && { minHeight: 88, textAlignVertical: 'top' }]}
            value={String(form[key] ?? '')}
            onChangeText={(t) => setField(key, t as never)}
            multiline={key === 'description'}
            autoCapitalize={key === 'image' || key === 'categoryId' ? 'none' : 'sentences'}
            placeholderTextColor={colors.mutedText}
          />
        </View>
      ))}

      {categories.length ? (
        <View style={adminStyles.row}>
          {categories.map((c) => (
            <Button
              key={c.id}
              title={c.shortName || c.id}
              size="sm"
              variant={form.categoryId === c.id ? 'primary' : 'secondary'}
              onPress={() => setField('categoryId', c.id)}
            />
          ))}
        </View>
      ) : null}

      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Price (₹)</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={String(form.price ?? 0)}
          onChangeText={(t) => setField('price', Number(t.replace(/[^0-9]/g, '')) || 0)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>ETA minutes</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={String(form.etaMinutes ?? 30)}
          onChangeText={(t) => setField('etaMinutes', Number(t.replace(/[^0-9]/g, '')) || 30)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Chips (comma-separated)</Text>
        <TextInput
          style={adminStyles.input}
          value={chipsText}
          onChangeText={setChipsText}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Includes (one per line)</Text>
        <TextInput
          style={[adminStyles.input, { minHeight: 88, textAlignVertical: 'top' }]}
          value={includesText}
          onChangeText={setIncludesText}
          multiline
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>How it works (one step per line)</Text>
        <TextInput
          style={[adminStyles.input, { minHeight: 88, textAlignVertical: 'top' }]}
          value={howText}
          onChangeText={setHowText}
          multiline
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Linked products</Text>
      <View style={adminStyles.row}>
        {products.map((p) => {
          const on = form.productIds.includes(p.id);
          return (
            <Pressable
              key={p.id}
              style={[adminStyles.chip, on && adminStyles.chipActive]}
              onPress={() => toggleProduct(p.id)}
            >
              <Text style={[adminStyles.chipText, on && adminStyles.chipTextActive]}>
                {p.shortName || p.id}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={adminStyles.error}>{error}</Text> : null}
      <View style={adminStyles.row}>
        <Button title="Cancel" variant="ghost" size="sm" onPress={() => router.back()} />
        <Button
          title={saving ? 'Saving…' : 'Save combo'}
          size="sm"
          disabled={saving}
          onPress={() => void onSave()}
        />
      </View>
    </ScrollView>
  );
}
