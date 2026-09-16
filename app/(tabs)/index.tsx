import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { CATEGORIES, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';

const SHORTCUTS = [
  { id: 'gaming', label: 'Consoles' },
  { id: 'vr', label: 'VR' },
  { id: 'racing', label: 'Racing' },
  { id: 'movie-nights', label: 'Cinema' },
];

export default function HomeScreen() {
  const { horizontalPadding, productColumns, gap } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const catalogProducts = useCatalogStore((s) => s.products);
  const catalogCategories = useCatalogStore((s) => s.categories);
  const products = catalogProducts.length ? catalogProducts : PRODUCTS;
  const categories = catalogCategories.length ? catalogCategories : CATEGORIES;
  const gridCols = Math.max(2, productColumns);

  const qtyFor = (productId: string) =>
    cart
      .filter((c) => c.productId === productId)
      .reduce((sum, c) => sum + c.quantity, 0);

  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <SearchBar value="" onChangeText={() => {}} onPress={() => router.push('/search')} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {SHORTCUTS.map((chip) => (
            <Pressable
              key={chip.id}
              accessibilityRole="button"
              onPress={() => router.push(`/category/${chip.id}`)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.banner}>
          <Text style={styles.bannerKicker}>Tonight</Text>
          <Text style={styles.bannerTitle}>Entertainment kits in 30–45 mins</Text>
          <Text style={styles.bannerSub}>Sanitized · Setup included · Zero deposit</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bestsellers</Text>
            <Pressable onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <ResponsiveGrid columns={gridCols} gap={gap}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={qtyFor(product.id)}
                onPress={() => router.push(`/product/${product.id}`)}
                onAdd={() => addProductToCart(product.id, '12h')}
                onIncrement={() => addProductToCart(product.id, '12h')}
                onDecrement={() => {
                  const id = cartItemIdFor(product.id);
                  const qty = qtyFor(product.id);
                  if (id) updateCartQuantity(id, qty - 1);
                }}
              />
            ))}
          </ResponsiveGrid>
        </View>

        {categories.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop by category</Text>
            <ResponsiveGrid columns={4} gap={10}>
              {categories.slice(0, 8).map((cat) => (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/category/${cat.id}`)}
                  style={styles.catTile}
                >
                  <Text style={styles.catLabel} numberOfLines={1}>
                    {cat.shortName}
                  </Text>
                </Pressable>
              ))}
            </ResponsiveGrid>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.huge, gap: spacing.xl, paddingTop: spacing.sm },
  chips: { gap: 8, paddingRight: 4 },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  chipText: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  banner: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: 4,
  },
  bannerKicker: {
    color: colors.etaText,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  bannerTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  bannerSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  seeAll: {
    color: colors.playportOrange,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  catTile: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  catLabel: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    textAlign: 'center',
  },
});
