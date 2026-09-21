import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';

export default function AdminCustomersScreen() {
  const { horizontalPadding } = useResponsive();
  const users = useAdminStore((s) => s.users);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(needle) ||
        u.phone?.toLowerCase().includes(needle) ||
        u.email?.toLowerCase().includes(needle) ||
        u.id.toLowerCase().includes(needle)
    );
  }, [users, q]);

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>Customers</Text>
      <Text style={adminStyles.subtitle}>{users.length} profiles in Firestore</Text>

      <TextInput
        style={adminStyles.input}
        placeholder="Search name, phone, email…"
        placeholderTextColor={colors.mutedText}
        value={q}
        onChangeText={setQ}
      />

      {filtered.length === 0 ? (
        <Text style={adminStyles.empty}>No customers match.</Text>
      ) : (
        filtered.map((u) => (
          <View key={u.id} style={adminStyles.card}>
            <Text style={adminStyles.cardTitle}>{u.name || 'Unnamed'}</Text>
            <Text style={adminStyles.cardMeta}>
              {u.phone || 'No phone'}
              {u.email ? ` · ${u.email}` : ''}
            </Text>
            <Text style={adminStyles.cardMeta}>
              hub {u.homeHub || '—'}
              {u.homeHubId ? ` (${u.homeHubId})` : ''} · KYC {u.kycVerified ? 'yes' : 'no'} ·
              onboarding {u.onboardingComplete ? 'done' : 'pending'}
            </Text>
            <Text style={adminStyles.cardMeta}>{u.id}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
