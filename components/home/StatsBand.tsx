import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';

interface Stat {
  value: string;
  label: string;
}

/**
 * Corporate metrics band — divider-separated stats strip for the home page.
 */
export function StatsBand({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;

  return (
    <View style={styles.band}>
      {stats.map((stat, i) => (
        <View key={stat.label} style={styles.cell}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  divider: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  value: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    letterSpacing: -0.5,
  },
  label: {
    color: colors.mutedText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
