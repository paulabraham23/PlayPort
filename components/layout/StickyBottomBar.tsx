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
  const { isDesktop, horizontalPadding } = useResponsive();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 12 : 8) + spacing.sm;

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.bar,
          {
            paddingBottom: bottomPad,
            paddingHorizontal: horizontalPadding,
            maxWidth: isDesktop ? layout.desktopMaxWidth : undefined,
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: Platform.OS === 'web' ? 'rgba(26,26,31,0.96)' : colors.surface,
  },
  bar: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
