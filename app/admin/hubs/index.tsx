import { useState } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { PlacesAutocomplete } from '@/components/address/PlacesAutocomplete';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import type { ResolvedPlaceAddress } from '@/lib/places';
import { useAdminStore } from '@/store/adminStore';
import type { HubInfo } from '@/types';

const EMPTY: HubInfo = {
  id: '',
  name: '',
  city: '',
  state: '',
  active: true,
  sector: '',
  etaMinutes: 30,
  statusLabel: '',
  addressLine: '',
  pincode: '',
  phone: '',
  notes: '',
};

export default function AdminHubsScreen() {
  const { horizontalPadding } = useResponsive();
  const hubs = useAdminStore((s) => s.hubs);
  const saveHub = useAdminStore((s) => s.saveHub);
  const removeHub = useAdminStore((s) => s.removeHub);
  const [form, setForm] = useState<HubInfo>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (hub: HubInfo) => {
    setEditingId(hub.id);
    setForm({ ...EMPTY, ...hub });
    setError(null);
  };

  const startCreate = () => {
    setEditingId('new');
    setForm(EMPTY);
    setError(null);
  };

  const onSave = async () => {
    setError(null);
    const id = (editingId === 'new' ? form.id : editingId)?.trim();
    if (!id || !form.name.trim() || !form.city.trim()) {
      setError('ID, name, and city are required');
      return;
    }
    setSaving(true);
    try {
      await saveHub({ ...form, id });
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
          <Text style={adminStyles.title}>Hubs</Text>
          <Text style={adminStyles.subtitle}>{hubs.length} fulfillment hubs</Text>
        </View>
        <Button title="New hub" size="sm" onPress={startCreate} />
      </View>

      {editingId ? (
        <View style={adminStyles.card}>
          <Text style={adminStyles.cardTitle}>{editingId === 'new' ? 'New hub' : `Edit ${editingId}`}</Text>
          <View style={{ marginBottom: spacing.md }}>
            <PlacesAutocomplete
              label="Find city / area"
              placeholder="Search city or locality…"
              onPlaceSelected={(place: ResolvedPlaceAddress) => {
                setForm((f) => ({
                  ...f,
                  city: place.city || f.city,
                  state: place.state || f.state,
                  pincode: place.pincode || f.pincode,
                  addressLine: place.formattedAddress || f.addressLine,
                  lat: place.lat ?? f.lat,
                  lng: place.lng ?? f.lng,
                  name: f.name || (place.area ? `${place.area} Hub` : f.name),
                  id:
                    editingId === 'new' && !f.id
                      ? (place.area || place.city || '')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      : f.id,
                }));
              }}
            />
          </View>
          {editingId === 'new' ? (
            <View style={adminStyles.field}>
              <Text style={adminStyles.label}>ID</Text>
              <TextInput
                style={adminStyles.input}
                value={form.id}
                onChangeText={(t) =>
                  setForm((f) => ({ ...f, id: t.trim().toLowerCase().replace(/\s+/g, '-') }))
                }
                autoCapitalize="none"
                placeholder="indiranagar"
                placeholderTextColor={colors.mutedText}
              />
            </View>
          ) : null}
          {(
            [
              ['name', 'Name'],
              ['city', 'City'],
              ['state', 'State'],
              ['sector', 'Sector label'],
              ['statusLabel', 'Status label'],
              ['addressLine', 'Address line'],
              ['pincode', 'Pincode'],
              ['phone', 'Hub phone'],
              ['notes', 'Notes'],
            ] as const
          ).map(([key, label]) => (
            <View key={key} style={adminStyles.field}>
              <Text style={adminStyles.label}>{label}</Text>
              <TextInput
                style={[adminStyles.input, key === 'notes' && { minHeight: 72, textAlignVertical: 'top' }]}
                value={String(form[key] ?? '')}
                onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
                multiline={key === 'notes'}
                placeholderTextColor={colors.mutedText}
              />
            </View>
          ))}
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>ETA minutes</Text>
            <TextInput
              style={adminStyles.input}
              value={String(form.etaMinutes ?? 30)}
              onChangeText={(t) =>
                setForm((f) => ({ ...f, etaMinutes: Number(t.replace(/[^0-9]/g, '')) || 30 }))
              }
              keyboardType="numeric"
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Latitude</Text>
            <TextInput
              style={adminStyles.input}
              value={form.lat != null ? String(form.lat) : ''}
              onChangeText={(t) => setForm((f) => ({ ...f, lat: Number(t) || undefined }))}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Longitude</Text>
            <TextInput
              style={adminStyles.input}
              value={form.lng != null ? String(form.lng) : ''}
              onChangeText={(t) => setForm((f) => ({ ...f, lng: Number(t) || undefined }))}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={[adminStyles.row, { marginBottom: spacing.md }]}>
            <Text style={[adminStyles.label, { marginBottom: 0, flex: 1 }]}>Active</Text>
            <Switch
              value={form.active}
              onValueChange={(v) => setForm((f) => ({ ...f, active: v }))}
              trackColor={{ true: colors.playportOrange }}
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

      {hubs.map((h) => (
        <View key={h.id} style={adminStyles.card}>
          <Text style={adminStyles.cardTitle}>{h.name}</Text>
          <Text style={adminStyles.cardMeta}>
            {h.id} · {h.city}, {h.state} · ETA {h.etaMinutes ?? '—'}m · {h.active ? 'active' : 'off'}
          </Text>
          {h.addressLine ? <Text style={adminStyles.cardMeta}>{h.addressLine}</Text> : null}
          <View style={adminStyles.row}>
            <Button title="Edit" size="sm" variant="secondary" onPress={() => startEdit(h)} />
            <Button
              title="Delete"
              size="sm"
              variant="danger"
              onPress={() => {
                if (typeof window !== 'undefined' && !window.confirm(`Delete hub ${h.id}?`)) return;
                void removeHub(h.id);
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
