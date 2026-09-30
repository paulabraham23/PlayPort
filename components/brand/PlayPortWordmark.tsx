import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, fonts } from '@/constants/theme';

/** Wordmark: ink “Play”, brand orange “Port”. */
export function PlayPortWordmark({
  size = 24,
  style,
}: {
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      accessibilityLabel="PlayPort"
      style={[styles.mark, { fontSize: size, letterSpacing: size * -0.035 }, style]}
    >
      Play<Text style={styles.port}>Port</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
  },
  port: {
    color: colors.playportOrange,
  },
});
