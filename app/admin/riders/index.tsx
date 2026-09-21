import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import {
  normalizeRiderPhone,
  riderDelete,
  riderListRiders,
  riderSetActive,
  riderUpsert,
} from '@/lib/riderFirestore';
import { useAdminStore } from '@/store/adminStore';
import type { Rider } from '@/types';

export default function AdminRidersScreen() {
  const { horizontalPadding } = useResponsive();
  const hubs = useAdminStore((s) => s.hubs);
  const users = useAdminStore((s) => s.users);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [uid, setUid] = useState('');
  const [hubId, setHubId] = useState('');
  const [vehicle, setVehicle] = useState('Bike');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      setRiders(await riderListRiders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const defaultHub = hubId || hubs[0]?.id || 'indiranagar';

  const onCreate = async () => {
    setError(null);
    const riderUid = uid.trim();
    const riderPhone = normalizeRiderPhone(phone);
    if (!riderUid || !name.trim() || riderPhone.length < 12) {
      setError('UID, name, and valid +91 phone are required');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await riderUpsert({
        id: riderUid,
        uid: riderUid,
        name: name.trim(),
        phone: riderPhone,
        hubId: defaultHub,
        active: true,
        vehicle: vehicle.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });
      setName('');
      setPhone('');
      setUid('');
      setVehicle('Bike');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const promote = (userId: string, userName: string, userPhone: string) => {
    setUid(userId);
    setName(userName || '');
    setPhone(userPhone || '');
  };

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>Riders</Text>
      <Text style={adminStyles.subtitle}>
        Delivery partners · they open /rider after you add their Auth UID
      </Text>

      <View style={adminStyles.card}>
        <Text style={adminStyles.cardTitle}>Add rider</Text>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Firebase Auth UID</Text>
          <TextInput
            style={adminStyles.input}
            value={uid}
            onChangeText={setUid}
            autoCapitalize="none"
            placeholder="From Customers after they OTP once"
            placeholderTextColor={colors.mutedText}
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Name</Text>
          <TextInput
            style={adminStyles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.mutedText}
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Phone (+91)</Text>
          <TextInput
            style={adminStyles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="9876543210"
            placeholderTextColor={colors.mutedText}
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Hub ID</Text>
          <TextInput
            style={adminStyles.input}
            value={hubId || defaultHub}
            onChangeText={setHubId}
            autoCapitalize="none"
            placeholderTextColor={colors.mutedText}
          />
        </View>
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>Vehicle</Text>
          <TextInput
            style={adminStyles.input}
            value={vehicle}
            onChangeText={setVehicle}
            placeholderTextColor={colors.mutedText}
          />
        </View>
        {error ? <Text style={adminStyles.error}>{error}</Text> : null}
        <Button
          title={saving ? 'Saving…' : 'Save rider'}
          size="sm"
          disabled={saving}
          onPress={() => void onCreate()}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Promote from customers</Text>
      {users.slice(0, 12).map((u) => (
        <View key={u.id} style={adminStyles.card}>
          <Text style={adminStyles.cardTitle}>{u.name || 'Unnamed'}</Text>
          <Text style={adminStyles.cardMeta}>
            {u.phone || 'No phone'} · {u.id}
          </Text>
          <Button
            title="Use as rider"
            size="sm"
            variant="secondary"
            onPress={() => promote(u.id, u.name, u.phone)}
          />
        </View>
      ))}

      <Text style={adminStyles.cardTitle}>{loading ? 'Loading…' : `${riders.length} riders`}</Text>
      {riders.map((r) => (
        <View key={r.id} style={adminStyles.card}>
          <Text style={adminStyles.cardTitle}>{r.name}</Text>
          <Text style={adminStyles.cardMeta}>
            {r.phone} · hub {r.hubId} · {r.vehicle || '—'} · {r.active ? 'active' : 'off'}
          </Text>
          <Text style={adminStyles.cardMeta}>{r.id}</Text>
          <View style={adminStyles.row}>
            <View style={[adminStyles.row, { flex: 1 }]}>
              <Text style={[adminStyles.label, { marginBottom: 0 }]}>Active</Text>
              <Switch
                value={r.active}
                onValueChange={(v) => {
                  void riderSetActive(r.id, v).then(reload);
                }}
                trackColor={{ true: colors.playportOrange }}
              />
            </View>
            <Button
              title="Delete"
              size="sm"
              variant="danger"
              onPress={() => {
                if (typeof window !== 'undefined' && !window.confirm(`Remove ${r.name}?`)) return;
                void riderDelete(r.id).then(reload);
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
