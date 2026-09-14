import { StyleSheet, View } from 'react-native';
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
}

export function Screen({ children, showHeader = true, showCart = true, headerRight, edges = ['top'] }: Props) {
  const { isDesktop, width } = useResponsive();
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {showHeader ? <AppHeader showCart={showCart} rightSlot={headerRight} /> : null}
      <View style={[styles.body, isDesktop && { maxWidth: 1100, width: '100%', alignSelf: 'center' }, { width: '100%' }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.baseBlack },
  body: { flex: 1 },
});
