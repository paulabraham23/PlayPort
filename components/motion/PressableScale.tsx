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
  scaleTo?: number;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityLabel?: string;
  hitSlop?: number;
}

/**
 * Deeper tactile press — scale + slight lift + opacity.
 */
export function PressableScale({
  children,
  onPress,
  disabled,
  style,
  scaleTo = 0.96,
  accessibilityRole = 'button',
  accessibilityLabel,
  hitSlop,
}: Props) {
  const scale = useSharedValue(1);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: y.value }],
    opacity: opacity.value,
  }));

  const pressIn = () => {
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 480, mass: 0.6 });
    y.value = withTiming(1.5, { duration: 70 });
    opacity.value = withTiming(0.9, { duration: 70 });
  };

  const pressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 260, mass: 0.7 });
    y.value = withSpring(0, { damping: 14, stiffness: 280 });
    opacity.value = withTiming(1, { duration: 140 });
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
              scale.value = withSpring(1.025, { damping: 16, stiffness: 300 });
              y.value = withTiming(-2, { duration: 140 });
            }
          : undefined
      }
      onHoverOut={
        Platform.OS === 'web'
          ? () => {
              scale.value = withSpring(1, { damping: 14, stiffness: 260 });
              y.value = withSpring(0, { damping: 14, stiffness: 260 });
            }
          : undefined
      }
      style={[style, animatedStyle, Platform.OS === 'web' && ({ cursor: 'pointer' } as object)]}
    >
      {children}
    </AnimatedPressable>
  );
}
