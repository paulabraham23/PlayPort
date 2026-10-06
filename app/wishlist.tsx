import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ensureLoggedIn } from '@/utils/authGate';

export default function WishlistScreen() {
  const { horizontalPadding, gap } = useResponsive();
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const products = useCatalogStore((s) => s.products);
  const saved = products.filter((p) => ids.includes(p.id));
  const cart = useAppStore((s) => s.cart);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const showToast = useFeelStore((s) => s.showToast);

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Wishlist" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding, gap }]}
      >
        {saved.length ? (
          saved.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wished
              onToggleWishlist={() => toggle(product.id)}
              quantityInCart={cart.filter((c) => c.productId === product.id).reduce((n, c) => n + c.quantity, 0)}
              onPress={() => router.push(`/product/${product.id}`)}
              onAdd={(selection) => {
                if (!ensureLoggedIn('/wishlist')) return;
                addProductToCart(product.id, {
                  planId: selection.planId,
                  inventoryUnitId: selection.inventoryUnitId,
                });
                showToast(`Added ${product.shortName}`);
              }}
            />
          ))
        ) : (
          <EmptyState
            icon="heart-outline"
            title="Nothing saved yet"
            subtitle="Tap the heart on a product to keep it here."
            actionLabel="Browse products"
            onAction={() => router.push('/(tabs)')}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.huge },
});
