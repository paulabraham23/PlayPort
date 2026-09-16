import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { FloatingCartBar } from '@/components/layout/FloatingCartBar';
import { AmbientGlow } from '@/components/motion/AmbientGlow';
import { FeelToast } from '@/components/motion/FeelToast';
import { colors, layout } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  showHeader?: boolean;
  showCart?: boolean;
  showFloatingCart?: boolean;
  showAmbient?: boolean;
  headerRight?: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  narrow?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  showHeader = true,
  showCart = true,
  showFloatingCart = false,
  showAmbient = true,
  headerRight,
  edges = ['top'],
  narrow = false,
  contentStyle,
}: Props) {
  const { contentWidth, formMaxWidth, isDesktop } = useResponsive();
  const maxWidth = narrow ? formMaxWidth ?? 520 : contentWidth;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {showAmbient ? <AmbientGlow /> : null}
      {showHeader ? <AppHeader showCart={showCart} rightSlot={headerRight} /> : null}
      <FeelToast />
      <View style={styles.center}>
        <View style={[styles.body, { maxWidth, width: '100%' }, isDesktop && styles.desktopBody, contentStyle]}>
          {children}
        </View>
        {showFloatingCart ? <FloatingCartBar bottomOffset={layout.tabBarHeight + 12} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page, overflow: 'hidden' },
  center: { flex: 1, width: '100%', alignItems: 'center' },
  body: { flex: 1 },
  desktopBody: {
    position: 'relative',
  },
});
