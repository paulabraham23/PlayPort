import { type ReactNode } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale when pressed (default 0.97) */
  scaleTo?: number;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityLabel?: string;
  hitSlop?: number;
}

/**
 * Soft spring press — the main “feel” primitive for tappable UI.
 */
export function PressableScale({
  children,
  onPress,
  disabled,
  style,
  scaleTo = 0.97,
  accessibilityRole = 'button',
  accessibilityLabel,
  hitSlop,
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pressIn = () => {
    scale.value = withSpring(scaleTo, { damping: 16, stiffness: 420 });
    opacity.value = withTiming(0.92, { duration: 80 });
  };

  const pressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 280 });
    opacity.value = withTiming(1, { duration: 120 });
  };

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onHoverIn={
        Platform.OS === 'web'
          ? () => {
              scale.value = withSpring(1.02, { damping: 18, stiffness: 320 });
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
      style={[style, animatedStyle, Platform.OS === 'web' && ({ cursor: 'pointer' } as object)]}
    >
      {children}
    </AnimatedPressable>
  );
}
