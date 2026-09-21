import { ScrollView, Text, View } from 'react-native';
import { adminStyles } from '@/components/admin/adminStyles';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAdminStore } from '@/store/adminStore';

export default function AdminReviewsScreen() {
  const { horizontalPadding } = useResponsive();
  const reviews = useAdminStore((s) => s.reviews);
  const removeReview = useAdminStore((s) => s.removeReview);

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>Reviews</Text>
      <Text style={adminStyles.subtitle}>{reviews.length} public ratings</Text>

      {reviews.length === 0 ? (
        <Text style={adminStyles.empty}>No reviews yet.</Text>
      ) : (
        reviews.map((r) => (
          <View key={r.id} style={adminStyles.card}>
            <Text style={adminStyles.cardTitle}>
              {r.userName || 'User'} · {r.rating}/5
            </Text>
            <Text style={adminStyles.cardMeta}>
              {r.id}
              {r.productId ? ` · product ${r.productId}` : ''}
              {r.orderId ? ` · order ${r.orderId}` : ''}
            </Text>
            <Text style={[adminStyles.cardMeta, { marginTop: 6 }]}>{r.text}</Text>
            <View style={[adminStyles.row, { marginTop: 8 }]}>
              <Button
                title="Delete"
                size="sm"
                variant="danger"
                onPress={() => {
                  if (typeof window !== 'undefined' && !window.confirm('Delete this review?')) return;
                  void removeReview(r.id);
                }}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
