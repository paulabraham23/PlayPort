import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import type { Product, RentalDurationId } from '@/types';

interface Props {
  product: Product;
  durationId?: RentalDurationId;
  onPress?: () => void;
  /** Add first unit to cart (Zepto/Blinkit ADD). */
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  quantityInCart?: number;
  /** @deprecated use onAdd */
  onRent?: () => void;
  compact?: boolean;
}

function CartAction({
  quantity,
  productName,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  quantity: number;
  productName: string;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}) {
  if (quantity > 0) {
    return (
      <View style={styles.qtyWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove one ${productName}`}
          onPress={onDecrement}
          style={styles.qtyBtn}
          hitSlop={6}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </Pressable>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add one ${productName}`}
          onPress={onIncrement}
          style={styles.qtyBtn}
          hitSlop={6}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Add ${productName} to cart`}
      onPress={onAdd}
      style={styles.addBtn}
    >
      <Text style={styles.addBtnText}>ADD</Text>
    </Pressable>
  );
}

export function ProductCard({
  product,
  durationId = '12h',
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  onRent,
  quantityInCart = 0,
  compact,
}: Props) {
  const price = product.priceByDuration[durationId];
  const handleAdd = onAdd ?? onRent;

  if (compact) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.compact}>
        <Image source={{ uri: product.images[0] }} style={styles.compactImage} contentFit="cover" />
        <View style={styles.compactBody}>
          <Text style={styles.etaChip}>{product.etaMinutes} mins</Text>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {product.shortName}
          </Text>
          <Text style={styles.unitChip}>1 kit · {durationId}</Text>
          <View style={styles.compactFooter}>
            <Text style={styles.price}>{formatINR(price)}</Text>
            <CartAction
              quantity={quantityInCart}
              productName={product.shortName}
              onAdd={handleAdd}
              onIncrement={onIncrement ?? handleAdd}
              onDecrement={onDecrement}
            />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={product.name} onPress={onPress}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" />
          <View style={styles.etaBadge}>
            <Text style={styles.etaBadgeText}>{product.etaMinutes} mins</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {product.shortName}
          </Text>
          <Text style={styles.unitChip}>1 kit · {durationId}</Text>
        </View>
      </Pressable>
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>{formatINR(price)}</Text>
          {product.compareAtPrice ? (
            <Text style={styles.mrp}>{formatINR(product.compareAtPrice)}</Text>
          ) : null}
        </View>
        <CartAction
          quantity={quantityInCart}
          productName={product.shortName}
          onAdd={handleAdd}
          onIncrement={onIncrement ?? handleAdd}
          onDecrement={onDecrement}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  imageWrap: {
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: { width: '100%', height: 140 },
  etaBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.etaBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  etaBadgeText: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: 4 },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  unitChip: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  price: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 15,
  },
  mrp: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.sm,
    minWidth: 64,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
    borderRadius: radii.sm,
    minWidth: 88,
    height: 32,
  },
  qtyBtn: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 18,
  },
  qtyValue: {
    flex: 1,
    textAlign: 'center',
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  compact: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  compactImage: {
    width: 84,
    height: 84,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  compactBody: { flex: 1, gap: 2 },
  compactTitle: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  etaChip: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    marginBottom: 2,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});
