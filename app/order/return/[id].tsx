import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function ReturnOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const orders = useAppStore((s) => s.orders);
  const completeReturn = useAppStore((s) => s.completeReturn);
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const [done, setDone] = useState(false);

  if (!order) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Return" onBack={() => router.back()} />
        <EmptyState
          icon="return-down-back-outline"
          title="Order not found"
          actionLabel="Back to orders"
          onAction={() => router.replace('/(tabs)/orders')}
        />
      </Screen>
    );
  }

  if (done || order.status === 'completed') {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Return complete" onBack={() => router.replace('/(tabs)/orders')} />
        <View style={[styles.successWrap, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Session wrapped</Text>
          <Text style={styles.successBody}>
            Thanks for playing with PlayPort. Pickup is confirmed for #{order.id}. Rate your gear to
            help others pick the perfect night.
          </Text>
          <Button
            title="Leave a review"
            fullWidth
            onPress={() => router.replace('/profile/reviews')}
          />
          <Button
            title="Back to orders"
            variant="secondary"
            fullWidth
            onPress={() => router.replace('/(tabs)/orders')}
          />
        </View>
      </Screen>
    );
  }

  const deadline =
    order.items[0]?.returnLabel ?? 'Scheduled pickup at end of your rental window';

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Complete Return" subtitle={`#${order.id}`} onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.sectionTitle}>What to return</Text>
        <View style={styles.list}>
          {order.items.map((item, idx) => (
            <Card key={`${item.name}-${idx}`} style={styles.item}>
              <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.durationLabel}</Text>
                {item.badges?.map((b) => (
                  <Text key={b} style={styles.badge}>
                    Includes {b}
                  </Text>
                ))}
              </View>
              <Ionicons name="checkbox-outline" size={22} color={colors.playportOrange} />
            </Card>
          ))}
        </View>

        <Card style={styles.instructions}>
          <View style={styles.instrHead}>
            <Ionicons name="construct-outline" size={18} color={colors.playportOrange} />
            <Text style={styles.instrTitle}>Leave gear assembled</Text>
          </View>
          <Text style={styles.instrBody}>
            Do not pack cables or unmount the screen. Our specialist handles unhooking, accessory
            count, and flight-case packing at pickup.
          </Text>
        </Card>

        <Card style={styles.deadline}>
          <Ionicons name="time-outline" size={20} color={colors.warning} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.deadlineLabel}>RETURN DEADLINE</Text>
            <Text style={styles.deadlineValue}>{deadline}</Text>
          </View>
        </Card>

        <Button
          title="Confirm completion"
          fullWidth
          icon={<Ionicons name="checkmark" size={18} color={colors.white} />}
          onPress={() => {
            if (id) completeReturn(id);
            setDone(true);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 18 },
  list: { gap: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 56, height: 56, borderRadius: radii.sm },
  name: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
  badge: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 11 },
  instructions: { gap: spacing.sm },
  instrHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  instrTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  instrBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderColor: colors.warning,
  },
  deadlineLabel: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  deadlineValue: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  successIcon: { alignItems: 'center', marginBottom: spacing.sm },
  successTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 24,
    textAlign: 'center',
  },
  successBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
