import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';

export default function AdminCombosScreen() {
  const { horizontalPadding } = useResponsive();
  const experiences = useAdminStore((s) => s.experiences);
  const removeExperience = useAdminStore((s) => s.removeExperience);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return experiences;
    return experiences.filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.id.toLowerCase().includes(needle) ||
        e.tag.toLowerCase().includes(needle)
    );
  }, [experiences, q]);

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <View style={adminStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={adminStyles.title}>Combos</Text>
          <Text style={adminStyles.subtitle}>{experiences.length} experience bundles</Text>
        </View>
        <Button title="New combo" size="sm" onPress={() => router.push('/admin/combos/new' as never)} />
      </View>

      <TextInput
        style={adminStyles.input}
        placeholder="Search combos…"
        placeholderTextColor={colors.mutedText}
        value={q}
        onChangeText={setQ}
      />

      {filtered.length === 0 ? (
        <Text style={adminStyles.empty}>No combos yet — create one to power the Combos tab.</Text>
      ) : (
        filtered.map((e) => (
          <Pressable
            key={e.id}
            style={adminStyles.card}
            onPress={() => router.push(`/admin/combos/${e.id}` as never)}
          >
            <Text style={adminStyles.cardTitle}>{e.name}</Text>
            <Text style={adminStyles.cardMeta}>
              {e.id} · {e.tag} · ₹{e.price} · {e.durationLabel}
            </Text>
            <View style={[adminStyles.row, { marginTop: 8 }]}>
              <Button
                title="Edit"
                size="sm"
                variant="secondary"
                onPress={() => router.push(`/admin/combos/${e.id}` as never)}
              />
              <Button
                title="Delete"
                size="sm"
                variant="danger"
                onPress={() => {
                  if (typeof window !== 'undefined' && !window.confirm(`Delete ${e.id}?`)) return;
                  void removeExperience(e.id);
                }}
              />
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
