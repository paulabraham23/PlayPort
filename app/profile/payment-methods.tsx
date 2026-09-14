import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import type { PaymentMethodType } from '@/types';

const ICONS: Record<PaymentMethodType, keyof typeof Ionicons.glyphMap> = {
  upi: 'phone-portrait-outline',
  card: 'card-outline',
  netbanking: 'business-outline',
  cod: 'qr-code-outline',
};

export default function PaymentMethodsScreen() {
  const { horizontalPadding } = useResponsive();
  const methods = useAppStore((s) => s.paymentMethods);
  const selectedId = useAppStore((s) => s.selectedPaymentMethodId);
  const selectPaymentMethod = useAppStore((s) => s.selectPaymentMethod);

  return (
    <Screen showHeader={false}>
      <ScreenHeader
        title="Payment Methods"
        subtitle="Checkout preferences"
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        {methods.length === 0 ? (
          <EmptyState
            icon="card-outline"
            title="No payment methods"
            subtitle="Add UPI or a card to speed up checkout."
            actionLabel="Add method"
            onAction={() =>
              Alert.alert('Coming soon', 'Adding new payment methods will be available shortly.')
            }
          />
        ) : (
          <View style={styles.list}>
            {methods.map((method) => {
              const selected = method.id === selectedId;
              return (
                <Pressable
                  key={method.id}
                  accessibilityRole="button"
                  onPress={() => selectPaymentMethod(method.id)}
                >
                  <Card style={[styles.card, selected && styles.cardSelected]}>
                    <View style={styles.icon}>
                      <Ionicons
                        name={ICONS[method.type]}
                        size={20}
                        color={colors.playportOrange}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.label}>{method.label}</Text>
                        {method.recommended ? (
                          <Badge
                            label="RECOMMENDED"
                            color={colors.playportOrange}
                            backgroundColor={colors.orangeTint}
                          />
                        ) : null}
                      </View>
                      <Text style={styles.sub}>{method.subtitle}</Text>
                      {method.last4 ? (
                        <Text style={styles.meta}>
                          {method.brand} ···· {method.last4}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={selected ? colors.playportOrange : colors.mutedText}
                    />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        <Button
          title="Add payment method"
          variant="secondary"
          fullWidth
          icon={<Ionicons name="add" size={18} color={colors.primaryText} />}
          onPress={() =>
            Alert.alert('Coming soon', 'Adding new payment methods will be available shortly.')
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  list: { gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardSelected: { borderColor: colors.playportOrange },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  meta: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 11 },
});
