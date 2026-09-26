import { type ReactNode, useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
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
 * Slow Ken Burns drift — scale + pan. Works on web and native.
 */
export function KenBurns({
  children,
  style,
  scaleTo = 1.08,
  duration = 14000,
  delay = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  duration?: number;
  delay?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, duration, t]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + t.value * (scaleTo - 1) },
      { translateX: t.value * 10 - 5 },
      { translateY: t.value * -8 + 4 },
    ],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style, animatedStyle]}>{children}</Animated.View>
  );
}
