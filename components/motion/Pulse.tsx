import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * Pops when `pulseKey` changes (e.g. cart count).
 */
export function PulseOnChange({
  pulseKey,
  children,
  style,
}: {
  pulseKey: string | number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.18, { damping: 10, stiffness: 320 }),
      withSpring(1, { damping: 12, stiffness: 220 })
    );
  }, [pulseKey, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

/** Subtle breathing for live / ETA indicators */
export function SoftPulse({
  children,
  style,
  active = true,
  minOpacity = 0.45,
  scaleAmount = 0.06,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
  minOpacity?: number;
  scaleAmount?: number;
  delay?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [active, delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: minOpacity + (1 - minOpacity) * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * scaleAmount }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
