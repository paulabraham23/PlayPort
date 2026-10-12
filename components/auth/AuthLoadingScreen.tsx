import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { colors } from '@/constants/theme';

/**
 * Neutral placeholder while Firebase auth resolves. Render this (instead of
 * the signed-out UI) whenever `authReady` is false — otherwise every cold
 * load flashes "log in" for a second on signed-in devices.
 */
export function AuthLoadingScreen() {
  return (
    <Screen showHeader={false}>
      <View style={styles.center}>
        <ActivityIndicator color={colors.playportOrange} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
