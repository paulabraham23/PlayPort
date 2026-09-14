import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import type { Product, RentalDurationId } from '@/types';

interface Props {
  product: Product;
  durationId?: RentalDurationId;
  onPress?: () => void;
  onRent?: () => void;
  compact?: boolean;
}

export function ProductCard({ product, durationId = '12h', onPress, onRent, compact }: Props) {
  const price = product.priceByDuration[durationId];
  if (compact) {
    return (
      <View style={styles.compact}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={product.shortName}
          onPress={onPress}
          style={styles.compactMain}
        >
          <Image source={{ uri: product.images[0] }} style={styles.compactImage} contentFit="cover" />
          <View style={styles.compactBody}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {product.shortName}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              ★ {product.rating} · {product.etaMinutes}m
            </Text>
            <Text style={styles.price}>{formatINR(price)} / slot</Text>
          </View>
        </Pressable>
        <Button title="Rent Now" size="sm" variant="secondary" onPress={onRent ?? onPress} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={product.name} onPress={onPress}>
        <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" />
        <View style={styles.body}>
          {product.badge ? (
            <Badge label={product.badge} color={colors.playportOrange} backgroundColor={colors.orangeTint} />
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.desc} numberOfLines={2}>
            {product.description}
          </Text>
        </View>
      </Pressable>
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>{formatINR(price)}</Text>
          <Text style={styles.meta}>
            ★ {product.rating} · {product.etaMinutes} mins
          </Text>
        </View>
        <Button
          title="Rent Now"
          size="sm"
          icon={<Ionicons name="flash" size={14} color={colors.white} />}
          onPress={onRent ?? onPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160, backgroundColor: colors.surfaceAlt },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: 8 },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 16 },
  desc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 8,
  },
  price: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 16 },
  meta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  compact: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  compactMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  compactImage: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  compactBody: { flex: 1, gap: 4, paddingRight: spacing.xs },
  compactTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
});
