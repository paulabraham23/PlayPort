import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  Layout,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

/** Shared spring-ish layout for list/card rearranges */
export const softLayout = Layout.springify().damping(18).stiffness(180);

export function EnterFade({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(320)} style={style}>
      {children}
    </Animated.View>
  );
}

export function EnterUp({
  children,
  delay = 0,
  style,
  index = 0,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  /** Stagger index → extra 40ms each */
  index?: number;
}) {
  const d = delay + index * 45;
  return (
    <Animated.View entering={FadeInUp.delay(d).duration(380).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
}

export function EnterDown({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(360)} style={style}>
      {children}
    </Animated.View>
  );
}

export function PopIn({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={ZoomIn.springify().damping(14).stiffness(220)} exiting={ZoomOut.duration(160)} style={style}>
      {children}
    </Animated.View>
  );
}

export function SlideUpBar({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(16).stiffness(160)}
      exiting={SlideOutDown.duration(200)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export { FadeIn, FadeOut, FadeInUp, FadeInDown, Layout };
