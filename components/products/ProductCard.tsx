import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { KenBurns } from '@/components/motion/KenBurns';
import { PressableScale } from '@/components/motion/PressableScale';
import { SoftPulse } from '@/components/motion/Pulse';
import { ValuePop } from '@/components/motion/ValuePop';
import { colors, fonts, gradients, radii, shadows, spacing, typeScale, webShadows } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import { cheapestPlanPrice, defaultPlan, normalizeProduct } from '@/utils/rentalPricing';
import type { Product } from '@/types';

interface Props {
  product: Product;
  onPress?: () => void;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  quantityInCart?: number;
  onRent?: () => void;
  compact?: boolean;
  wished?: boolean;
  onToggleWishlist?: () => void;
  /** Stretch the photo so the card fills a fixed frame (home peek layout). */
  fill?: boolean;
}

function CartAction({
  quantity,
  productName,
  onAdd,
  onIncrement,
  onDecrement,
  floating,
}: {
  quantity: number;
  productName: string;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  floating?: boolean;
}) {
  if (quantity > 0) {
    return (
      <Animated.View
        entering={ZoomIn.springify().damping(12).stiffness(280)}
        style={[styles.qtyWrap, floating && styles.qtyWrapFloating]}
      >
        <PressableScale
          accessibilityLabel={`Remove one ${productName}`}
          onPress={onDecrement}
          scaleTo={0.88}
          hitSlop={6}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </PressableScale>
        <ValuePop value={quantity} style={styles.qtyValueWrap}>
          <Text style={styles.qtyValue}>{quantity}</Text>
        </ValuePop>
        <PressableScale
          accessibilityLabel={`Add one ${productName}`}
          onPress={onIncrement}
          scaleTo={0.88}
          hitSlop={6}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </PressableScale>
      </Animated.View>
    );
  }

  return (
    <PressableScale
      accessibilityLabel={`Add ${productName} to cart`}
      onPress={onAdd}
      scaleTo={0.9}
      style={[styles.addBtn, floating && styles.addBtnFloating]}
    >
      <Text style={styles.addBtnText}>ADD</Text>
    </PressableScale>
  );
}

function RatingRow({ rating, count }: { rating: number; count: number }) {
  return (
    <View style={styles.ratingRow}>
      <View style={styles.ratingChip}>
        <Ionicons name="star" size={10} color={colors.warning} />
        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.ratingCount}>{count}+ reviews</Text>
    </View>
  );
}

function ZoomImage({ uri, style }: { uri: string; style: object }) {
  return (
    <KenBurns scaleTo={1.06} duration={12000}>
      <Image source={{ uri }} style={style} contentFit="cover" />
    </KenBurns>
  );
}

