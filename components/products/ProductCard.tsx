import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PressableScale } from '@/components/motion/PressableScale';
import { ValuePop } from '@/components/motion/ValuePop';
import { colors, fonts, radii, shadows, spacing, typeScale } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import type { Product, RentalDurationId } from '@/types';

interface Props {
  product: Product;
  durationId?: RentalDurationId;
  onPress?: () => void;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  quantityInCart?: number;
  onRent?: () => void;
  compact?: boolean;
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
      <Ionicons name="star" size={11} color={colors.warning} />
      <Text style={styles.ratingText}>
        {rating.toFixed(1)} · {count}+
      </Text>
    </View>
  );
}

function ZoomImage({ uri, style }: { uri: string; style: object }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // subtle idle “alive” drift
    const loop = () => {
      scale.value = withTiming(1.04, { duration: 6000 }, () => {
        scale.value = withTiming(1, { duration: 6000 });
      });
    };
    loop();
    const id = setInterval(loop, 12000);
    return () => clearInterval(id);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <Image source={{ uri }} style={style} contentFit="cover" />
    </Animated.View>
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
          <Text style={styles.unitChip}>1 kit · {durationId}</Text>
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
    <Animated.View entering={FadeIn.duration(320)} style={styles.card}>
      <PressableScale accessibilityLabel={product.name} onPress={onPress} scaleTo={0.985}>
        <View style={styles.imageWrap}>
          <ZoomImage uri={product.images[0]} style={styles.image} />
          <View style={styles.etaBadge}>
            <Ionicons name="flash" size={10} color={colors.etaText} />
            <Text style={styles.etaBadgeText}>{product.etaMinutes} min</Text>
          </View>
          <View style={styles.floatingAction}>
            <CartAction
              quantity={quantityInCart}
              productName={product.shortName}
              onAdd={handleAdd}
              onIncrement={onIncrement ?? handleAdd}
              onDecrement={onDecrement}
              floating
            />
          </View>
        </View>
        <View style={styles.body}>
          <RatingRow rating={product.rating} count={product.reviewCount} />
          <Text style={styles.title} numberOfLines={2}>
            {product.shortName}
          </Text>
          <Text style={styles.unitChip}>Setup included · {durationId}</Text>
        </View>
      </PressableScale>
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>{formatINR(price)}</Text>
          {product.compareAtPrice ? (
            <Text style={styles.mrp}>{formatINR(product.compareAtPrice)}</Text>
          ) : null}
        </View>
        {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
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
  },
  imageWrap: {
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: 1.05,
  },
  image: { width: '100%', height: '100%' },
  etaBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(10,10,11,0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(74,222,128,0.25)',
  },
  etaBadgeText: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.caption,
  },
  floatingAction: {
    position: 'absolute',
    right: 10,
    bottom: -16,
    zIndex: 2,
  },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
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
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  price: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    letterSpacing: -0.2,
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
    borderColor: colors.playportOrange,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.sm,
    minWidth: 68,
    alignItems: 'center',
    ...shadows.soft,
  },
  addBtnFloating: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.playportOrange,
    ...shadows.glow,
  },
  addBtnText: {
    color: colors.playportOrange,
    fontFamily: fonts.heading,
    fontSize: typeScale.body,
    letterSpacing: 0.8,
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
    borderRadius: radii.sm,
    minWidth: 92,
    height: 34,
  },
  qtyWrapFloating: {
    backgroundColor: colors.surfaceRaised,
    ...shadows.glow,
  },
  qtyBtn: {
    width: 30,
    height: 34,
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
    backgroundColor: 'rgba(10,10,11,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  compactBody: { flex: 1, gap: 3 },
  compactTitle: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
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
