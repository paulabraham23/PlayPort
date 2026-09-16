import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
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
  weekend: 'calendar-outline',
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
                <Text style={styles.popularText}>Popular</Text>
              </View>
            ) : null}
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <Ionicons
                name={ICONS[d.id]}
                size={18}
                color={selected ? colors.playportOrange : colors.secondaryText}
              />
            </View>
            <Text style={styles.label}>{d.label}</Text>
            <Text style={[styles.price, selected && styles.priceSelected]}>
              {formatINR(product.priceByDuration[d.id])}
            </Text>
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
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 6,
  },
  selected: {
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
    ...shadows.glow,
  },
  popular: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.playportOrange,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.3,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: colors.orangeTintStrong },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body, marginTop: 2 },
  price: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: typeScale.title },
  priceSelected: { color: colors.playportOrange },
  desc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.caption, lineHeight: 15 },
});
