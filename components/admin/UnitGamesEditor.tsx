import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import type { InventoryUnit } from '@/types';

export function UnitGamesEditor({
  unit,
  productName,
  onSave,
}: {
  unit: InventoryUnit;
  productName?: string;
  onSave: (patch: { skuLabel: string; games: string[] }) => Promise<void> | void;
}) {
  const [name, setName] = useState(unit.skuLabel);
  const [text, setText] = useState((unit.games ?? []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

  useEffect(() => {
    setName(unit.skuLabel);
    setText((unit.games ?? []).join('\n'));
  }, [unit.id, unit.skuLabel, unit.updatedAt]);

  const parsed = parseGames(text);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({
        skuLabel: name.trim() || unit.skuLabel,
        games: parsed,
      });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={adminStyles.label}>Name customers see</Text>
      <TextInput
        style={adminStyles.input}
        value={name}
        onChangeText={setName}
        placeholder="PS5 Slim"
        placeholderTextColor={colors.mutedText}
      />
      <Text style={adminStyles.cardMeta}>
        {productName ? `${productName} · ` : ''}
        {unit.productId} · {unit.hubId} · {unit.status}
      </Text>
      {(unit.games ?? []).length ? (
        <Text style={adminStyles.cardMeta}>On this unit ({unit.games!.length}): {unit.games!.join(' · ')}</Text>
      ) : (
        <Text style={adminStyles.cardMeta}>No games listed yet. Customers will see an empty list.</Text>
      )}
      <Text style={adminStyles.label}>Games — one per line (or comma-separated){parsed.length ? ` · ${parsed.length} entered` : ''}</Text>
      <TextInput
        style={[adminStyles.input, { minHeight: 120, textAlignVertical: 'top' }]}
        value={text}
        onChangeText={setText}
        placeholder={'FC26\nGTA V\nGod of War'}
        placeholderTextColor={colors.mutedText}
        multiline
      />
      <Button title={saving ? 'Saving…' : savedTick ? 'Saved ✓' : `Save this console${parsed.length ? ` (${parsed.length} games)` : ''}`} size="sm" variant="secondary" onPress={() => void save()} />
    </View>
  );
}

/** Split on newlines and commas so "FC26, GTA V\nGod of War" all work. */
export function parseGames(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((g) => g.trim())
    .filter(Boolean);
}
