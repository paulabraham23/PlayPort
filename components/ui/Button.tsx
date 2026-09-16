import { type ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { colors, fonts, radii, shadows, typeScale } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
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
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) scale.value = withSpring(0.96, { damping: 16, stiffness: 420 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 280 });
        onPressOut?.(e);
      }}
      onHoverIn={
        Platform.OS === 'web' && !disabled
          ? () => {
              scale.value = withTiming(1.02, { duration: 120 });
            }
          : undefined
      }
      onHoverOut={
        Platform.OS === 'web'
          ? () => {
              scale.value = withSpring(1, { damping: 16, stiffness: 280 });
            }
          : undefined
      }
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        Platform.OS === 'web' && styles.webCursor,
        disabled && styles.disabled,
        style,
        animatedStyle,
      ]}
      {...rest}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>{title}</Text>
      {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
    </AnimatedPressable>
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
  primary: {
    backgroundColor: colors.playportOrange,
    ...shadows.glow,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  danger: { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  size_sm: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 38, borderRadius: radii.sm },
  size_md: { paddingVertical: 13, paddingHorizontal: 18, minHeight: 50 },
  size_lg: { paddingVertical: 15, paddingHorizontal: 22, minHeight: 54, borderRadius: radii.lg },
  fullWidth: { width: '100%' },
  webCursor: {
    cursor: 'pointer' as unknown as undefined,
  },
  disabled: { opacity: 0.45 },
  icon: { marginRight: 0 },
  text: { fontFamily: fonts.bodyMedium },
  text_primary: { color: colors.ctaPrimaryText },
  text_secondary: { color: colors.primaryText },
  text_ghost: { color: colors.primaryText },
  text_danger: { color: colors.danger },
  textSize_sm: { fontSize: typeScale.small },
  textSize_md: { fontSize: typeScale.bodyLg },
  textSize_lg: { fontSize: typeScale.title },
});
