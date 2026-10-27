import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useCatalogStore } from '@/store/catalogStore';

export const ORDERING_PAUSED_DEFAULT = 'We’re not taking new orders right now. Please check back soon.';

/** Shown while ordering is paused from Admin → Settings. Renders nothing otherwise. */
export function OrderingPausedBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  const paused = useCatalogStore((s) => s.orderingPaused);
  const message = useCatalogStore((s) => s.orderingPausedMessage);
  if (!paused) return null;
  return (
    <View style={[styles.banner, style]} accessibilityRole="alert">
      <Ionicons name="pause-circle-outline" size={20} color={colors.playportOrange} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Ordering is paused</Text>
        <Text style={styles.sub}>{message || ORDERING_PAUSED_DEFAULT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.orangeTint,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small, marginTop: 2, lineHeight: 17 },
});
