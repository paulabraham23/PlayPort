import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ value, onChange, min = 1, max = 5 }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(Math.max(min, value - 1))}
        style={styles.btn}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(Math.min(max, value + 1))}
        style={styles.btn}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 4,
    gap: 8,
  },
  btn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.primaryText, fontSize: 18, fontFamily: fonts.bodyMedium },
  value: { color: colors.primaryText, fontFamily: fonts.monoMedium, minWidth: 16, textAlign: 'center' },
});
