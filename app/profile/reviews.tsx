import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function ReviewsScreen() {
  const { horizontalPadding } = useResponsive();
  const reviews = useAppStore((s) => s.reviews);
  const orders = useAppStore((s) => s.orders);
  const user = useAppStore((s) => s.user);
  const addReview = useAppStore((s) => s.addReview);

  const completed = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders]
  );
  const rateable = completed[0];

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const myReviews = useMemo(() => {
    const name = user?.name;
    if (!name) return reviews;
    return reviews.filter((r) => r.userName === name || r.userName === 'You');
  }, [reviews, user?.name]);

  const onSubmit = () => {
    if (!text.trim() || !rateable) return;
    const item = rateable.items[0];
    addReview({
      orderId: rateable.id,
      productId: item.productId,
      experienceId: item.experienceId,
      rating,
      text: text.trim(),
    });
    setText('');
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const productName = (productId?: string, experienceId?: string, fallback?: string) => {
    if (productId) return PRODUCTS.find((p) => p.id === productId)?.shortName ?? fallback;
    return fallback ?? 'PlayPort kit';
  };

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="My Reviews" subtitle="Rate completed sessions" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        {rateable ? (
          <Card style={styles.form}>
            <Text style={styles.formTitle}>Rate a completed order</Text>
            <Text style={styles.formSub}>
              #{rateable.id} · {rateable.items[0]?.name}
            </Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} stars`}
                  onPress={() => setRating(n)}
                  hitSlop={6}
                >
                  <Ionicons
                    name={n <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={colors.playportOrange}
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="How was setup, gear quality, timing?"
              placeholderTextColor={colors.mutedText}
              multiline
              style={styles.input}
            />
            {submitted ? <Text style={styles.toast}>Review submitted — thanks!</Text> : null}
            <Button
              title="Submit review"
              fullWidth
              disabled={!text.trim()}
              onPress={onSubmit}
            />
          </Card>
        ) : (
          <Card style={styles.form}>
            <Text style={styles.formTitle}>Nothing to rate yet</Text>
            <Text style={styles.formSub}>
              Complete a rental return to unlock a review for that session.
            </Text>
          </Card>
        )}

        <Text style={styles.section}>Your reviews</Text>
        {myReviews.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title="No reviews yet"
            subtitle="Share feedback after your next completed night."
            actionLabel="Browse kits"
            onAction={() => router.push('/(tabs)/explore')}
          />
        ) : (
          <View style={styles.list}>
            {myReviews.map((review) => (
              <Card key={review.id} style={styles.review}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewName}>{review.userName}</Text>
                  <Text style={styles.reviewDate}>{review.dateLabel}</Text>
                </View>
                <View style={styles.starsSmall}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={colors.playportOrange}
                    />
                  ))}
                </View>
                <Text style={styles.reviewProduct}>
                  {productName(review.productId, review.experienceId)}
                  {review.orderId ? ` · #${review.orderId}` : ''}
                </Text>
                <Text style={styles.reviewText}>{review.text}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  form: { gap: spacing.md },
  formTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 17 },
  formSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
  stars: { flexDirection: 'row', gap: 8 },
  starsSmall: { flexDirection: 'row', gap: 2 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  toast: { color: colors.success, fontFamily: fonts.bodyMedium, fontSize: 13 },
  section: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 18 },
  list: { gap: spacing.md },
  review: { gap: 8 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  reviewDate: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 11 },
  reviewProduct: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  reviewText: {
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
