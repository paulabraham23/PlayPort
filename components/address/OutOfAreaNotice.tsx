import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { OUT_OF_AREA_MESSAGE } from '@/utils/serviceArea';

interface Props {
  /** Where the address is, e.g. "Indiranagar, Bengaluru". */
  place?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown wherever an address falls outside the Hyderabad delivery area. */
export function OutOfAreaNotice({ place, actionLabel, onAction }: Props) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Ionicons name="location-outline" size={18} color={colors.danger} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>
          {place ? `We don’t deliver to ${place} yet` : 'This address is outside our delivery area'}
        </Text>
        <Text style={styles.sub}>{OUT_OF_AREA_MESSAGE} Pick an address in Hyderabad to book.</Text>
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8} style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  title: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, lineHeight: 17 },
  action: { alignSelf: 'flex-start', marginTop: 6 },
  actionText: { color: colors.playportOrange, fontFamily: fonts.headingMedium, fontSize: typeScale.body },
});
