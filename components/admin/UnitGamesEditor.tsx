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
  const [text, setText] = useState((unit.games ?? []).join(', '));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(unit.skuLabel);
    setText((unit.games ?? []).join(', '));
  }, [unit.id, unit.skuLabel, unit.updatedAt]);

  const save = async () => {
    setSaving(true);
    try {
      const games = text
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
      await onSave({
        skuLabel: name.trim() || unit.skuLabel,
        games,
      });
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
        <Text style={adminStyles.cardMeta}>On this unit: {unit.games!.join(' · ')}</Text>
      ) : (
        <Text style={adminStyles.cardMeta}>No games listed yet. Customers will see an empty list.</Text>
      )}
      <Text style={adminStyles.label}>Games (comma separated)</Text>
      <TextInput
        style={adminStyles.input}
        value={text}
        onChangeText={setText}
        placeholder="FIFA 24, GTA V, God of War"
        placeholderTextColor={colors.mutedText}
      />
      <Button title={saving ? 'Saving…' : 'Save this console'} size="sm" variant="secondary" onPress={() => void save()} />
    </View>
  );
}
