import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';

const ITEMS = [
  { icon: 'sparkles-outline' as const, label: 'Sanitized' },
  { icon: 'construct-outline' as const, label: 'Setup included' },
  { icon: 'wallet-outline' as const, label: 'Zero deposit' },
  { icon: 'flash-outline' as const, label: '30 min drop' },
];

export function TrustStrip() {
  return (
    <View style={styles.wrap}>
      {ITEMS.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={16} color={colors.playportOrange} />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
});
