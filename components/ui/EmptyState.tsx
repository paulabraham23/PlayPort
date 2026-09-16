import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.playportOrange} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing.lg, minWidth: 160 }} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  subtitle = 'Please try again in a moment.',
  actionLabel = 'Retry',
  onAction,
}: Partial<Props> & { onAction?: () => void }) {
  return (
    <EmptyState
      icon="warning-outline"
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.orangeTint,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 320,
  },
});
