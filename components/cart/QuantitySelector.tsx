import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, typeScale } from '@/constants/theme';

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
        hitSlop={4}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(Math.min(max, value + 1))}
        style={styles.btn}
        hitSlop={4}
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
    borderWidth: 1.5,
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
    borderRadius: radii.sm,
    minWidth: 96,
    height: 34,
  },
  btn: { width: 32, height: 34, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.playportOrange, fontSize: 17, fontFamily: fonts.heading, lineHeight: 18 },
  value: {
    flex: 1,
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
    textAlign: 'center',
  },
});
