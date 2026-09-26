import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

/**
 * Live indicator: core blink + expanding rings.
 */
export function LiveDot({
  color = colors.success,
  size = 6,
  style,
}: {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const blink = useSharedValue(1);
  const ringA = useSharedValue(0);
  const ringB = useSharedValue(0);

  useEffect(() => {
    blink.value = withRepeat(
      withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    ringA.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    ringB.value = withDelay(
      600,
      withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false)
    );
  }, [blink, ringA, ringB]);

  const coreStyle = useAnimatedStyle(() => ({
    opacity: blink.value,
    transform: [{ scale: 0.85 + blink.value * 0.15 }],
  }));

  const ringAStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - ringA.value),
    transform: [{ scale: 1 + ringA.value * 2.4 }],
  }));

  const ringBStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - ringB.value),
    transform: [{ scale: 1 + ringB.value * 2.4 }],
  }));

  return (
    <View style={[styles.wrap, { width: size * 3.2, height: size * 3.2 }, style]}>
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
          ringAStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
          ringBStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.core,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          coreStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});
