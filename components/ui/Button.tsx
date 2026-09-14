import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radii, spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  style,
  disabled,
  ...rest
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: colors.playportOrange },
  secondary: { backgroundColor: colors.surfaceAlt },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: colors.danger },
  size_sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
  size_md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 48 },
  size_lg: { paddingVertical: 14, paddingHorizontal: 18, minHeight: 54 },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.45 },
  icon: { marginRight: 2 },
  text: { fontFamily: fonts.bodyMedium, fontWeight: '600' },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.primaryText },
  text_ghost: { color: colors.primaryText },
  text_danger: { color: colors.danger },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
});
