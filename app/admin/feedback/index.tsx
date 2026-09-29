import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { adminListFeedback, type AdminFeedback } from '@/lib/adminFirestore';

function when(ms: number) {
  if (!ms) return '';
  return new Date(ms).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminFeedbackScreen() {
  const { horizontalPadding } = useResponsive();
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminListFeedback()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load feedback'));
  }, []);

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>Feedback</Text>
      <Text style={adminStyles.subtitle}>
        Voice and text notes from the storefront. {items.length} received.
      </Text>
      {error ? <Text style={adminStyles.error}>{error}</Text> : null}
      {items.length === 0 && !error ? (
        <Text style={adminStyles.empty}>No feedback yet.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={adminStyles.card}>
            <Text style={adminStyles.cardMeta}>
              {item.channel === 'voice' ? 'Voice' : 'Text'}
              {item.createdAtMs ? ` · ${when(item.createdAtMs)}` : ''}
              {item.userId ? ` · ${item.userId.slice(0, 8)}` : ' · guest'}
            </Text>
            <Text style={adminStyles.cardTitle}>{item.text}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
