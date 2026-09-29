import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { EnterUp } from '@/components/motion/Enter';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ensureLoggedIn } from '@/utils/authGate';

export default function HomeScreen() {
  const { horizontalPadding, productColumns, gap } = useResponsive();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const showToast = useFeelStore((s) => s.showToast);
  const products = useCatalogStore((s) => s.products);
  const ready = useCatalogStore((s) => s.ready);
  const catalogError = useCatalogStore((s) => s.error);
  const hydrate = useCatalogStore((s) => s.hydrate);
  const wishlist = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);

  const cartItemIdFor = (productId: string) => cart.find((c) => c.productId === productId)?.id;

  const addKit = (product: (typeof products)[0]) => {
    if (!ensureLoggedIn('/(tabs)')) return;
    addProductToCart(product.id);
    showToast(`Added ${product.shortName}`);
  };

  return (
    <Screen showCart showFloatingCart>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: spacing.huge + 120 },
        ]}
      >
        {!ready ? (
          <ActivityIndicator color={colors.playportOrange} style={{ marginTop: 24 }} />
        ) : products.length ? (
          <ResponsiveGrid columns={productColumns} gap={gap}>
            {products.map((product, index) => (
              <EnterUp key={product.id} index={index} style={{ width: '100%' }}>
                <ProductCard
                  product={product}
                  wished={wishlist.includes(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                  quantityInCart={qtyFor(product.id)}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onAdd={() => addKit(product)}
                  onIncrement={() => addKit(product)}
                  onDecrement={() => {
                    if (!isAuthenticated) return;
                    const id = cartItemIdFor(product.id);
                    const qty = qtyFor(product.id);
                    if (id) updateCartQuantity(id, qty - 1);
                  }}
                />
              </EnterUp>
            ))}
          </ResponsiveGrid>
        ) : (
          <EmptyState
            icon="cube-outline"
            title="No products yet"
            subtitle={
              catalogError ||
              'The store catalog is empty. Check back soon or ask ops to add kits in Admin.'
            }
            actionLabel="Retry"
            onAction={() => void hydrate()}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    flexGrow: 1,
  },
});
