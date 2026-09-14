import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors, fonts, radii, spacing } from '@/constants/theme';

interface Props {
  label: string;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  left?: React.ReactNode;
}

export function Badge({
  label,
  color = colors.primaryText,
  backgroundColor = colors.surfaceAlt,
  style,
  textStyle,
  left,
}: Props) {
  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      {left}
      <Text style={[styles.text, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
