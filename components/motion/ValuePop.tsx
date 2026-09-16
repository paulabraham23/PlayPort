import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** Pops/scales children whenever `value` changes. */
export function ValuePop({
  value,
  children,
  style,
}: {
  value: string | number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const y = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.14, { damping: 11, stiffness: 340 }),
      withSpring(1, { damping: 14, stiffness: 240 })
    );
    y.value = withSequence(
      withTiming(-3, { duration: 80 }),
      withSpring(0, { damping: 14, stiffness: 220 })
    );
  }, [value, scale, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: y.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
