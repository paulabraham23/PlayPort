import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  const { horizontalPadding, contentWidth } = useResponsive();
  return (
    <View style={styles.outer}>
      <View style={[styles.wrap, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%' }]}>
        <View style={styles.row}>
          {onBack ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.back}>
              <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
            </Pressable>
          ) : (
            <View style={styles.backSpacer} />
          )}
          <View style={styles.center}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.right}>{right ?? <View style={styles.backSpacer} />}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center' },
  wrap: { paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { width: 40, height: 40 },
  center: { flex: 1, paddingHorizontal: spacing.sm, minWidth: 0 },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 18 },
  subtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
