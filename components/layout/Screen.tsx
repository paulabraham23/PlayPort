import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  showHeader?: boolean;
  showCart?: boolean;
  headerRight?: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  /** Constrain body to a narrower reading/form width (auth, checkout). */
  narrow?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  showHeader = true,
  showCart = true,
  headerRight,
  edges = ['top'],
  narrow = false,
  contentStyle,
}: Props) {
  const { contentWidth, formMaxWidth, isDesktop } = useResponsive();
  const maxWidth = narrow ? formMaxWidth ?? 520 : contentWidth;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {showHeader ? <AppHeader showCart={showCart} rightSlot={headerRight} /> : null}
      <View style={styles.center}>
        <View style={[styles.body, { maxWidth, width: '100%' }, isDesktop && styles.desktopBody, contentStyle]}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.baseBlack },
  center: { flex: 1, width: '100%', alignItems: 'center' },
  body: { flex: 1 },
  desktopBody: {
    // Keep sticky bars / absolute children relative to content shell
    position: 'relative',
  },
});
