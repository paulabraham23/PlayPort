import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

/**
 * Soft drifting glow orbs behind content — ambient life without noise.
 */
export function AmbientGlow() {
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);

  useEffect(() => {
    a.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 9000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    b.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 11000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    c.value = withDelay(
      2400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 13000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [a, b, c]);

  const orbA = useAnimatedStyle(() => ({
    opacity: 0.14 + a.value * 0.1,
    transform: [
      { translateX: a.value * 40 - 20 },
      { translateY: a.value * 28 - 14 },
      { scale: 1 + a.value * 0.12 },
    ],
  }));

  const orbB = useAnimatedStyle(() => ({
    opacity: 0.1 + b.value * 0.08,
    transform: [
      { translateX: -b.value * 36 + 10 },
      { translateY: b.value * 42 - 20 },
      { scale: 1 + b.value * 0.15 },
    ],
  }));

  const orbC = useAnimatedStyle(() => ({
    opacity: 0.08 + c.value * 0.07,
    transform: [
      { translateX: c.value * 24 },
      { translateY: -c.value * 30 },
      { scale: 0.95 + c.value * 0.18 },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.orb, styles.orbOrange, orbA]} />
      <Animated.View style={[styles.orb, styles.orbGreen, orbB]} />
      <Animated.View style={[styles.orb, styles.orbWarm, orbC]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  orbOrange: {
    top: -60,
    right: -80,
    backgroundColor: colors.playportOrange,
  },
  orbGreen: {
    top: 220,
    left: -120,
    backgroundColor: colors.etaText,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  orbWarm: {
    bottom: 80,
    right: -40,
    backgroundColor: colors.orangeSoft,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});
