import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  style,
  disabled,
  accessibilityLabel,
  ...rest
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        Platform.OS === 'web' && styles.webCursor,
        (pressed || hovered) && !disabled && (variant === 'primary' ? styles.primaryHover : styles.pressed),
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>{title}</Text>
      {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
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
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  size_sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
  size_md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 48 },
  size_lg: { paddingVertical: 14, paddingHorizontal: 18, minHeight: 52 },
  fullWidth: { width: '100%' },
  webCursor: {
    cursor: 'pointer' as unknown as undefined,
  },
  pressed: { opacity: 0.9 },
  primaryHover: { backgroundColor: colors.ctaPrimaryHover },
  disabled: { opacity: 0.45 },
  icon: { marginRight: 0 },
  text: { fontFamily: fonts.bodyMedium },
  text_primary: { color: colors.ctaPrimaryText },
  text_secondary: { color: colors.primaryText },
  text_ghost: { color: colors.primaryText },
  text_danger: { color: colors.danger },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
});
