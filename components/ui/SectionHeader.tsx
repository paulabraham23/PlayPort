import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, typeScale } from '@/constants/theme';

interface Props {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ eyebrow, title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.textCol}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }: { pressed: boolean }) => [styles.actionBtn, pressed && styles.actionPressed]}
        >
          <Text style={styles.action}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.playportOrange} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  textCol: { flex: 1, gap: 2 },
  eyebrow: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 32,
    letterSpacing: -0.3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    borderRadius: radii.full,
    ...Platform.select({ web: { cursor: 'pointer' as unknown as undefined } as object, default: {} }),
  },
  actionPressed: { opacity: 0.7 },
  action: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
});
