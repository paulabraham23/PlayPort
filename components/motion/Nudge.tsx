import { type ReactNode, useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * Subtle horizontal nudge — for CTA arrows / chevrons.
 */
export function NudgeX({
  children,
  style,
  distance = 4,
  duration = 900,
  delay = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(distance, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, distance, duration, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
