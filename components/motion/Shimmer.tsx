import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Soft light sweep across a clipped surface (CTA / badge life).
 */
export function Shimmer({
  children,
  style,
  delay = 400,
  duration = 2200,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
        -1,
        false
      )
    );
  }, [delay, duration, progress]);

  const sweepStyle = useAnimatedStyle(() => {
    const wave = Math.sin(progress.value * Math.PI);
    return {
      transform: [{ translateX: -80 + progress.value * 280 }, { skewX: '-18deg' }],
      opacity: 0.12 + wave * 0.38,
    };
  });

  return (
    <View style={[styles.wrap, style]}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.sweep, sweepStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  sweep: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    width: 48,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
