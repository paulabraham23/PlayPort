import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function StickyBottomBar({ children, style }: Props) {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, contentWidth } = useResponsive();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 12 : 8) + spacing.sm;

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.bar,
          {
            paddingBottom: bottomPad,
            paddingHorizontal: horizontalPadding,
            maxWidth: contentWidth,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function useStickyBarPadding(extra = 24) {
  const insets = useSafeAreaInsets();
  return layout.bottomBarHeight + Math.max(insets.bottom, 12) + extra;
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
      } as object,
      default: {},
    }),
  },
  bar: {
    width: '100%',
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
});
