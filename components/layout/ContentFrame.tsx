import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  /** Constrain to formMaxWidth (auth/checkout). */
  narrow?: boolean;
  /** Constrain to opsMaxWidth (admin/rider). */
  ops?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Skip horizontal padding (when parent already pads). */
  noPad?: boolean;
}

/**
 * Centers page content to the active breakpoint max width.
 * Use inside ScrollViews / stacks that are not wrapped by Screen.
 */
export function ContentFrame({ children, narrow, ops, style, noPad }: Props) {
  const { contentWidth, formMaxWidth, opsMaxWidth, shellStyle, padStyle } = useResponsive();

  const maxWidth = narrow ? formMaxWidth ?? 520 : ops ? opsMaxWidth : contentWidth;

  return (
    <View
      style={[styles.frame, shellStyle, { maxWidth }, !noPad && padStyle, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    flexGrow: 1,
    minWidth: 0,
  },
});
