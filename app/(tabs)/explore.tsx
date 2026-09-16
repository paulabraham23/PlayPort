import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, spacing } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';

export default function ExploreScreen() {
  const { horizontalPadding, productColumns, gap } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const catalogProducts = useCatalogStore((s) => s.products);
  const products = catalogProducts.length ? catalogProducts : PRODUCTS;
  const gridCols = Math.max(2, productColumns);

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);
  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>All kits</Text>
          <Text style={styles.subtitle}>{products.length} available at your hub</Text>
        </View>

        <SearchBar
          value=""
          onChangeText={() => {}}
          placeholder="Search kits…"
          onPress={() => router.push('/search')}
        />

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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.huge, gap: spacing.xl, paddingTop: spacing.sm },
  header: { gap: 4 },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 22,
  },
  subtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
