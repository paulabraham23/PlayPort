import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { DURATIONS } from '@/data/mock';
import { formatINR } from '@/utils/format';
import type { Product, RentalDurationId } from '@/types';

interface Props {
  product: Product;
  value: RentalDurationId;
  onChange: (id: RentalDurationId) => void;
}

const ICONS: Record<RentalDurationId, keyof typeof Ionicons.glyphMap> = {
  '6h': 'time-outline',
  '12h': 'moon-outline',
  '24h': 'sunny-outline',
  weekend: 'game-controller-outline',
};

export function DurationSelector({ product, value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {DURATIONS.map((d) => {
        const selected = value === d.id;
        return (
          <Pressable
            key={d.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(d.id)}
            style={[styles.card, selected && styles.selected]}
          >
            {d.popular ? (
              <View style={styles.popular}>
                <Text style={styles.popularText}>🔥 POPULAR</Text>
              </View>
            ) : null}
            <Ionicons
              name={ICONS[d.id]}
              size={18}
              color={selected ? colors.playportOrange : colors.secondaryText}
            />
            <Text style={styles.label}>{d.label}</Text>
            <Text style={styles.price}>{formatINR(product.priceByDuration[d.id])} flat</Text>
            <Text style={styles.desc}>{d.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  selected: {
    borderColor: colors.playportOrange,
    backgroundColor: '#241610',
  },
  popular: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.playportOrange,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularText: { color: colors.white, fontSize: 9, fontFamily: fonts.monoMedium },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14, marginTop: 4 },
  price: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 15 },
  desc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11 },
});
