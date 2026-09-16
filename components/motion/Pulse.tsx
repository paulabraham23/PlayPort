import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      opacity.value = 1;
      return;
    }
    opacity.value = withSequence(
      withTiming(0.55, { duration: 900 }),
      withTiming(1, { duration: 900 })
    );
    const id = setInterval(() => {
      opacity.value = withSequence(
        withTiming(0.55, { duration: 900 }),
        withTiming(1, { duration: 900 })
      );
    }, 1800);
    return () => clearInterval(id);
  }, [active, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
