import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, fonts } from '@/constants/theme';

/** Handwritten wordmark, in the spirit of a scribbled mark. */
export function PlayPortWordmark({
  size = 24,
  style,
}: {
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const fontSize = Math.round(size * 1.35);
  return (
    <Text
      accessibilityLabel="PlayPort"
      style={[styles.mark, { fontSize, lineHeight: Math.round(fontSize * 1.05) }, style]}
    >
      PlayPort
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: {
    color: colors.primaryText,
    fontFamily: fonts.wordmark,
    letterSpacing: 0.2,
  },
});
