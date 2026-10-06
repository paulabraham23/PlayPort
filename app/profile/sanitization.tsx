import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { colors, fonts, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

const STEPS = [
  {
    title: 'Checked before it leaves',
    body: 'The console, controllers, and cables are looked over at the hub before a rider takes the kit out.',
  },
  {
    title: 'Surfaces are cleaned',
    body: 'The parts you hold — controllers, headset, and the outside of the console — are cleaned between rentals.',
  },
  {
    title: 'Checked when it comes back',
    body: 'After pickup, the kit is checked again before it is offered to the next customer.',
  },
];

export default function SanitizationScreen() {
  const { horizontalPadding } = useResponsive();

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader
        title="Sanitization promise"
        subtitle="How kits are prepared"
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.intro}>
          This is the cleaning promise for the kit, not the help center. Questions about delivery, payment, or a booking stay under Help & FAQs.
        </Text>
        {STEPS.map((step) => (
          <Card key={step.title} style={styles.row}>
            <Ionicons name="sparkles-outline" size={18} color={colors.playportOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{step.title}</Text>
              <Text style={styles.sub}>{step.body}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  intro: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, marginTop: 2, lineHeight: 18 },
});
