import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { BUSINESS } from '@/constants/legal';

interface Props {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}

/**
 * Checkout acceptance (Terms 3.7): the tick is the customer's agreement, and the
 * charges Schedule A says must be shown before booking are listed right here.
 */
export function TermsAcceptance({ accepted, onChange }: Props) {
  const open = (slug: string) => router.push(`/legal/${slug}` as never);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Before you book</Text>
      <View style={styles.points}>
        {[
          'No security deposit.',
          'Keep one government photo ID ready (driving licence, passport, voter ID or masked Aadhaar) — we may check it at delivery.',
          `Free cancellation until we dispatch. After dispatch, or if delivery fails because of a wrong address, nobody being available, refusing to pay or to show ID, a ₹${BUSINESS.failedDeliveryFee} failed-delivery fee applies.`,
          'Late return: 30-minute grace, then the item\u2019s hourly rate for each hour or part of an hour.',
          'Damage or loss caused by misuse is charged as set out in Schedule A of the Terms.',
        ].map((point) => (
          <View key={point} style={styles.point}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => onChange(!accepted)}
        style={styles.checkRow}
        hitSlop={4}
      >
        <View style={[styles.box, accepted && styles.boxOn]}>
          {accepted ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
        </View>
        <Text style={styles.checkText}>
          I am 18 or older and I agree to PlayPort’s{' '}
          <Text style={styles.link} onPress={() => open('terms')}>
            Terms & Conditions
          </Text>
          , including Schedule A, the{' '}
          <Text style={styles.link} onPress={() => open('refunds')}>
            Refund & Cancellation Policy
          </Text>{' '}
          and the{' '}
          <Text style={styles.link} onPress={() => open('privacy')}>
            Privacy Policy
          </Text>
          .
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: typeScale.bodyLg },
  points: { gap: 6 },
  point: { flexDirection: 'row', gap: 8 },
  bullet: { color: colors.mutedText, fontSize: typeScale.small, lineHeight: 18 },
  pointText: { flex: 1, color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, lineHeight: 18 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingTop: spacing.xs },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.mutedText,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.playportOrange, borderColor: colors.playportOrange },
  checkText: { flex: 1, color: colors.primaryText, fontFamily: fonts.body, fontSize: typeScale.body, lineHeight: 20 },
  link: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, textDecorationLine: 'underline' },
});
