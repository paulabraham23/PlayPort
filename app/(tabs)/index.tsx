import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, layout, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore, useCartCount } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ensureLoggedIn } from '@/utils/authGate';

const CARD_GAP = 16;

export default function HomeScreen() {
  const { horizontalPadding } = useResponsive();
  const cartCount = useCartCount();
  const [viewport, setViewport] = useState(0);
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

  const cartInset = cartCount > 0 ? layout.floatingCartHeight + 20 : 0;
  const visible = Math.max(viewport - cartInset, 0);
  const cardHeight = visible > 0 ? (visible - CARD_GAP) / 1.5 : 0;
  const stride = cardHeight + CARD_GAP;

  return (
    <Screen showCart showFloatingCart showSearch>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => setViewport(event.nativeEvent.layout.height)}
        snapToInterval={stride > 0 ? stride : undefined}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: cardHeight > 0 ? Math.max(visible - cardHeight, spacing.lg) : spacing.huge,
          backgroundColor: colors.surfaceAlt,
          flexGrow: 1,
        }}
      >
        {!ready ? (
          <ActivityIndicator color={colors.playportOrange} style={{ marginTop: 24 }} />
        ) : products.length && cardHeight > 0 ? (
          products.map((product) => (
            <View key={product.id} style={{ height: cardHeight, marginBottom: CARD_GAP }}>
              <ProductCard
                fill
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
            </View>
          ))
        ) : products.length ? null : (
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
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
});