export function ProductCard({
  product,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  onRent,
  quantityInCart = 0,
  compact,
  wished,
  onToggleWishlist,
  fill,
}: Props) {
  const normalized = normalizeProduct(product);
  const plan = defaultPlan(normalized);
  const price = cheapestPlanPrice(normalized) ?? plan?.price ?? 0;
  const planLabel = plan?.label ?? 'plan';
  const savings =
    product.compareAtPrice && product.compareAtPrice > price
      ? Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)
      : 0;
  const soldOut = product.availabilityLabel?.startsWith('No');
  const handleAdd = onAdd ?? onRent;

  if (compact) {
    return (
      <PressableScale onPress={onPress} scaleTo={0.98} style={styles.compact}>
        <View style={styles.compactImageWrap}>
          <Image source={{ uri: product.images[0] }} style={styles.compactImage} contentFit="cover" />
          <View style={styles.compactEta}>
            <Text style={styles.etaBadgeText}>{product.etaMinutes}m</Text>
          </View>
        </View>
        <View style={styles.compactBody}>
          <RatingRow rating={product.rating} count={product.reviewCount} />
          <Text style={styles.compactTitle} numberOfLines={2}>
            {product.shortName}
          </Text>
          <Text style={styles.unitChip}>1 kit · from {planLabel}</Text>
          <View style={styles.compactFooter}>
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
      </PressableScale>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      style={[styles.card, fill && styles.cardFill, soldOut && styles.cardDim]}
    >
      <PressableScale
        accessibilityLabel={product.name}
        onPress={onPress}
        scaleTo={0.985}
        style={fill ? styles.fillPress : undefined}
      >
        <View style={[styles.imageWrap, fill ? styles.imageFill : styles.imageRatio]}>
          <ZoomImage uri={product.images[0]} style={styles.image} />
          <LinearGradient
            colors={[...gradients.cardSheen]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.etaBadge}>
            <SoftPulse minOpacity={0.55} scaleAmount={0.08}>
              <Ionicons name="flash" size={10} color={colors.etaText} />
            </SoftPulse>
            <Text style={styles.etaBadgeText}>{product.etaMinutes} min</Text>
          </View>
          {product.popular ? (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>POPULAR</Text>
            </View>
          ) : null}
          {soldOut ? (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          ) : null}
          {onToggleWishlist ? (
            <PressableScale
              accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onPress={onToggleWishlist}
              scaleTo={0.9}
              style={styles.heartBtn}
            >
              <Ionicons
                name={wished ? 'heart' : 'heart-outline'}
                size={18}
                color={wished ? '#E31C5F' : colors.primaryText}
              />
            </PressableScale>
          ) : null}
        </View>
        <View style={styles.body}>
          <RatingRow rating={product.rating} count={product.reviewCount} />
          <Text style={styles.title} numberOfLines={2}>
            {product.shortName}
          </Text>
          <Text style={styles.unitChip}>Setup included · from {planLabel}</Text>
        </View>
      </PressableScale>
      <View style={styles.footer}>
        <View style={styles.priceCol}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(price)}</Text>
            {savings > 0 ? (
              <View style={styles.saveChip}>
                <Text style={styles.saveText}>{savings}% off</Text>
              </View>
            ) : null}
          </View>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
    ...shadows.soft,
    ...Platform.select({
      web: {
        boxShadow: webShadows.soft,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      } as object,
      default: {},
    }),
  },
  cardDim: { opacity: 0.62 },
  cardFill: { flex: 1, height: '100%' },
  fillPress: { flex: 1 },
  imageWrap: {
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
    overflow: 'hidden',
  },
  imageRatio: { aspectRatio: 1.05 },
  imageFill: { flex: 1 },
  image: { width: '100%', height: '100%' },
  sheen: { ...StyleSheet.absoluteFill },
  etaBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(7,8,12,0.78)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(61,214,140,0.28)',
  },
  etaBadgeText: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.ctaPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  popularBadgeText: {
    color: colors.ctaPrimaryText,
    fontFamily: fonts.heading,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  heartBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    ...shadows.soft,
    ...Platform.select({
      web: { boxShadow: webShadows.soft } as object,
      default: {},
    }),
  },
  soldOutBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,8,12,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.small,
    letterSpacing: 1.4,
  },
  floatingAction: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    zIndex: 2,
  },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  ratingValue: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  ratingCount: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.bodyLg,
    lineHeight: 20,
  },
  unitChip: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  priceCol: { flex: 1, minWidth: 0 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    letterSpacing: -0.3,
  },
  saveChip: {
    backgroundColor: colors.successBg,
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveText: {
    color: colors.success,
    fontFamily: fonts.headingMedium,
    fontSize: 10,
  },
  mrp: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  badge: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
    maxWidth: 100,
    textAlign: 'right',
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: colors.orangeBorder,
    backgroundColor: colors.orangeTint,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnFloating: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.playportOrange,
    ...shadows.glow,
  },
  addBtnText: {
    color: colors.playportOrange,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.body,
    letterSpacing: 0.8,
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.orangeBorder,
    backgroundColor: colors.orangeTint,
    borderRadius: radii.sm,
    minWidth: 84,
    height: 36,
  },
  qtyWrapFloating: {
    backgroundColor: colors.surfaceRaised,
    ...shadows.glow,
  },
  qtyBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 18,
  },
  qtyValueWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  qtyValue: {
    textAlign: 'center',
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
  },
  compact: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    ...shadows.soft,
  },
  compactImageWrap: { position: 'relative' },
  compactImage: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  compactEta: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(7,8,12,0.78)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  compactBody: { flex: 1, gap: 3 },
  compactTitle: {
    color: colors.primaryText,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.bodyLg,
    lineHeight: 20,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
